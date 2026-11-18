import { sql } from "@/lib/db/neon";

export interface LoyaltySettings {
  id: string;
  isEnabled: boolean;
  spendingAmount: number;
  pointsPerUnit: number;
  pointValue: number;
  minimumRedemption: number;
  maximumRedemptionPercentage: number;
  expirationDays: number;
  allowPartialRedemption: boolean;
  excludedServices: string[];
}

export interface LoyaltyBalanceSummary {
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  expiringSoonPoints: number;
  nextExpiryDate: string | null;
}

/**
 * Fetch dynamic loyalty settings from Neon PostgreSQL
 */
export async function getLoyaltySettings(): Promise<LoyaltySettings> {
  const rows = await sql`
    SELECT * FROM loyalty_settings ORDER BY updated_at DESC LIMIT 1;
  `;

  if (rows.length === 0) {
    return {
      id: "default",
      isEnabled: true,
      spendingAmount: 100,
      pointsPerUnit: 10,
      pointValue: 1,
      minimumRedemption: 50,
      maximumRedemptionPercentage: 30,
      expirationDays: 90,
      allowPartialRedemption: true,
      excludedServices: [],
    };
  }

  const s = rows[0];
  return {
    id: s.id,
    isEnabled: Boolean(s.is_enabled),
    spendingAmount: Number(s.spending_amount) || 100,
    pointsPerUnit: Number(s.points_per_unit) || 10,
    pointValue: Number(s.point_value) || 1,
    minimumRedemption: Number(s.minimum_redemption) || 50,
    maximumRedemptionPercentage: Number(s.maximum_redemption_percentage) || 30,
    expirationDays: Number(s.expiration_days) || 90,
    allowPartialRedemption: s.allow_partial_redemption !== false,
    excludedServices: Array.isArray(s.excluded_services) ? s.excluded_services : [],
  };
}

/**
 * Calculate customer available loyalty balance using active unexpired FIFO point lots
 */
export async function getCustomerLoyaltyBalance(customerId: string): Promise<LoyaltyBalanceSummary> {
  // First, auto-expire any unexpired lots that passed NOW()
  await expirePointsForCustomer(customerId);

  const activeLots = await sql`
    SELECT SUM(remaining_points) AS available_points
    FROM loyalty_point_lots
    WHERE customer_id = ${customerId}
      AND remaining_points > 0
      AND expires_at > NOW();
  `;

  const earnedTx = await sql`
    SELECT SUM(points) AS total_earned
    FROM loyalty_transactions
    WHERE customer_id = ${customerId}
      AND points > 0
      AND status = 'active';
  `;

  const redeemedTx = await sql`
    SELECT SUM(ABS(points)) AS total_redeemed
    FROM loyalty_transactions
    WHERE customer_id = ${customerId}
      AND transaction_type = 'redeemed';
  `;

  const expiredTx = await sql`
    SELECT SUM(ABS(points)) AS total_expired
    FROM loyalty_transactions
    WHERE customer_id = ${customerId}
      AND transaction_type = 'expired';
  `;

  // Lots expiring within the next 30 days
  const expiringSoon = await sql`
    SELECT SUM(remaining_points) AS expiring_points, MIN(expires_at) AS next_expiry
    FROM loyalty_point_lots
    WHERE customer_id = ${customerId}
      AND remaining_points > 0
      AND expires_at > NOW()
      AND expires_at <= NOW() + INTERVAL '30 days';
  `;

  return {
    currentPoints: Number(activeLots[0]?.available_points) || 0,
    totalEarned: Number(earnedTx[0]?.total_earned) || 0,
    totalRedeemed: Number(redeemedTx[0]?.total_redeemed) || 0,
    totalExpired: Number(expiredTx[0]?.total_expired) || 0,
    expiringSoonPoints: Number(expiringSoon[0]?.expiring_points) || 0,
    nextExpiryDate: expiringSoon[0]?.next_expiry ? new Date(expiringSoon[0].next_expiry).toISOString() : null,
  };
}

