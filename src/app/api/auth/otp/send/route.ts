import { NextResponse } from "next/server";
import { createAndSendOtp } from "@/lib/auth/otp";
import { validateIndianPhone } from "@/lib/utils/format";
import { sql } from "@/lib/db/neon";

export async function POST(req: Request) {
  try {
    const { mobile, email, purpose } = await req.json();

    if (!purpose) {
      return NextResponse.json({ success: false, message: "Purpose is required." }, { status: 400 });
    }

    if (mobile) {
      if (!validateIndianPhone(mobile)) {
        return NextResponse.json(
          { success: false, message: "Please provide a valid 10-digit Indian mobile number." },
          { status: 400 }
        );
      }

      // Check duplicate mobile registration
      if (purpose === "registration") {
        const cleanMobile = mobile.replace(/\D/g, "").slice(-10);
        const existing = await sql`
          SELECT id FROM users
          WHERE mobile_number = ${cleanMobile}
             OR RIGHT(phone, 10) = ${cleanMobile}
          LIMIT 1;
        `;
        if (existing.length > 0) {
          return NextResponse.json(
            { success: false, message: "An account with this mobile number already exists. Please log in." },
            { status: 409 }
          );
        }
      }

      const clean = mobile.replace(/\D/g, "").slice(-10);
      const result = await createAndSendOtp({ mobile: clean, purpose });
      return NextResponse.json(result, { status: result.success ? 200 : 429 });
    }

    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        return NextResponse.json({ success: false, message: "Please enter a valid email address." }, { status: 400 });
      }

      const cleanEmail = email.toLowerCase().trim();

      if (purpose === "registration") {
        const existing = await sql`SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1;`;
        if (existing.length > 0) {
          return NextResponse.json(
            { success: false, message: "An account with this email address already exists. Please log in." },
            { status: 409 }
          );
        }
      }

      const result = await createAndSendOtp({ email: cleanEmail, purpose });
      return NextResponse.json(result, { status: result.success ? 200 : 429 });
    }

    return NextResponse.json(
      { success: false, message: "Either mobile number or email address is required." },
      { status: 400 }
    );
  } catch (error) {
    console.error("Send OTP error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to send verification code. Please try again." },
      { status: 500 }
    );
  }
}
