import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const userRow = await sql`
      SELECT email, phone, mobile_number FROM users WHERE id = ${session.userId} LIMIT 1;
    `;
    const user = userRow[0] || {};
    const cleanMobile = user.mobile_number || (user.phone ? user.phone.slice(-10) : "");

    const appointments = await sql`
      SELECT
        b.id,
        b.booking_reference,
        b.service_id,
        b.service_name,
        b.stylist_id,
        b.stylist_name,
        b.branch_name,
        b.appointment_date,
        b.time_slot,
        b.customer_name,
        b.customer_phone,
        b.customer_email,
        b.price_inr,
        b.total_amount,
        b.points_redeemed,
        b.discount_amount,
        b.payable_amount,
        b.payment_status,
        b.status,
        b.created_at,
        p.razorpay_payment_id,
        p.razorpay_order_id,
        p.payment_status AS p_status
      FROM bookings b
      LEFT JOIN payments p ON p.booking_id = b.id AND p.payment_status = 'captured'
      WHERE b.customer_id = ${session.userId}
         OR (b.customer_email IS NOT NULL AND LOWER(b.customer_email) = LOWER(${user.email || ""}))
         OR (${cleanMobile !== ""} AND RIGHT(b.customer_phone, 10) = ${cleanMobile})
      ORDER BY b.appointment_date DESC, b.created_at DESC;
    `;

    return NextResponse.json({
      success: true,
      appointments,
    });
  } catch (error) {
    console.error("User appointments API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load appointments" },
      { status: 500 }
    );
  }
}