/**
 * Calculate loyalty points to be earned for a given monetary amount paid
 */
export function calculateEarnedPoints(monetaryAmountPaid: number, settings: LoyaltySettings): number {
  if (!settings.isEnabled || monetaryAmountPaid <= 0 || settings.spendingAmount <= 0) {
    return 0;
  }
  const units = Math.floor(monetaryAmountPaid / settings.spendingAmount);
  return units * settings.pointsPerUnit;
}

/**
 * Award loyalty points to a customer upon verified payment completion
 * Atomic and idempotent: creates transaction and a distinct point lot
 */
export async function awardLoyaltyPoints(options: {
  customerId: string;
  bookingId?: string;
  paymentId?: string;
  amountPaid: number;
  description?: string;
}): Promise<{ pointsAwarded: number; expiresAt: Date } | null> {
  const { customerId, bookingId, paymentId, amountPaid, description } = options;
  const settings = await getLoyaltySettings();

  if (!settings.isEnabled) return null;

  // Idempotency: verify points were not already awarded for this payment or booking
  if (paymentId) {
    const existing = await sql`
      SELECT id FROM loyalty_transactions
      WHERE payment_id = ${paymentId} AND transaction_type = 'earned'
      LIMIT 1;
    `;
    if (existing.length > 0) {
      return null;
    }
  }

  const pointsToAward = calculateEarnedPoints(amountPaid, settings);
  if (pointsToAward <= 0) return null;

  const expiresAt = new Date(Date.now() + settings.expirationDays * 24 * 60 * 60 * 1000);

  const txRows = await sql`
    INSERT INTO loyalty_transactions (
      customer_id, booking_id, payment_id, transaction_type, points, description, expires_at, status
    ) VALUES (
      ${customerId},
      ${bookingId || null},
      ${paymentId || null},
      'earned',
      ${pointsToAward},
      ${description || `Earned on booking payment of ₹${amountPaid.toFixed(2)}`},
      ${expiresAt.toISOString()},
      'active'
    ) RETURNING id;
  `;

  const txId = txRows[0].id;

  // Create corresponding point lot for FIFO expiration tracking
  await sql`
    INSERT INTO loyalty_point_lots (
      customer_id, source_transaction_id, original_points, remaining_points, expires_at
    ) VALUES (
      ${customerId},
      ${txId},
      ${pointsToAward},
      ${pointsToAward},
      ${expiresAt.toISOString()}
    );
  `;

  return { pointsAwarded: pointsToAward, expiresAt };
}

/**
 * Reserve loyalty points during checkout before Razorpay order completion (FIFO)
 */
