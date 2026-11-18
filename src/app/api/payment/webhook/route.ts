import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { verifyRazorpayWebhookSignature } from "@/lib/services/razorpay.service";
import { confirmLoyaltyRedemption, releaseLoyaltyReservation, awardLoyaltyPoints } from "@/lib/services/loyalty.service";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json({ success: false, message: "Missing webhook signature" }, { status: 400 });
    }

    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ success: false, message: "Invalid webhook signature" }, { status: 400 });
    }

    const event = JSON.parse(rawBody);
    const eventType = event.event;

    // Handle payment.captured
    if (eventType === "payment.captured") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const notes = paymentEntity?.notes || {};

      if (orderId) {
        const paymentRows = await sql`
          SELECT id, customer_id, booking_id, amount, payment_status
          FROM payments
          WHERE razorpay_order_id = ${orderId}
          LIMIT 1;
        `;

        if (paymentRows.length > 0) {
          const payment = paymentRows[0];

          // Idempotency: prevent duplicate processing
          if (payment.payment_status !== "captured") {
            await sql`
              UPDATE payments
              SET razorpay_payment_id = ${paymentId},
                  payment_status = 'captured',
                  signature_verified = TRUE,
                  payment_method = ${paymentEntity?.method || null},
                  raw_response = ${JSON.stringify(paymentEntity)},
                  updated_at = NOW()
              WHERE id = ${payment.id};
            `;

            if (payment.booking_id) {
              await sql`
                UPDATE bookings
                SET status = 'confirmed',
                    payment_status = 'paid'
                WHERE id = ${payment.booking_id};
              `;
            }

            // Confirm reserved redemption if notes contain redemptionId
            if (notes.redemptionId) {
              await confirmLoyaltyRedemption(notes.redemptionId, payment.booking_id);
            }

            // Award loyalty points idempotently
            if (payment.customer_id && Number(payment.amount) > 0) {
              await awardLoyaltyPoints({
                customerId: payment.customer_id,
                bookingId: payment.booking_id,
                paymentId: payment.id,
                amountPaid: Number(payment.amount),
                description: `Awarded via Razorpay webhook for order ${orderId}`,
              });
            }
          }
        }
      }
    } else if (eventType === "payment.failed") {
      const paymentEntity = event.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const notes = paymentEntity?.notes || {};

      if (orderId) {
        await sql`
          UPDATE payments
          SET payment_status = 'failed',
              updated_at = NOW()
          WHERE razorpay_order_id = ${orderId};
        `;
      }

      if (notes.redemptionId) {
        await releaseLoyaltyReservation(notes.redemptionId);
      }
    }

    return NextResponse.json({ status: "ok" });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ success: false, message: "Webhook handler error" }, { status: 500 });
  }
}
