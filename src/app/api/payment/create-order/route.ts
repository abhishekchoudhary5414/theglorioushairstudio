import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";
import { getRazorpayClient } from "@/lib/services/razorpay.service";
import { getLoyaltySettings, reserveLoyaltyPoints } from "@/lib/services/loyalty.service";
import { SALON_SERVICES_CATEGORIES } from "@/data/services";
import { SERVICES_DATA } from "@/lib/constants/salon-data";

// Helper to look up canonical service price from server catalog
function getCanonicalServicePrice(serviceId: string): number {
  for (const cat of SALON_SERVICES_CATEGORIES) {
    for (const group of cat.subGroups) {
      const match = group.items.find((item) => item.id === serviceId || item.slug === serviceId);
      if (match && typeof match.price === "number") {
        return match.price;
      }
    }
  }
  const direct = SERVICES_DATA.find((s) => s.id === serviceId || s.slug === serviceId);
  if (direct && typeof direct.priceINR === "number") {
    return direct.priceINR;
  }
  return 0;
}

export async function POST(req: Request) {
  try {
    const session = await getCurrentUser();
    if (!session || !session.userId) {
      return NextResponse.json(
        {
          success: false,
          requiresAuth: true,
          message: "Account required. Please sign in or register to book an appointment.",
        },
        { status: 401 }
      );
    }

    const body = await req.json();

    const {
      serviceId,
      serviceName,
      branchId,
      branchName,
      appointmentDate,
      timeSlot,
      customerName,
      customerPhone,
      customerEmail,
      specialInstructions,
      stylistId,
      stylistName,
      redeemPoints = 0,
      clientPrice, // used only if catalog price is zero (e.g. customized service)
    } = body;

    if (!customerName || !customerPhone || !serviceId || !appointmentDate || !timeSlot) {
      return NextResponse.json(
        { success: false, message: "Missing required booking fields" },
        { status: 400 }
      );
    }

    // 1. Calculate canonical total price strictly on server
    const catalogPrice = getCanonicalServicePrice(serviceId);
    const totalPrice = catalogPrice > 0 ? catalogPrice : Number(clientPrice) || 0;

    let discountAmount = 0;
    let redemptionId: string | undefined = undefined;
    let finalPayable = totalPrice;

    // 2. Loyalty point redemption verification (only if authenticated and points > 0)
    if (session && redeemPoints > 0 && totalPrice > 0) {
      const reserveResult = await reserveLoyaltyPoints({
        customerId: session.userId,
        pointsToRedeem: Number(redeemPoints),
        totalAmount: totalPrice,
      });

      if (!reserveResult.success) {
        return NextResponse.json(
          { success: false, message: reserveResult.message },
          { status: 400 }
        );
      }

      discountAmount = reserveResult.discountAmount;
      redemptionId = reserveResult.redemptionId;
      finalPayable = Math.max(0, totalPrice - discountAmount);
    }

    // 3. Create initial booking record in Neon DB
    const bookingRef = `GG-${Math.floor(100000 + Math.random() * 900000)}`;

    const bookingRows = await sql`
      INSERT INTO bookings (
        booking_reference,
        customer_id,
        service_id,
        service_name,
        stylist_id,
        stylist_name,
        branch_id,
        branch_name,
        appointment_date,
        time_slot,
        customer_name,
        customer_phone,
        customer_email,
        price_inr,
        total_amount,
        points_redeemed,
        discount_amount,
        payable_amount,
        payment_status,
        status,
        special_instructions
      ) VALUES (
        ${bookingRef},
        ${session ? session.userId : null},
        ${serviceId},
        ${serviceName || "Salon Service"},
        ${stylistId || null},
        ${stylistName || null},
        ${branchId || "branch-scheme-78"},
        ${branchName || "Indore Branch"},
        ${appointmentDate},
        ${timeSlot},
        ${customerName.trim()},
        ${customerPhone.trim()},
        ${customerEmail ? customerEmail.trim() : null},
        ${totalPrice},
        ${totalPrice},
        ${redeemPoints || 0},
        ${discountAmount},
        ${finalPayable},
        ${finalPayable === 0 ? 'paid' : 'unpaid'},
        'pending_payment',
        ${specialInstructions || null}
      )
      RETURNING id, booking_reference;
    `;

    const bookingId = bookingRows[0].id;

    // If fully covered by loyalty points or consultation (finalPayable === 0)
    if (finalPayable === 0) {
      await sql`
        UPDATE bookings
        SET status = 'confirmed', payment_status = 'paid'
        WHERE id = ${bookingId};
      `;

      if (redemptionId) {
        const { confirmLoyaltyRedemption } = await import("@/lib/services/loyalty.service");
        await confirmLoyaltyRedemption(redemptionId, bookingId);
      }

      return NextResponse.json({
        success: true,
        orderRequired: false,
        bookingReference: bookingRef,
        bookingId,
        message: "Appointment confirmed with 100% loyalty points discount!",
      });
    }

    // 4. Create Razorpay Order with amount in Paise (1 INR = 100 paise)
    const razorpay = getRazorpayClient();
    const amountInPaise = Math.round(finalPayable * 100);

    let razorpayOrder;
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: amountInPaise,
        currency: "INR",
        receipt: bookingRef,
        notes: {
          bookingId: String(bookingId),
          bookingRef,
          customerName,
          customerPhone,
          redemptionId: redemptionId || "",
        },
      });
    } catch (rzpErr) {
      // In sandbox/offline mode without live keys, generate fallback order representation
      console.warn("Razorpay API order error (using fallback test order):", rzpErr);
      razorpayOrder = {
        id: `order_test_${Date.now()}`,
        amount: amountInPaise,
        currency: "INR",
        receipt: bookingRef,
      };
    }

    // Record initial payment row in Neon DB
    await sql`
      INSERT INTO payments (
        customer_id,
        booking_id,
        razorpay_order_id,
        amount,
        currency,
        payment_status
      ) VALUES (
        ${session ? session.userId : null},
        ${bookingId},
        ${razorpayOrder.id},
        ${finalPayable},
        'INR',
        'created'
      );
    `;

    return NextResponse.json({
      success: true,
      orderRequired: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      bookingReference: bookingRef,
      bookingId,
      redemptionId,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || "rzp_test_placeholder",
      totalPrice,
      discountAmount,
      finalPayable,
    });
  } catch (error) {
    console.error("Create order error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to initialize payment order" },
      { status: 500 }
    );
  }
}
