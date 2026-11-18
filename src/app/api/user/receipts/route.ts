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

    const receipts = await sql`
      SELECT
        id,
        receipt_number,
        booking_reference,
        customer_name,
        customer_phone,
        customer_email,
        service_name,
        category_title,
        appointment_date,
        time_slot,
        base_amount,
        discount_percentage,
        discount_amount,
        points_used,
        final_payable,
        payment_status,
        payment_method,
        sent_via_email,
        created_at
      FROM receipts
      WHERE customer_id = ${session.userId}
         OR (customer_email IS NOT NULL AND LOWER(customer_email) = LOWER(${user.email || ""}))
         OR (${cleanMobile !== ""} AND RIGHT(customer_phone, 10) = ${cleanMobile})
      ORDER BY created_at DESC;
    `;

    return NextResponse.json({ success: true, receipts });
  } catch (error) {
    console.error("User receipts error:", error);
    return NextResponse.json({ success: false, message: "Failed to load receipts" }, { status: 500 });
  }
}
