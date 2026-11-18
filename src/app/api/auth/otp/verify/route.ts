import { NextResponse } from "next/server";
import { verifyOtp } from "@/lib/auth/otp";
import { sql } from "@/lib/db/neon";
import { generateToken, AUTH_COOKIE_NAME, hashPassword } from "@/lib/auth/jwt";

export async function POST(req: Request) {
  try {
    const { mobile, email, otp, purpose } = await req.json();

    if (!otp || !purpose) {
      return NextResponse.json(
        { success: false, message: "Verification code and purpose are required." },
        { status: 400 }
      );
    }

    const cleanMobile = mobile ? mobile.replace(/\D/g, "").slice(-10) : undefined;
    const cleanEmail = email ? email.toLowerCase().trim() : undefined;

    const result = await verifyOtp({
      mobile: cleanMobile,
      email: cleanEmail,
      otp,
      purpose,
    });

    if (!result.valid) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    // If purpose is 'login', automatically sign in or auto-register the customer & issue auth session cookie!
    if (purpose === "login") {
      let userRecord: any = null;

      if (cleanMobile) {
        const users = await sql`
          SELECT id, name, email, phone, mobile_number, role
          FROM users
          WHERE mobile_number = ${cleanMobile} OR RIGHT(phone, 10) = ${cleanMobile}
          LIMIT 1;
        `;
        if (users.length > 0) {
          userRecord = users[0];
        } else {
          // Auto-create customer upon first OTP verification
          const dummyHash = await hashPassword(`otp_${Date.now()}_${Math.random()}`);
          const defaultEmail = `${cleanMobile}@customer.salon.local`;
          const inserted = await sql`
            INSERT INTO users (name, email, phone, mobile_number, password_hash, role, mobile_verified)
            VALUES (${`Customer ${cleanMobile.slice(-4)}`}, ${defaultEmail}, ${cleanMobile}, ${cleanMobile}, ${dummyHash}, 'customer', TRUE)
            RETURNING id, name, email, phone, mobile_number, role;
          `;
          userRecord = inserted[0];
        }
      } else if (cleanEmail) {
        const users = await sql`
          SELECT id, name, email, phone, mobile_number, role
          FROM users
          WHERE LOWER(email) = ${cleanEmail}
          LIMIT 1;
        `;
        if (users.length > 0) {
          userRecord = users[0];
        } else {
          const dummyHash = await hashPassword(`otp_${Date.now()}_${Math.random()}`);
          const inserted = await sql`
            INSERT INTO users (name, email, password_hash, role, email_verified)
            VALUES (${cleanEmail.split("@")[0]}, ${cleanEmail}, ${dummyHash}, 'customer', TRUE)
            RETURNING id, name, email, phone, mobile_number, role;
          `;
          userRecord = inserted[0];
        }
      }

      if (userRecord) {
        const token = await generateToken({
          userId: userRecord.id as string,
          email: userRecord.email as string,
          name: userRecord.name as string,
          role: userRecord.role as string,
        });

        const response = NextResponse.json({
          success: true,
          message: "Signed in successfully via OTP.",
          user: userRecord,
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
    }

    return NextResponse.json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { success: false, message: "An error occurred while verifying the code." },
      { status: 500 }
    );
  }
}
