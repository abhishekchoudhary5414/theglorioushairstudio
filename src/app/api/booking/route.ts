import { NextResponse } from "next/server";
import { SalonDataService } from "@/services/salon.service";
import { validateIndianPhone } from "@/lib/utils/format";
import { salonConfig } from "@/config/salon.config";
import nodemailer from "nodemailer";
import { generateBookingSlipPdfBuffer } from "@/lib/server/pdf-generator";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      serviceId,
      serviceName,
      appointmentDate,
      timeSlot,
      customerName,
      customerPhone,
      customerEmail,
      branchName,
      stylistName,
      priceINR
    } = body;

    // Server-side validation
    if (!customerName || !customerPhone || !serviceId || !appointmentDate || !timeSlot) {
      return NextResponse.json(
        { success: false, message: "Missing required appointment fields" },
        { status: 400 }
      );
    }

    if (!validateIndianPhone(customerPhone)) {
      return NextResponse.json(
        { success: false, message: "Invalid Indian mobile phone number" },
        { status: 400 }
      );
    }

    // Persist booking directly into Neon PostgreSQL
    const bookingResult = await SalonDataService.createBooking(body);

    // Optional Nodemailer notification with PDF attachment if SMTP is configured
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: Number(process.env.SMTP_PORT) || 587,
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
          }
        });

        // Email to customer if email is provided
        if (customerEmail) {
          const pdfBuffer = generateBookingSlipPdfBuffer({
            bookingRef: bookingResult.bookingReference,
            customerName,
            customerPhone,
            customerEmail,
            serviceName,
            appointmentDate,
            timeSlot,
            priceDisplay: priceINR ? `₹${priceINR}` : "Consultation Required",
            salonName: salonConfig.name,
            salonAddress:
              salonConfig.address.fullAddress ||
              "Scheme No 78, Yashraj Complex, Sector C, Vijay Nagar, Indore",
            salonPhone: salonConfig.contact.phoneDisplay,
            salonEmail: salonConfig.contact.email,
            issuedDate: new Date().toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric"
            })
          });

          await transporter.sendMail({
            from: `"${salonConfig.name}" <${process.env.SMTP_USER}>`,
            to: customerEmail,
            subject: `Reservation Confirmed: ${serviceName} on ${appointmentDate} [Ref: ${bookingResult.bookingReference}]`,
            html: `
              <div style="font-family: Arial, sans-serif; color: #1a1615; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e8e1d5; border-radius: 8px;">
                <h2 style="color: #c5a059; margin-top: 0; letter-spacing: 1px;">${salonConfig.name.toUpperCase()}</h2>
                <p>Hello <strong>${customerName}</strong>,</p>
                <p>Your appointment has been confirmed! Please find your official confirmation receipt attached as a PDF.</p>
                <hr style="border: none; border-top: 1px solid #e8e1d5; margin: 20px 0;" />
                <p style="margin: 6px 0;"><strong>Service:</strong> ${serviceName}</p>
                <p style="margin: 6px 0;"><strong>Stylist:</strong> ${stylistName || "Senior Master Stylist"}</p>
                <p style="margin: 6px 0;"><strong>Date & Time:</strong> ${appointmentDate} at ${timeSlot}</p>
                <p style="margin: 6px 0;"><strong>Branch:</strong> ${branchName || salonConfig.branches[0]?.name || "Main Atelier"}</p>
                <p style="margin: 6px 0;"><strong>Estimated Amount:</strong> ${priceINR ? `₹${priceINR}` : "Consultation"}</p>
                <p style="margin: 6px 0;"><strong>Booking Reference:</strong> <span style="color: #c5a059; font-weight: bold;">${bookingResult.bookingReference}</span></p>
                <hr style="border: none; border-top: 1px solid #e8e1d5; margin: 20px 0;" />
                <p style="color: #69605b; font-size: 13px; line-height: 1.5;">
                  <strong>Location:</strong> ${salonConfig.address.fullAddress}<br/>
                  <strong>Concierge:</strong> ${salonConfig.contact.phoneDisplay} | ${salonConfig.contact.email}
                </p>
                <p style="color: #8c827a; font-size: 12px; margin-top: 16px;">We look forward to welcoming you.</p>
              </div>
            `,
            attachments: [
              {
                filename: `Booking-Confirmation-${bookingResult.bookingReference}.pdf`,
                content: pdfBuffer,
                contentType: "application/pdf"
              }
            ]
          });
        }
      } catch (smtpErr) {
        console.warn("SMTP email notification notice:", smtpErr);
      }
    }

    return NextResponse.json({
      success: true,
      bookingReference: bookingResult.bookingReference,
      message: "Appointment confirmed successfully"
    });
  } catch (error) {
    console.error("Booking API error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred while reserving appointment" },
      { status: 500 }
    );
  }
}
