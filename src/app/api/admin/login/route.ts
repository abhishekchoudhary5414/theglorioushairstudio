import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { comparePassword, generateToken, AUTH_COOKIE_NAME } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { username, password } = await req.json();

    const loginId = (username || "").trim();

    if (!loginId || !password) {
      return NextResponse.json(
        { success: false, message: "Username and password are required." },
        { status: 400 }
      );
    }

    if (process.env.DATABASE_URL) {
      // Find user by either username OR email (case-insensitive)
      const users = await sql`
        SELECT id, name, email, username, password_hash, role
        FROM users
        WHERE LOWER(username) = LOWER(${loginId})
           OR LOWER(email) = LOWER(${loginId})
        LIMIT 1;
      `;

      if (users.length === 0) {
        return NextResponse.json(
          { success: false, message: "Invalid username or password." },
          { status: 401 }
        );
      }

      const user = users[0];

      if (user.role !== "admin") {
        return NextResponse.json(
          { success: false, message: "Access denied. Admin credentials required." },
          { status: 403 }
        );
      }

      const isValid = await comparePassword(password, user.password_hash as string);

      if (!isValid) {
        return NextResponse.json(
          { success: false, message: "Invalid username or password." },
          { status: 401 }
        );
      }

      const token = await generateToken({
        userId: user.id as string,
        email: user.email as string,
        name: user.name as string,
        role: user.role as string,
        username: (user.username as string) || "admin",
      });

      const response = NextResponse.json({
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          role: user.role,
        },
        message: "Admin authenticated successfully.",
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

    return NextResponse.json(
      { success: false, message: "Database not connected." },
      { status: 500 }
    );
  } catch (error) {
    console.error("Admin login API error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error during admin login." },
      { status: 500 }
    );
  }
}
