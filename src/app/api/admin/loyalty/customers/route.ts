import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";
import { adminAdjustPoints, getCustomerLoyaltyBalance } from "@/lib/services/loyalty.service";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";

    let customers;
    if (search) {
      customers = await sql`
        SELECT
          u.id,
          u.name,
          u.email,
          u.mobile_number,
          u.phone,
          u.created_at,
          COALESCE(SUM(lpl.remaining_points), 0)::int AS current_points,
          (
            SELECT COALESCE(SUM(lt.points), 0)::int
            FROM loyalty_transactions lt
            WHERE lt.customer_id = u.id AND lt.points > 0
          ) AS total_earned,
          (
            SELECT COALESCE(SUM(ABS(lt2.points)), 0)::int
            FROM loyalty_transactions lt2
            WHERE lt2.customer_id = u.id AND lt2.transaction_type = 'redeemed'
          ) AS total_redeemed
        FROM users u
        LEFT JOIN loyalty_point_lots lpl ON lpl.customer_id = u.id AND lpl.remaining_points > 0 AND lpl.expires_at > NOW()
        WHERE u.role != 'admin'
          AND (
            LOWER(u.name) LIKE LOWER(${`%${search}%`})
            OR LOWER(u.email) LIKE LOWER(${`%${search}%`})
            OR LOWER(COALESCE(u.mobile_number, u.phone, '')) LIKE LOWER(${`%${search}%`})
          )
        GROUP BY u.id, u.name, u.email, u.mobile_number, u.phone, u.created_at
        ORDER BY current_points DESC, u.created_at DESC
        LIMIT 100;
      `;
    } else {
      customers = await sql`
        SELECT
          u.id,
          u.name,
          u.email,
          u.mobile_number,
          u.phone,
          u.created_at,
          COALESCE(SUM(lpl.remaining_points), 0)::int AS current_points,
          (
            SELECT COALESCE(SUM(lt.points), 0)::int
            FROM loyalty_transactions lt
            WHERE lt.customer_id = u.id AND lt.points > 0
          ) AS total_earned,
          (
            SELECT COALESCE(SUM(ABS(lt2.points)), 0)::int
            FROM loyalty_transactions lt2
            WHERE lt2.customer_id = u.id AND lt2.transaction_type = 'redeemed'
          ) AS total_redeemed
        FROM users u
        LEFT JOIN loyalty_point_lots lpl ON lpl.customer_id = u.id AND lpl.remaining_points > 0 AND lpl.expires_at > NOW()
        WHERE u.role != 'admin'
        GROUP BY u.id, u.name, u.email, u.mobile_number, u.phone, u.created_at
        ORDER BY current_points DESC, u.created_at DESC
        LIMIT 100;
      `;
    }

    return NextResponse.json({ success: true, customers });
  } catch (error) {
    console.error("Admin loyalty customers GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch customer loyalty balances" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { customerId, points, reason, expirationDays } = await req.json();

    if (!customerId || points === undefined || !reason) {
      return NextResponse.json(
        { success: false, message: "Customer ID, points adjustment, and reason are required." },
        { status: 400 }
      );
    }

    const result = await adminAdjustPoints({
      customerId,
      adminId: user.userId,
      points: Number(points),
      reason: String(reason).trim(),
      expirationDays: Number(expirationDays) || 90,
    });

    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    const newBalance = await getCustomerLoyaltyBalance(customerId);

    return NextResponse.json({
      success: true,
      message: result.message,
      balance: newBalance,
    });
  } catch (error) {
    console.error("Admin adjust points POST error:", error);
    return NextResponse.json({ success: false, message: "Failed to adjust points" }, { status: 500 });
  }
}
