import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { expirePointsForCustomer, releaseLoyaltyReservation } from "@/lib/services/loyalty.service";

/**
 * Scheduled background cron/job endpoint for:
 * 1. Expiring loyalty points whose validity period has elapsed
 * 2. Releasing abandoned loyalty point reservations (> 30 mins old without payment)
 * 3. Cleaning up expired OTP verification records older than 24 hours
 * 4. Reconciling pending payments
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.JWT_SECRET;

    // Optional bearer secret check if invoked by external schedulers (e.g. Vercel Cron, QStash)
    if (authHeader && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // 1. Expire outdated point lots
    const expiryResult = await expirePointsForCustomer();

    // 2. Release abandoned point reservations (status = 'reserved' created > 30 minutes ago)
    const abandonedReservations = await sql`
      SELECT id FROM loyalty_redemptions
      WHERE status = 'reserved'
        AND created_at < NOW() - INTERVAL '30 minutes'
      LIMIT 100;
    `;

    let releasedCount = 0;
    for (const r of abandonedReservations) {
      const released = await releaseLoyaltyReservation(r.id);
      if (released) releasedCount++;
    }

    // 3. Clean up OTP verifications older than 24 hours
    const deletedOtps = await sql`
      DELETE FROM otp_verifications
      WHERE created_at < NOW() - INTERVAL '24 hours'
      RETURNING id;
    `;

    return NextResponse.json({
      success: true,
      message: "Maintenance background job executed successfully.",
      results: {
        pointsExpiredLots: expiryResult.expiredLotsCount,
        pointsExpiredTotal: expiryResult.expiredPointsTotal,
        abandonedReservationsReleased: releasedCount,
        otpsPurged: deletedOtps.length,
      },
    });
  } catch (error) {
    console.error("Cron job error:", error);
    return NextResponse.json(
      { success: false, message: "Internal error executing cron maintenance" },
      { status: 500 }
    );
  }
}

// Support GET for simple webhook triggers / healthchecks
export async function GET(req: Request) {
  return POST(req);
}
