import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { salonConfig } from "@/config/salon.config";
import { generateBookingSlipPdfBuffer } from "@/lib/server/pdf-generator";
import { sql } from "@/lib/db/neon";
import nodemailer from "nodemailer";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";

    let receipts;
    if (search) {
      receipts = await sql`
        SELECT *
        FROM receipts
        WHERE (
          LOWER(customer_name) LIKE LOWER(${`%${search}%`})
          OR LOWER(customer_email) LIKE LOWER(${`%${search}%`})
          OR LOWER(receipt_number) LIKE LOWER(${`%${search}%`})
          OR LOWER(booking_reference) LIKE LOWER(${`%${search}%`})
          OR LOWER(service_name) LIKE LOWER(${`%${search}%`})
        )
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else {
      receipts = await sql`
        SELECT *
        FROM receipts
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    }

    return NextResponse.json({ success: true, receipts });
  } catch (error) {
    console.error("Admin GET receipts error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch receipts" }, { status: 500 });
  }
}

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
      baseAmount,
      pointsUsed,
      discountPercentage,
      discountAmount,
      finalPayable,
      paymentStatus,
      paymentMethod,
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

    const salonAddress: string = [
      salonConfig.address.line1 || "201, EC 8, RP Avenue, near Uttam bhog",
      salonConfig.address.line2 || "opposite Bombay Hospital Service Road, Pushp Vihar Colony, Scheme 94 Sector EC",
    ]
      .filter(Boolean)
      .join(", ");

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
      baseAmount: baseAmount || undefined,
      pointsUsed: pointsUsed || undefined,
      discountPercentage: discountPercentage || undefined,
      discountAmount: discountAmount || undefined,
      finalPayable: finalPayable || undefined,
      paymentStatus: paymentStatus || "paid",
      paymentMethod: paymentMethod || "cash",
      salonName: salonConfig.name,
      salonAddress,
      salonPhone: salonConfig.contact.phoneDisplay,
      salonEmail: salonConfig.contact.email,
      specialInstructions,
      issuedDate,
      instaReelsUrl: salonConfig.socials.instagramReels,
    };

    // Save record to database receipts table
    const receiptNumber = `REC-${Date.now().toString().slice(-6)}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Try linking booking_id & customer_id if exists
    let matchedBookingId = null;
    let matchedCustomerId = null;
    if (slipData.bookingRef) {
      const bRes = await sql`SELECT id, customer_id FROM bookings WHERE booking_reference = ${slipData.bookingRef} LIMIT 1`;
      if (bRes.length > 0) {
        matchedBookingId = bRes[0].id;
        matchedCustomerId = bRes[0].customer_id;
      }
    }
    if (!matchedCustomerId && customerEmail) {
      const uRes = await sql`SELECT id FROM users WHERE LOWER(email) = LOWER(${customerEmail}) LIMIT 1`;
      if (uRes.length > 0) {
        matchedCustomerId = uRes[0].id;
      }
    }

    let isSentViaEmail = false;

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

      try {
        await transporter.sendMail({
          from: `"${salonConfig.name}" <${process.env.SMTP_USER}>`,
          to: customerEmail,
          subject: `Official Payment Receipt: ${slipData.serviceName} [Receipt: ${receiptNumber}]`,
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
                        <p style="margin: 4px 0 0; font-size: 11px; font-weight: 600; color: #c5a059; text-transform: uppercase; letter-spacing: 1px;">Official Payment Receipt &amp; Invoice</p>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 18px 28px; background-color: #f7f1e5; border-bottom: 1px solid #e8e1d5;">
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                          <tr>
                            <td>
                              <span style="display: inline-block; padding: 4px 10px; background-color: #eaf3ed; color: #2e6b46; font-size: 11px; font-weight: 700; border-radius: 4px; border: 1px solid #2e6b46;">
                                &#10003; PAYMENT RECEIPT GENERATED
                              </span>
                            </td>
                            <td align="right">
                              <span style="font-size: 10px; color: #69605b; display: block; font-weight: 600;">RECEIPT #</span>
                              <span style="font-size: 16px; font-weight: 800; font-family: monospace; color: #181413;">${receiptNumber}</span>
                            </td>
                          </tr>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 24px 28px;">
                        <p style="margin: 0 0 10px; font-size: 15px; color: #181413;">Dear <strong>${slipData.customerName}</strong>,</p>
                        <p style="margin: 0 0 18px; font-size: 14px; color: #69605b; line-height: 1.6;">
                          Thank you for choosing ${salonConfig.name}. Please find your official payment receipt and confirmed session slip attached as a vector PDF.
                        </p>
                        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border: 1px solid #f0ebe1; border-radius: 8px; background-color: #faf7f2; margin-bottom: 20px;">
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Receipt Number:</td>
                            <td style="padding: 10px 14px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${receiptNumber}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Booking Reference:</td>
                            <td style="padding: 10px 14px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${slipData.bookingRef}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Service:</td>
                            <td style="padding: 10px 14px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${slipData.serviceName}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Schedule:</td>
                            <td style="padding: 10px 14px; font-size: 13.5px; font-weight: 700; color: #181413; border-bottom: 1px dashed #e8e1d5;">${slipData.appointmentDate} at ${slipData.timeSlot}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Base Price:</td>
                            <td style="padding: 10px 14px; font-size: 13.5px; font-weight: 600; color: #181413; border-bottom: 1px dashed #e8e1d5;">₹${Number(slipData.baseAmount || 0).toLocaleString("en-IN")}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Discount:</td>
                            <td style="padding: 10px 14px; font-size: 13.5px; font-weight: 600; color: #2e6b46; border-bottom: 1px dashed #e8e1d5;">${slipData.discountAmount ? `-₹${Number(slipData.discountAmount).toLocaleString("en-IN")}` : "₹0"}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b; border-bottom: 1px dashed #e8e1d5;">Final Amount Paid:</td>
                            <td style="padding: 10px 14px; font-size: 15px; font-weight: 800; color: #c5a059; border-bottom: 1px dashed #e8e1d5;">₹${Number(slipData.finalPayable || 0).toLocaleString("en-IN")}</td>
                          </tr>
                          <tr>
                            <td style="padding: 10px 14px; font-size: 12.5px; color: #69605b;">Payment Mode &amp; Status:</td>
                            <td style="padding: 10px 14px; font-size: 12.5px; font-weight: 700; color: #181413; text-transform: uppercase;">${slipData.paymentMethod} &bull; ${slipData.paymentStatus}</td>
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
            filename: `Payment-Receipt-${receiptNumber}.pdf`,
            content: pdfBuffer,
            contentType: "application/pdf",
          },
        ],
        });
        isSentViaEmail = true;
      } catch (mailErr) {
        console.warn("Mail dispatch notice:", mailErr);
      }
    }

    // Persist into receipts table
    await sql`
      INSERT INTO receipts (
        receipt_number,
        booking_id,
        booking_reference,
        customer_id,
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
        special_instructions,
        sent_via_email
      ) VALUES (
        ${receiptNumber},
        ${matchedBookingId},
        ${slipData.bookingRef},
        ${matchedCustomerId},
        ${slipData.customerName},
        ${slipData.customerPhone},
        ${slipData.customerEmail},
        ${slipData.serviceName},
        ${slipData.categoryTitle},
        ${slipData.appointmentDate},
        ${slipData.timeSlot},
        ${slipData.baseAmount || 0},
        ${slipData.discountPercentage || 0},
        ${slipData.discountAmount || 0},
        ${slipData.pointsUsed || 0},
        ${slipData.finalPayable || 0},
        ${slipData.paymentStatus},
        ${slipData.paymentMethod},
        ${slipData.specialInstructions || null},
        ${isSentViaEmail}
      );
    `;

    return NextResponse.json({
      success: true,
      message: `Payment receipt (${receiptNumber}) successfully created and saved to database!${isSentViaEmail ? " Dispatched via email with attached PDF." : ""}`,
      receiptNumber,
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
