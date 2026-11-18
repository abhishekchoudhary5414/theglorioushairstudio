import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { hashPassword } from "@/lib/auth/jwt";
import { verifyOtp } from "@/lib/auth/otp";

export async function POST(req: Request) {
  try {
    const { identifier, otp, newPassword } = await req.json();

    if (!identifier || !otp || !newPassword) {
      return NextResponse.json(
        { success: false, message: "Identifier, verification code, and new password are required." },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanDigits = identifier.replace(/\D/g, "");
    const isMobile = cleanDigits.length >= 10;
    const cleanMobile = isMobile ? cleanDigits.slice(-10) : undefined;
    const cleanEmail = !isMobile ? identifier.toLowerCase().trim() : undefined;

    // Verify OTP first
    const otpRes = await verifyOtp({
      mobile: cleanMobile,
      email: cleanEmail,
      otp,
      purpose: "reset_password",
    });

    if (!otpRes.valid) {
      return NextResponse.json({ success: false, message: otpRes.message }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);

    // Update password in Neon DB
    const updated = await sql`
      UPDATE users
      SET password_hash = ${newHash}, updated_at = NOW()
      WHERE (
        (${cleanEmail || null}::varchar IS NOT NULL AND LOWER(email) = ${cleanEmail || null})
        OR (${cleanMobile || null}::varchar IS NOT NULL AND (mobile_number = ${cleanMobile || null} OR RIGHT(phone, 10) = ${cleanMobile || null}))
      )
      RETURNING id, name, email;
    `;

    if (updated.length === 0) {
      return NextResponse.json(
        { success: false, message: "No account found matching the provided details." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while resetting your password." },
      { status: 500 }
    );
  }
}