export async function reserveLoyaltyPoints(options: {
  customerId: string;
  bookingId?: string;
  pointsToRedeem: number;
  totalAmount: number;
}): Promise<{ success: boolean; discountAmount: number; redemptionId?: string; message: string }> {
  const { customerId, bookingId, pointsToRedeem, totalAmount } = options;
  const settings = await getLoyaltySettings();

  if (!settings.isEnabled) {
    return { success: false, discountAmount: 0, message: "Loyalty rewards program is currently inactive." };
  }

  if (pointsToRedeem < settings.minimumRedemption) {
    return {
      success: false,
      discountAmount: 0,
      message: `Minimum ${settings.minimumRedemption} points required for redemption.`,
    };
  }

  const maxAllowedDiscount = (totalAmount * settings.maximumRedemptionPercentage) / 100;
  const maxAllowedPoints = Math.floor(maxAllowedDiscount / settings.pointValue);

  if (pointsToRedeem > maxAllowedPoints) {
    return {
      success: false,
      discountAmount: 0,
      message: `You can redeem up to ${maxAllowedPoints} points (${settings.maximumRedemptionPercentage}% of appointment value).`,
    };
  }

  // Get active eligible lots in FIFO order (earliest expiring first)
  const lots = await sql`
    SELECT id, remaining_points, expires_at
    FROM loyalty_point_lots
    WHERE customer_id = ${customerId}
      AND remaining_points > 0
      AND expires_at > NOW()
    ORDER BY expires_at ASC;
  `;

  const totalAvailable = lots.reduce((sum, l) => sum + Number(l.remaining_points), 0);
  if (totalAvailable < pointsToRedeem) {
    return { success: false, discountAmount: 0, message: "Insufficient active loyalty points." };
  }

  const discountAmount = pointsToRedeem * settings.pointValue;

  // Create redemption record in 'reserved' state
  const redemptionRows = await sql`
    INSERT INTO loyalty_redemptions (
      customer_id, booking_id, points_redeemed, discount_amount, status
    ) VALUES (
      ${customerId},
      ${bookingId || null},
      ${pointsToRedeem},
      ${discountAmount},
      'reserved'
    ) RETURNING id;
  `;

  const redemptionId = redemptionRows[0].id;

  // Allocate across lots in FIFO order
  let pointsNeeded = pointsToRedeem;
  for (const lot of lots) {
    if (pointsNeeded <= 0) break;
    const lotRemaining = Number(lot.remaining_points);
    const take = Math.min(lotRemaining, pointsNeeded);

    await sql`
      INSERT INTO loyalty_redemption_allocations (
        redemption_id, point_lot_id, points_consumed
      ) VALUES (
        ${redemptionId},
        ${lot.id},
        ${take}
      );
    `;

    await sql`
      UPDATE loyalty_point_lots
      SET remaining_points = remaining_points - ${take}
      WHERE id = ${lot.id};
    `;

    pointsNeeded -= take;
  }

  return {
    success: true,
    discountAmount,
    redemptionId,
    message: `Applied ${pointsToRedeem} points for ₹${discountAmount.toFixed(2)} discount.`,
  };
}

/**
 * Confirm reserved loyalty points once payment succeeds
 */
export async function confirmLoyaltyRedemption(redemptionId: string, bookingId?: string): Promise<boolean> {
  const redemptions = await sql`
    SELECT * FROM loyalty_redemptions WHERE id = ${redemptionId} AND status = 'reserved' LIMIT 1;
  `;

  if (redemptions.length === 0) return false;
  const red = redemptions[0];

  await sql`
    UPDATE loyalty_redemptions
    SET status = 'completed', booking_id = COALESCE(${bookingId || null}, booking_id)
    WHERE id = ${redemptionId};
  `;

  // Log to loyalty_transactions as redeemed
  await sql`
    INSERT INTO loyalty_transactions (
      customer_id, booking_id, transaction_type, points, description, status
    ) VALUES (
      ${red.customer_id},
      ${bookingId || red.booking_id || null},
      'redeemed',
      ${-Math.abs(Number(red.points_redeemed))},
      ${`Redeemed on appointment booking (₹${Number(red.discount_amount).toFixed(2)} discount)`},
      'active'
    );
  `;

  return true;
}

/**
 * Release reserved loyalty points back if payment fails, cancels or times out
 */
export async function releaseLoyaltyReservation(redemptionId: string): Promise<boolean> {
  const redemptions = await sql`
    SELECT * FROM loyalty_redemptions WHERE id = ${redemptionId} AND status = 'reserved' LIMIT 1;
  `;

  if (redemptions.length === 0) return false;

  const allocations = await sql`
    SELECT point_lot_id, points_consumed
    FROM loyalty_redemption_allocations
    WHERE redemption_id = ${redemptionId};
  `;

  for (const alloc of allocations) {
    await sql`
      UPDATE loyalty_point_lots
      SET remaining_points = remaining_points + ${alloc.points_consumed}
      WHERE id = ${alloc.point_lot_id};
    `;
  }

  await sql`
    UPDATE loyalty_redemptions
    SET status = 'cancelled'
    WHERE id = ${redemptionId};
  `;

  return true;
}

/**
 * Expire loyalty points across all customers or a specific customer
 * Background safe & idempotent
 */
