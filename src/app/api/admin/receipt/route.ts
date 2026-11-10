import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { salonConfig } from "@/config/salon.config";
import { generateBookingSlipPdfBuffer } from "@/lib/server/pdf-generator";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      bookingRef,
      customerName,
      customerPhone,
      customerEmail,
      serviceName,
      categoryTitle,
      appointmentDate,
      timeSlot,
      priceDisplay,
      specialInstructions,
    } = body;

    if (!customerEmail || !customerEmail.includes("@")) {
      return NextResponse.json(
        { success: false, message: "Valid client email address is required to dispatch receipt." },
        { status: 400 }
      );
    }

    const issuedDate = new Date().toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    const slipData = {
      bookingRef: bookingRef || `GG-${Math.floor(100000 + Math.random() * 900000)}`,
      customerName: customerName || "Valued Client",
      customerPhone: customerPhone || salonConfig.contact.phoneDisplay,
      customerEmail,
      serviceName: serviceName || "Salon Luxury Service",
      categoryTitle: categoryTitle || "Hair & Beauty Atelier",
      appointmentDate: appointmentDate || new Date().toISOString().split("T")[0],
      timeSlot: timeSlot || "11:00 AM",
      priceDisplay: priceDisplay || "Consultation",
      salonName: salonConfig.name,
      salonAddress: salonConfig.address.fullAddress,
      salonPhone: salonConfig.contact.phoneDisplay,
      salonEmail: salonConfig.contact.email,
      specialInstructions,
      issuedDate,
    };

    // Generate high-resolution official vector PDF
    const pdfBuffer = generateBookingSlipPdfBuffer(slipData);

    // If SMTP is configured, dispatch the email
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === "true",
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      });

      await transporter.sendMail({
        from: `"${salonConfig.name}" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: `Official Receipt & Confirmation: ${slipData.serviceName} [Ref: ${slipData.bookingRef}]`,
        html: `
          <!DOCTYPE html>
          <html lang="en">
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #181413;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="padding: 24px 12px; background-color: #faf7f2;">
              <tr>
                <td align="center">
                  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e8e1d5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.06);">
                    <tr>
                      <td height="5" style="background: linear-gradient(90deg, #c5a059, #e8cf96, #c5a059);">&nbsp;</td>
                    </tr>
                    <tr>
                      <td style="padding: 24px 28px 18px; border-bottom: 1px solid #f0ebe1;">
                        <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #181413;">${salonConfig.name}</h1>
                        <p style="margin: 4px 0 0; font-size: 11px; font-weight: 600; color: #c5a059; text-transform: uppercase; letter-spacing: 1px;">Official Client Receipt &amp; Appointment Voucher</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 18px 28px; background-color: #f7f1e5; border-bottom: 1px solid #e8e1d5;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td>
                              <span style="display: inline-block; padding: 4px 10px; background-color: #eaf3ed; color: #2e6b46; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #2e6b46;">
                                &#10003; RECEIPT GENERATED
                              </span>
                            </td>
                            <td align="right">
                              <span style="font-size: 10px; color: #69605b; display: block; font-weight: 600;">BOOKING REF #</span>
                              <span style="font-size: 16px; font-weight: 800; font-family: monospace; color: #181413;">${slipData.bookingRef}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 24px 28px;">
                        <p style="margin: 0 0 10px; font-size: 15px; color: #181413;">Dear <strong>${slipData.customerName}</strong>,</p>
                        <p style="margin: 0 0 18px; font-size: 14px; color: #69605b; line-height: 1.6;">
                          Thank you for choosing ${salonConfig.name}. Please find your official appointment receipt and confirmation slip attached as a vector PDF.
                        </p>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #f0ebe1; border-radius: 8px; background-color: #faf7f2; margin-bottom: 20px;">
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Service:</td>
                            <td style="padding: 10px 14px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${slipData.serviceName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Schedule:</td>
                            <td style="padding: 10px 14px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${slipData.appointmentDate} at ${slipData.timeSlot}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Amount:</td>
                            <td style="padding: 10px 14px; font-size: 14px; font-weight: 800; color: #c5a059; border-bottom: 1px dashed #e8e1d5;">${slipData.priceDisplay}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b;">Salon Venue:</td>
                            <td style="padding: 10px 14px; font-size: 12.5px; font-weight: 600; color: #181413;">${slipData.salonAddress}</td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 18px 28px; background-color: #181413; text-align: center; color: #e8e1d5; font-size: 11px;">
                        ${salonConfig.name} &bull; ${salonConfig.contact.phoneDisplay} &bull; ${salonConfig.contact.email}
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </body>
          </html>
        `,
        attachments: [
          {
            filename: `The-Glorious-Receipt-${slipData.bookingRef}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
      });
    }

    return NextResponse.json({
      success: true,
      message: `Receipt dispatched successfully to ${customerEmail}`,
      bookingRef: slipData.bookingRef,
    });
  } catch (error) {
    console.error("Admin send receipt error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to dispatch receipt email" },
      { status: 500 }
    );
  }
}
