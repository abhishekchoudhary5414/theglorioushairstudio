import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { salonConfig } from "@/config/salon.config";
import { generateBookingSlipPdfBuffer } from "@/lib/server/pdf-generator";
import { sql } from "@/lib/db/neon";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUser();

    // Query receipt by ID or receipt_number
    const rows = await sql`
      SELECT * FROM receipts
      WHERE id::text = ${id} OR receipt_number = ${id}
      LIMIT 1;
    `;

    if (rows.length === 0) {
      return NextResponse.json({ success: false, message: "Receipt not found" }, { status: 404 });
    }

    const r = rows[0];

    // Access control: admin or the customer owning the receipt
    if (session?.role !== "admin") {
      const isOwner = session && session.userId && r.customer_id === session.userId;
      if (!isOwner && session?.email?.toLowerCase() !== r.customer_email?.toLowerCase()) {
        return NextResponse.json({ success: false, message: "Access denied" }, { status: 403 });
      }
    }

    const salonAddress: string = [
      salonConfig.address.line1 || "201, EC 8, RP Avenue, near Uttam bhog",
      salonConfig.address.line2 || "opposite Bombay Hospital Service Road, Pushp Vihar Colony, Scheme 94 Sector EC",
    ]
      .filter(Boolean)
      .join(", ");

    const pdfBuffer = generateBookingSlipPdfBuffer({
      bookingRef: r.booking_reference || r.receipt_number,
      customerName: r.customer_name,
      customerPhone: r.customer_phone || salonConfig.contact.phoneDisplay,
      customerEmail: r.customer_email,
      serviceName: r.service_name,
      categoryTitle: r.category_title || "Salon Service",
      appointmentDate: String(r.appointment_date).split("T")[0],
      timeSlot: r.time_slot || "11:00 AM",
      priceDisplay: `₹${Number(r.base_amount || r.final_payable || 0).toLocaleString("en-IN")}`,
      baseAmount: Number(r.base_amount || 0),
      pointsUsed: Number(r.points_used || 0),
      discountPercentage: Number(r.discount_percentage || 0),
      discountAmount: Number(r.discount_amount || 0),
      finalPayable: Number(r.final_payable || 0),
      paymentStatus: r.payment_status || "paid",
      paymentMethod: r.payment_method || "cash",
      salonName: salonConfig.name,
      salonAddress,
      salonPhone: salonConfig.contact.phoneDisplay,
      salonEmail: salonConfig.contact.email,
      specialInstructions: r.special_instructions,
      issuedDate: new Date(r.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      instaReelsUrl: salonConfig.socials.instagramReels,
    });

    return new Response(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="Payment-Receipt-${r.receipt_number}.pdf"`,
      },
    });
  } catch (err) {
    console.error("Download receipt error:", err);
    return NextResponse.json({ success: false, message: "Failed to generate receipt PDF" }, { status: 500 });
  }
}
