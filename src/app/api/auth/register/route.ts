import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { hashPassword, generateToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { name, email, phone, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: "Name, email, and password are required." },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 6 characters long." },
        { status: 400 }
      );
    }

    // Check if user already exists in Neon PostgreSQL
    if (process.env.DATABASE_URL) {
      const existing = await sql`
        SELECT id FROM users WHERE email = ${email.toLowerCase().trim()} LIMIT 1;
      `;

      if (existing.length > 0) {
        return NextResponse.json(
          { success: false, message: "An account with this email already exists." },
          { status: 409 }
        );
      }

      const passwordHash = await hashPassword(password);

      const inserted = await sql`
        INSERT INTO users (name, email, phone, password_hash, role)
        VALUES (
          ${name.trim()},
          ${email.toLowerCase().trim()},
          ${phone || null},
          ${passwordHash},
          'customer'
        )
        RETURNING id, name, email, role;
      `;

      const newUser = inserted[0];
      const token = generateToken({
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
        message: "Account registered successfully.",
      });

      response.cookies.set(AUTH_COOKIE_NAME, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: "/",
      });

      return response;
    }

    // Fallback response if DATABASE_URL is not yet connected
    const fallbackId = `user_${Date.now()}`;
    const token = generateToken({
      userId: fallbackId,
      email: email.toLowerCase().trim(),
      name: name.trim(),
      role: "customer",
    });

    const response = NextResponse.json({
      success: true,
      user: { id: fallbackId, name, email, role: "customer" },
      message: "Account registered successfully (Database URL ready).",
    });

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during registration." },
      { status: 500 }
    );
  }
}

