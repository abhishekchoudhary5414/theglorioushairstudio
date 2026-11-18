import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";
import { getCustomerLoyaltyBalance } from "@/lib/services/loyalty.service";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const summary = await getCustomerLoyaltyBalance(session.userId);

    const transactions = await sql`
      SELECT id, transaction_type, points, description, expires_at, status, created_at
      FROM loyalty_transactions
      WHERE customer_id = ${session.userId}
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    const activeLots = await sql`
      SELECT id, original_points, remaining_points, expires_at, created_at
      FROM loyalty_point_lots
      WHERE customer_id = ${session.userId}
        AND remaining_points > 0
        AND expires_at > NOW()
      ORDER BY expires_at ASC;
    `;

    return NextResponse.json({
      success: true,
      summary,
      transactions,
      activeLots,
    });
  } catch (error) {
    console.error("User loyalty API error:", error);
    return NextResponse.json({ success: false, message: "Failed to load loyalty rewards" }, { status: 500 });
  }
}
