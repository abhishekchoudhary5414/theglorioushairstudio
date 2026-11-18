import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { hashPassword, generateToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";
import { verifyOtp } from "@/lib/auth/otp";
import { getLoyaltySettings } from "@/lib/services/loyalty.service";

export async function POST(req: Request) {
  try {
    const { name, email, password, otp, mobileNumber } = await req.json();

    if (!name || !email || !password || !otp) {
      return NextResponse.json(
        { success: false, message: "Full Name, Email, Password, and 6-digit OTP are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    // Clean phone number (if provided)
    let cleanPhone = (mobileNumber || "").replace(/\D/g, "");
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }

    // 1. Verify Email OTP on backend
    const otpCheck = await verifyOtp({
      email: cleanEmail,
      otp: otp.trim(),
      purpose: "registration",
    });

    if (!otpCheck.valid) {
      return NextResponse.json({ success: false, message: otpCheck.message }, { status: 400 });
    }

    // 2. Check duplicate accounts
    const existingEmail = await sql`
      SELECT id FROM users WHERE LOWER(email) = ${cleanEmail} LIMIT 1;
    `;
    if (existingEmail.length > 0) {
      return NextResponse.json(
        { success: false, message: "An account with this email address already exists. Please sign in." },
        { status: 409 }
      );
    }

    // 3. Hash password
    const passwordHash = await hashPassword(password);

    // 4. Create customer account with email_verified = true and phone number
    const inserted = await sql`
      INSERT INTO users (
        name,
        email,
        phone,
        mobile_number,
        password_hash,
        role,
        email_verified
      ) VALUES (
        ${name.trim()},
        ${cleanEmail},
        ${cleanPhone || null},
        ${cleanPhone || null},
        ${passwordHash},
        'customer',
        TRUE
      )
      RETURNING id, name, email, phone, mobile_number, role, profile_image;
    `;

    const newUser = inserted[0];

    // 5. Award 10 Free Welcome Loyalty Points on Signup
    try {
      const settings = await getLoyaltySettings();
      const expirationDays = settings.expirationDays || 90;
      const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

      const welcomeTx = await sql`
        INSERT INTO loyalty_transactions (
          customer_id,
          transaction_type,
          points,
          description,
          expires_at,
          status
        ) VALUES (
          ${newUser.id},
          'earned',
          10,
          'Welcome Gift: 10 Free Registration Loyalty Points',
          ${expiresAt.toISOString()},
          'active'
        ) RETURNING id;
      `;

      if (welcomeTx.length > 0) {
        await sql`
          INSERT INTO loyalty_point_lots (
            customer_id,
            source_transaction_id,
            original_points,
            remaining_points,
            expires_at
          ) VALUES (
            ${newUser.id},
            ${welcomeTx[0].id},
            10,
            10,
            ${expiresAt.toISOString()}
          );
        `;
      }
    } catch (loyaltyErr) {
      console.error("Failed to grant welcome loyalty points:", loyaltyErr);
    }

    // 6. Generate auth token and set cookie to log the user in immediately
    const token = await generateToken({
      userId: newUser.id as string,
      email: newUser.email as string,
      name: newUser.name as string,
      role: newUser.role as string,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      message: "Customer account registered successfully.",
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Customer registration error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred during customer registration." },
      { status: 500 }
    );
  }
}