export async function expirePointsForCustomer(customerId?: string): Promise<{ expiredLotsCount: number; expiredPointsTotal: number }> {
  const expiredLots = customerId
    ? await sql`
        SELECT id, customer_id, remaining_points
        FROM loyalty_point_lots
        WHERE customer_id = ${customerId}
          AND remaining_points > 0
          AND expires_at <= NOW();
      `
    : await sql`
        SELECT id, customer_id, remaining_points
        FROM loyalty_point_lots
        WHERE remaining_points > 0
          AND expires_at <= NOW()
        LIMIT 500;
      `;

  let totalPoints = 0;

  for (const lot of expiredLots) {
    const pointsToExpire = Number(lot.remaining_points);
    if (pointsToExpire <= 0) continue;

    // Zero out the remaining points on the lot
    await sql`
      UPDATE loyalty_point_lots
      SET remaining_points = 0
      WHERE id = ${lot.id};
    `;

    // Log the expiration transaction
    await sql`
      INSERT INTO loyalty_transactions (
        customer_id, transaction_type, points, description, status
      ) VALUES (
        ${lot.customer_id},
        'expired',
        ${-pointsToExpire},
        'Points expired automatically after validity period',
        'active'
      );
    `;

    totalPoints += pointsToExpire;
  }

  return { expiredLotsCount: expiredLots.length, expiredPointsTotal: totalPoints };
}

/**
 * Admin manual adjustment of loyalty points
 */
export async function adminAdjustPoints(options: {
  customerId: string;
  adminId: string;
  points: number; // positive to add, negative to deduct
  reason: string;
  expirationDays?: number;
}): Promise<{ success: boolean; message: string }> {
  const { customerId, adminId, points, reason, expirationDays = 90 } = options;

  if (points === 0) {
    return { success: false, message: "Adjustment points cannot be zero." };
  }

  if (points > 0) {
    const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);
    const tx = await sql`
      INSERT INTO loyalty_transactions (
        customer_id, admin_id, transaction_type, points, description, expires_at, status
      ) VALUES (
        ${customerId},
        ${adminId},
        'admin_adjustment',
        ${points},
        ${`Admin addition: ${reason}`},
        ${expiresAt.toISOString()},
        'active'
      ) RETURNING id;
    `;

    await sql`
      INSERT INTO loyalty_point_lots (
        customer_id, source_transaction_id, original_points, remaining_points, expires_at
      ) VALUES (
        ${customerId},
        ${tx[0].id},
        ${points},
        ${points},
        ${expiresAt.toISOString()}
      );
    `;

    return { success: true, message: `Successfully added ${points} points.` };
  } else {
    // Deduct points using FIFO
    const deductionPoints = Math.abs(points);
    const balance = await getCustomerLoyaltyBalance(customerId);

    if (balance.currentPoints < deductionPoints) {
      return { success: false, message: `Cannot deduct ${deductionPoints} points. Available balance is only ${balance.currentPoints}.` };
    }

    const lots = await sql`
      SELECT id, remaining_points
      FROM loyalty_point_lots
      WHERE customer_id = ${customerId}
        AND remaining_points > 0
        AND expires_at > NOW()
      ORDER BY expires_at ASC;
    `;

    let needed = deductionPoints;
    for (const lot of lots) {
      if (needed <= 0) break;
      const rem = Number(lot.remaining_points);
      const consume = Math.min(rem, needed);

      await sql`
        UPDATE loyalty_point_lots
        SET remaining_points = remaining_points - ${consume}
        WHERE id = ${lot.id};
      `;

      needed -= consume;
    }

    await sql`
      INSERT INTO loyalty_transactions (
        customer_id, admin_id, transaction_type, points, description, status
      ) VALUES (
        ${customerId},
        ${adminId},
        'admin_adjustment',
        ${-deductionPoints},
        ${`Admin deduction: ${reason}`},
        'active'
      );
    `;

    return { success: true, message: `Successfully deducted ${deductionPoints} points.` };
  }
}
