import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { validateIndianPhone } from "@/lib/utils/format";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, phone, email, serviceInterest, message } = body;

    if (!name || !phone) {
      return NextResponse.json(
        { success: false, message: "Name and phone number are required." },
        { status: 400 }
      );
    }

    if (!validateIndianPhone(phone)) {
      return NextResponse.json(
        { success: false, message: "Please enter a valid 10-digit Indian phone number." },
        { status: 400 }
      );
    }

    await sql`
      INSERT INTO contact_inquiries (
        name,
        phone,
        email,
        service_interest,
        message
      ) VALUES (
        ${name},
        ${phone},
        ${email || null},
        ${serviceInterest || null},
        ${message || null}
      );
    `;

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out. Our team will contact you shortly."
    });
  } catch (error) {
    console.error("Error saving contact inquiry:", error);
    return NextResponse.json(
      { success: false, message: "Failed to submit inquiry. Please try again." },
      { status: 500 }
    );
  }
}
