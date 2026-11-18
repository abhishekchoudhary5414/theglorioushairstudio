import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";
import { getLoyaltySettings } from "@/lib/services/loyalty.service";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await getLoyaltySettings();

    // Summary analytics
    const totalIssued = await sql`
      SELECT SUM(points) AS total FROM loyalty_transactions WHERE transaction_type IN ('earned', 'admin_adjustment') AND points > 0;
    `;
    const totalRedeemed = await sql`
      SELECT SUM(ABS(points)) AS total FROM loyalty_transactions WHERE transaction_type = 'redeemed';
    `;
    const totalExpired = await sql`
      SELECT SUM(ABS(points)) AS total FROM loyalty_transactions WHERE transaction_type = 'expired';
    `;
    const outstandingLiability = await sql`
      SELECT SUM(remaining_points) AS total FROM loyalty_point_lots WHERE remaining_points > 0 AND expires_at > NOW();
    `;
    const enrolledCustomers = await sql`
      SELECT COUNT(DISTINCT customer_id) AS total FROM loyalty_transactions;
    `;

    // Monthly stats (current year)
    const monthlyStats = await sql`
      SELECT
        TO_CHAR(created_at, 'Mon YYYY') AS month,
        DATE_TRUNC('month', created_at) AS month_date,
        SUM(CASE WHEN points > 0 THEN points ELSE 0 END) AS points_earned,
        SUM(CASE WHEN transaction_type = 'redeemed' THEN ABS(points) ELSE 0 END) AS points_redeemed
      FROM loyalty_transactions
      WHERE created_at >= NOW() - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at), TO_CHAR(created_at, 'Mon YYYY')
      ORDER BY month_date ASC;
    `;

    return NextResponse.json({
      success: true,
      settings,
      analytics: {
        totalIssued: Number(totalIssued[0]?.total) || 0,
        totalRedeemed: Number(totalRedeemed[0]?.total) || 0,
        totalExpired: Number(totalExpired[0]?.total) || 0,
        outstandingPoints: Number(outstandingLiability[0]?.total) || 0,
        enrolledCustomers: Number(enrolledCustomers[0]?.total) || 0,
        monthlyStats,
      },
    });
  } catch (error) {
    console.error("Admin loyalty GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to load loyalty settings" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      isEnabled,
      spendingAmount,
      pointsPerUnit,
      pointValue,
      minimumRedemption,
      maximumRedemptionPercentage,
      expirationDays,
      allowPartialRedemption,
      excludedServices,
    } = body;

    const updated = await sql`
      UPDATE loyalty_settings
      SET is_enabled = ${Boolean(isEnabled)},
          spending_amount = ${Number(spendingAmount)},
          points_per_unit = ${Number(pointsPerUnit)},
          point_value = ${Number(pointValue)},
          minimum_redemption = ${Number(minimumRedemption)},
          maximum_redemption_percentage = ${Number(maximumRedemptionPercentage)},
          expiration_days = ${Number(expirationDays)},
          allow_partial_redemption = ${Boolean(allowPartialRedemption)},
          excluded_services = ${JSON.stringify(excludedServices || [])}::jsonb,
          updated_at = NOW()
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      message: "Loyalty configuration updated successfully.",
      settings: updated[0],
    });
  } catch (error) {
    console.error("Admin loyalty PUT error:", error);
    return NextResponse.json({ success: false, message: "Failed to update loyalty settings" }, { status: 500 });
  }
}
