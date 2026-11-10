import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { comparePassword, generateToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required." },
        { status: 400 }
      );
    }

    if (process.env.DATABASE_URL) {
      const users = await sql`
        SELECT id, name, email, password_hash, role
        FROM users
        WHERE email = ${email.toLowerCase().trim()}
        LIMIT 1;
      `;

      if (users.length === 0) {
        return NextResponse.json(
          { success: false, message: "Invalid email or password." },
          { status: 401 }
        );
      }

      const user = users[0];
      const isValid = await comparePassword(password, user.password_hash as string);

      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Invalid email or password." },
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
    }

    // Fallback simulation when DATABASE_URL is not set
    const token = await generateToken({
      userId: `user_demo`,
      email: email.toLowerCase().trim(),
      name: "Demo User",
      role: "customer",
    });

    const response = NextResponse.json({
      success: true,
      user: { id: "user_demo", name: "Demo User", email, role: "customer" },
      message: "Signed in successfully (Database URL ready).",
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
    console.error("Login error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during login." },
      { status: 500 }
    );
  }
}

