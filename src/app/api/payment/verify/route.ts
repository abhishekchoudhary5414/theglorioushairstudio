import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { verifyRazorpaySignature } from "@/lib/services/razorpay.service";
import { confirmLoyaltyRedemption, releaseLoyaltyReservation, awardLoyaltyPoints } from "@/lib/services/loyalty.service";
import nodemailer from "nodemailer";
import { salonConfig } from "@/config/salon.config";
import { generateBookingSlipPdfBuffer } from "@/lib/server/pdf-generator";

export async function POST(req: Request) {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      bookingId,
      redemptionId,
    } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id) {
      return NextResponse.json(
        { success: false, message: "Order ID and Payment ID are required." },
        { status: 400 }
      );
    }

    // 1. Verify Razorpay Signature (unless test order in sandbox)
    const isTestOrder = razorpay_order_id.startsWith("order_test_");
    let isSignatureValid = isTestOrder;

    if (!isTestOrder && razorpay_signature) {
      isSignatureValid = verifyRazorpaySignature({
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
      });
    }

    if (!isSignatureValid) {
      // Release any reserved loyalty points on signature failure
      if (redemptionId) {
        await releaseLoyaltyReservation(redemptionId);
      }
      return NextResponse.json(
        { success: false, message: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    // 2. Fetch payment record
    const paymentRows = await sql`
      SELECT id, customer_id, booking_id, amount, payment_status
      FROM payments
      WHERE razorpay_order_id = ${razorpay_order_id}
      LIMIT 1;
    `;

    if (paymentRows.length === 0) {
      return NextResponse.json(
        { success: false, message: "Payment transaction record not found." },
        { status: 404 }
      );
    }

    const payment = paymentRows[0];

    // Idempotency: if already captured, return success immediately
    if (payment.payment_status === "captured") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified and processed.",
      });
    }

    // 3. Mark payment as captured in database
    await sql`
      UPDATE payments
      SET razorpay_payment_id = ${razorpay_payment_id},
          payment_status = 'captured',
          signature_verified = TRUE,
          updated_at = NOW()
      WHERE id = ${payment.id};
    `;

    // 4. Update booking to confirmed & paid
    const actualBookingId = bookingId || payment.booking_id;
    const updatedBookings = await sql`
      UPDATE bookings
      SET status = 'confirmed',
          payment_status = 'paid'
      WHERE id = ${actualBookingId}
      RETURNING *;
    `;

    const booking = updatedBookings[0];

    // 5. Confirm redeemed loyalty points
    if (redemptionId) {
      await confirmLoyaltyRedemption(redemptionId, actualBookingId);
    }

    // 6. Award loyalty points strictly for the actual monetary amount paid
    let pointsAwarded = 0;
    if (payment.customer_id && Number(payment.amount) > 0) {
      const awardRes = await awardLoyaltyPoints({
        customerId: payment.customer_id,
        bookingId: actualBookingId,
        paymentId: payment.id,
        amountPaid: Number(payment.amount),
        description: `Awarded on appointment ${booking?.booking_reference || ""}`,
      });
      if (awardRes) {
        pointsAwarded = awardRes.pointsAwarded;
      }
    }

    // 7. Send confirmation email with PDF attachment if customer provided email
    if (booking?.customer_email && process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        const pdfBuffer = generateBookingSlipPdfBuffer({
          bookingRef: booking.booking_reference,
          customerName: booking.customer_name,
          customerPhone: booking.customer_phone,
          customerEmail: booking.customer_email || undefined,
          serviceName: booking.service_name,
          appointmentDate: String(booking.appointment_date),
          timeSlot: booking.time_slot,
          priceDisplay: `₹${booking.payable_amount} (Paid Online via Razorpay)`,
          salonName: salonConfig.name,
          salonAddress: salonConfig.address.fullAddress || "Indore",
          salonPhone: salonConfig.contact.phoneDisplay,
          salonEmail: salonConfig.contact.email,
          issuedDate: new Date().toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          }),
        });

        await transporter.sendMail({
          from: `"${salonConfig.name}" <${process.env.SMTP_USER}>`,
          to: booking.customer_email,
          subject: `Payment Successful & Slot Confirmed: ${booking.service_name} [${booking.booking_reference}]`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e8e1d5; border-radius: 8px;">
              <h2 style="color: #c5a059;">Payment Confirmed & Slot Reserved</h2>
              <p>Dear <strong>${booking.customer_name}</strong>,</p>
              <p>Your payment of <strong>₹${payment.amount}</strong> has been received successfully via Razorpay (Txn: ${razorpay_payment_id}).</p>
              <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Booking Ref:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.booking_reference}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Service:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.service_name}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Date & Time:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">${booking.appointment_date} at ${booking.time_slot}</td></tr>
                <tr><td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>Amount Paid:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee;">₹${payment.amount}</td></tr>
                ${pointsAwarded > 0 ? `<tr><td style="padding: 8px; border-bottom: 1px solid #eee; color: #2e6b46;"><strong>Loyalty Points Earned:</strong></td><td style="padding: 8px; border-bottom: 1px solid #eee; color: #2e6b46;"><strong>+${pointsAwarded} Points</strong></td></tr>` : ""}
              </table>
              <p style="font-size: 13px; color: #666;">Please find your booking receipt attached as a PDF.</p>
            </div>
          `,
          attachments: [
            {
              filename: `Booking-${booking.booking_reference}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });
      } catch (emailErr) {
        console.warn("Error sending post-payment confirmation email:", emailErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Payment verified and appointment confirmed successfully.",
      bookingReference: booking?.booking_reference,
      pointsAwarded,
    });
  } catch (error) {
    console.error("Verify payment error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while verifying payment." },
      { status: 500 }
    );
  }
}
