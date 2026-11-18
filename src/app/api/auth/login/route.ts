import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { comparePassword, generateToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { identifier, email, password } = await req.json();

    const inputId = (identifier || email || "").trim();

    if (!inputId || !password) {
      return NextResponse.json(
        { success: false, message: "Email or Mobile Number and Password are required." },
        { status: 400 }
      );
    }

    const cleanDigits = inputId.replace(/\D/g, "");
    const isMobile = cleanDigits.length >= 10;
    const cleanMobile = isMobile ? cleanDigits.slice(-10) : "";
    const cleanEmail = inputId.toLowerCase();

    // Query user by email OR mobile_number OR phone OR username
    const users = await sql`
      SELECT id, name, email, phone, mobile_number, password_hash, role
      FROM users
      WHERE (
        LOWER(email) = ${cleanEmail}
        OR (${cleanMobile !== ""} AND (mobile_number = ${cleanMobile} OR RIGHT(phone, 10) = ${cleanMobile}))
        OR LOWER(username) = ${cleanEmail}
      )
      LIMIT 1;
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials. Please verify your details." },
        { status: 401 }
      );
    }

    const user = users[0];
    const isValid = await comparePassword(password, user.password_hash as string);

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials. Please verify your password." },
        { status: 401 }
      );
    }

    const token = await generateToken({
      userId: user.id as string,
      email: user.email as string,
      name: user.name as string,
      role: user.role as string,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobile_number || user.phone,
        role: user.role,
      },
      message: "Signed in successfully.",
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}
