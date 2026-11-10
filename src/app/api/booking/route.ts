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
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Appointment Confirmation</title>
              </head>
              <body style="margin: 0; padding: 0; background-color: #faf7f2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #181413;">
                <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #faf7f2; padding: 24px 12px;">
                  <tr>
                    <td align="center">
                      <!-- Container Card -->
                      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; background-color: #ffffff; border: 1px solid #e8e1d5; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.05);">
                        <!-- Gold Accent Bar -->
                        <tr>
                          <td height="5" style="background: linear-gradient(90deg, #c5a059, #e8cf96, #c5a059); font-size: 0; line-height: 0;">&nbsp;</td>
                        </tr>

                        <!-- Brand Header -->
                        <tr>
                          <td style="padding: 24px 28px 18px; border-bottom: 1px solid #f0ebe1;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td valign="middle" style="padding-right: 16px;">
                                  <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #181413; letter-spacing: 0.5px;">${salonConfig.name}</h1>
                                  <p style="margin: 4px 0 0; font-size: 11px; font-weight: 600; color: #c5a059; text-transform: uppercase; letter-spacing: 1px;">Professional Hair &amp; Beauty Salon and Academy</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Verified Status Ribbon -->
                        <tr>
                          <td style="padding: 16px 28px; background-color: #f7f1e5; border-bottom: 1px solid #e8e1d5;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                              <tr>
                                <td valign="middle" align="left">
                                  <span style="display: inline-block; padding: 4px 10px; background-color: #eaf3ed; color: #2e6b46; font-size: 11px; font-weight: 700; border-radius: 4px; letter-spacing: 0.5px; border: 1px solid #2e6b46;">
                                    &#10003; APPOINTMENT CONFIRMED
                                  </span>
                                </td>
                                <td valign="middle" align="right">
                                  <span style="font-size: 10px; color: #69605b; display: block; font-weight: 600;">BOOKING REF #</span>
                                  <span style="font-size: 16px; font-weight: 800; font-family: monospace; color: #181413; letter-spacing: 1px;">${bookingResult.bookingReference}</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Greeting & Intro -->
                        <tr>
                          <td style="padding: 24px 28px 12px;">
                            <p style="margin: 0 0 10px; font-size: 15px; color: #181413; line-height: 1.5;">
                              Dear <strong>${customerName}</strong>,
                            </p>
                            <p style="margin: 0; font-size: 14px; color: #69605b; line-height: 1.6;">
                              Your salon reservation has been confirmed. Your official confirmation slip is attached as a high-quality PDF.
                            </p>
                          </td>
                        </tr>

                        <!-- Itemized Details Table -->
                        <tr>
                          <td style="padding: 8px 28px 20px;">
                            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #f0ebe1; border-radius: 8px; background-color: #faf7f2;">
                              <tr>
                                <td width="38%" style="padding: 12px 16px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Guest Name:</td>
                                <td width="62%" style="padding: 12px 16px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${customerName}</td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 16px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Contact Number:</td>
                                <td style="padding: 12px 16px; font-size: 13px; font-weight: 600; color: #181413; border-bottom: 1px dashed #e8e1d5;">${customerPhone}</td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 16px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Reserved Service:</td>
                                <td style="padding: 12px 16px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${serviceName}</td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 16px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Appointment Date:</td>
                                <td style="padding: 12px 16px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${appointmentDate}</td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 16px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Reserved Slot:</td>
                                <td style="padding: 12px 16px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${timeSlot}</td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 16px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Estimated Fees:</td>
                                <td style="padding: 12px 16px; font-size: 14px; font-weight: 800; color: #c5a059; border-bottom: 1px dashed #e8e1d5;">${priceINR ? `₹${priceINR}` : "Consultation"}</td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 16px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Payment Policy:</td>
                                <td style="padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #2e6b46; border-bottom: 1px dashed #e8e1d5;">Pay at Salon (Cash / UPI / Card / No Advance Needed)</td>
                              </tr>
                              <tr>
                                <td style="padding: 12px 16px; font-size: 12.5px; color: #69605b;">Salon Venue:</td>
                                <td style="padding: 12px 16px; font-size: 12.5px; font-weight: 600; color: #181413; line-height: 1.5;">${salonConfig.address.fullAddress}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>

                        <!-- Instructions & Notice -->
                        <tr>
                          <td style="padding: 0 28px 24px;">
                            <div style="background-color: #f7f1e5; border: 1px solid #e8e1d5; border-radius: 6px; padding: 14px 16px;">
                              <p style="margin: 0 0 6px; font-size: 12px; font-weight: 700; color: #181413;">Important Instructions:</p>
                              <p style="margin: 0 0 4px; font-size: 11.5px; color: #69605b; line-height: 1.5;">&bull; Please arrive 5&ndash;10 minutes prior to your scheduled time.</p>
                              <p style="margin: 0; font-size: 11.5px; color: #69605b; line-height: 1.5;">&bull; Need assistance or rescheduling? Call concierge at <strong style="color: #181413;">${salonConfig.contact.phoneDisplay}</strong>.</p>
                            </div>
                          </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                          <td style="padding: 18px 28px; background-color: #181413; text-align: center;">
                            <p style="margin: 0 0 6px; font-size: 12px; color: #c5a059; font-weight: 600; letter-spacing: 0.5px;">${salonConfig.name.toUpperCase()}</p>
                            <p style="margin: 0; font-size: 11px; color: #e8e1d5; line-height: 1.5;">
                              ${salonConfig.address.fullAddress}<br>
                              Concierge: ${salonConfig.contact.phoneDisplay} &bull; ${salonConfig.contact.email}
                            </p>
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
