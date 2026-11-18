import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  try {
    const payments = await sql`
      SELECT
        p.id,
        p.razorpay_order_id,
        p.razorpay_payment_id,
        p.amount,
        p.currency,
        p.payment_status,
        p.signature_verified,
        p.payment_method,
        p.created_at,
        b.booking_reference,
        b.service_name,
        b.appointment_date,
        b.time_slot
      FROM payments p
      LEFT JOIN bookings b ON b.id = p.booking_id
      WHERE p.customer_id = ${session.userId}
      ORDER BY p.created_at DESC;
    `;

    return NextResponse.json({
      success: true,
      payments,
    });
  } catch (error) {
    console.error("User payments API error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to load payment history" },
      { status: 500 }
    );
  }
}
