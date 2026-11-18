import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/jwt";
import { awardLoyaltyPoints } from "@/lib/services/loyalty.service";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    let bookings;
    if (search && status) {
      bookings = await sql`
        SELECT *
        FROM bookings
        WHERE (
          LOWER(customer_name) LIKE LOWER(${`%${search}%`})
          OR LOWER(customer_phone) LIKE LOWER(${`%${search}%`})
          OR LOWER(booking_reference) LIKE LOWER(${`%${search}%`})
          OR LOWER(service_name) LIKE LOWER(${`%${search}%`})
        )
        AND status = ${status}
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else if (search) {
      bookings = await sql`
        SELECT *
        FROM bookings
        WHERE (
          LOWER(customer_name) LIKE LOWER(${`%${search}%`})
          OR LOWER(customer_phone) LIKE LOWER(${`%${search}%`})
          OR LOWER(booking_reference) LIKE LOWER(${`%${search}%`})
          OR LOWER(service_name) LIKE LOWER(${`%${search}%`})
        )
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else if (status) {
      bookings = await sql`
        SELECT *
        FROM bookings
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else {
      bookings = await sql`
        SELECT *
        FROM bookings
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Admin bookings GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status, payment_status, payment_method, discount_amount } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: "Booking ID is required." }, { status: 400 });
    }

    // 1. Fetch current booking record
    const existing = await sql`
      SELECT id, booking_reference, customer_id, customer_email, customer_phone,
             service_name, price_inr, total_amount, payable_amount, discount_amount, points_redeemed,
             status, payment_status, payment_method
      FROM bookings
      WHERE id = ${id}
      LIMIT 1;
    `;

    if (existing.length === 0) {
      return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
    }

    const currentBooking = existing[0];
    const prevPaymentStatus = currentBooking.payment_status;

    const newStatus = status !== undefined ? status : currentBooking.status;
    const newPaymentStatus = payment_status !== undefined ? payment_status : currentBooking.payment_status;
    const newPaymentMethod = payment_method !== undefined ? payment_method : currentBooking.payment_method;

    // Handle optional discount update
    let newDiscount = currentBooking.discount_amount !== null ? Number(currentBooking.discount_amount) : 0;
    let newPayable = currentBooking.payable_amount !== null ? Number(currentBooking.payable_amount) : Number(currentBooking.total_amount || currentBooking.price_inr || 0);

    if (discount_amount !== undefined) {
      newDiscount = Math.max(0, Number(discount_amount) || 0);
      const baseTotal = Number(currentBooking.total_amount || currentBooking.price_inr || 0);
      newPayable = Math.max(0, baseTotal - newDiscount);
    }

    // 2. Update booking in database
    const updated = await sql`
      UPDATE bookings
      SET status = ${newStatus},
          payment_status = ${newPaymentStatus},
          payment_method = ${newPaymentMethod},
          discount_amount = ${newDiscount},
          payable_amount = ${newPayable}
      WHERE id = ${id}
      RETURNING *;
    `;

    const updatedBooking = updated[0];

    // 3. Resolve customer ID if booking didn't have one initially
    let customerId = updatedBooking.customer_id;
    if (!customerId && (updatedBooking.customer_email || updatedBooking.customer_phone)) {
      const cleanPhone = updatedBooking.customer_phone ? updatedBooking.customer_phone.slice(-10) : "";
      const matchedUsers = await sql`
        SELECT id FROM users
        WHERE (email IS NOT NULL AND LOWER(email) = LOWER(${updatedBooking.customer_email || ""}))
           OR (${cleanPhone !== ""} AND (RIGHT(phone, 10) = ${cleanPhone} OR RIGHT(mobile_number, 10) = ${cleanPhone}))
        LIMIT 1;
      `;
      if (matchedUsers.length > 0) {
        customerId = matchedUsers[0].id;
        // Associate booking with customer
        await sql`UPDATE bookings SET customer_id = ${customerId} WHERE id = ${id}`;
      }
    }

    // 4. Award loyalty points when payment is marked paid/confirmed and points haven't been awarded yet
    let pointsAwarded = 0;
    const becamePaid = (newPaymentStatus === "paid" || newPaymentStatus === "completed" || newPaymentStatus === "confirmed")
      && prevPaymentStatus !== "paid";

    const effectivePaidAmount = Number(updatedBooking.payable_amount || updatedBooking.total_amount || updatedBooking.price_inr || 0);

    if (becamePaid && customerId && effectivePaidAmount > 0) {
      // Check or record offline/QR/cash payment record in payments table
      const paymentRecord = await sql`
        INSERT INTO payments (
          customer_id, booking_id, amount, payment_method, payment_status,
          currency, signature_verified, razorpay_order_id, razorpay_payment_id
        ) VALUES (
          ${customerId},
          ${id},
          ${effectivePaidAmount},
          ${newPaymentMethod || "cash"},
          'captured',
          'INR',
          TRUE,
          ${`offline_${Date.now()}`},
          ${`${newPaymentMethod || "cash"}_${Date.now()}`}
        ) RETURNING id;
      `;

      const paymentId = paymentRecord[0]?.id;

      const awardResult = await awardLoyaltyPoints({
        customerId,
        bookingId: id,
        paymentId,
        amountPaid: effectivePaidAmount,
        description: `Awarded on confirmed payment (${newPaymentMethod || "cash"}) for ${updatedBooking.booking_reference || "booking"}`,
      });

      if (awardResult) {
        pointsAwarded = awardResult.pointsAwarded;
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      pointsAwarded,
    });
  } catch (error) {
    console.error("Admin bookings PATCH error:", error);
    return NextResponse.json({ success: false, message: "Failed to update booking status" }, { status: 500 });
  }
}
