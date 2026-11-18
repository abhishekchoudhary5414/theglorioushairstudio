import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { generateToken, AUTH_COOKIE_NAME, hashPassword } from "@/lib/auth/jwt";
import { getLoyaltySettings } from "@/lib/services/loyalty.service";

export async function POST(req: Request) {
  try {
    const { credential, email, name, picture, sub } = await req.json();

    let googleUser = {
      sub: sub || "",
      email: email || "",
      name: name || "",
      picture: picture || "",
    };

    // If client sends standard Google ID token (credential JWT)
    if (credential) {
      try {
        const parts = credential.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(Buffer.from(parts[1], "base64").toString("utf8"));
          googleUser = {
            sub: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
          };
        }
      } catch (decodeErr) {
        console.warn("Failed to parse Google credential token payload:", decodeErr);
      }
    }

    if (!googleUser.email) {
      return NextResponse.json(
        { success: false, message: "Google account verification failed. Email missing." },
        { status: 400 }
      );
    }

    const cleanEmail = googleUser.email.toLowerCase().trim();

    // Check if customer already exists by email
    const existingUsers = await sql`
      SELECT id, name, email, phone, mobile_number, profile_image, role
      FROM users
      WHERE LOWER(email) = ${cleanEmail}
      LIMIT 1;
    `;

    let userRecord;

    if (existingUsers.length > 0) {
      userRecord = existingUsers[0];

      // Update profile picture and email_verified if missing
      await sql`
        UPDATE users
        SET profile_image = COALESCE(profile_image, ${googleUser.picture || null}),
            email_verified = TRUE,
            updated_at = NOW()
        WHERE id = ${userRecord.id};
      `;
    } else {
      // Create new customer account
      const randomPassword = `google_${Math.random().toString(36).substring(2)}${Date.now()}`;
      const defaultHash = await hashPassword(randomPassword);

      const inserted = await sql`
        INSERT INTO users (
          name, email, password_hash, profile_image, email_verified, role
        ) VALUES (
          ${googleUser.name || "Customer"},
          ${cleanEmail},
          ${defaultHash},
          ${googleUser.picture || null},
          TRUE,
          'customer'
        ) RETURNING id, name, email, phone, mobile_number, profile_image, role;
      `;
      userRecord = inserted[0];

      // Award 10 Free Welcome Loyalty Points on New Google Registration
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
            ${userRecord.id},
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
              ${userRecord.id},
              ${welcomeTx[0].id},
              10,
              10,
              ${expiresAt.toISOString()}
            );
          `;
        }
      } catch (loyaltyErr) {
        console.error("Failed to grant welcome loyalty points for Google signup:", loyaltyErr);
      }
    }

    // Link customer_auth_accounts if Google sub is provided
    if (googleUser.sub) {
      await sql`
        INSERT INTO customer_auth_accounts (
          customer_id, provider, provider_account_id
        ) VALUES (
          ${userRecord.id},
          'google',
          ${googleUser.sub}
        )
        ON CONFLICT (provider, provider_account_id) DO NOTHING;
      `;
    }

    const token = await generateToken({
      userId: userRecord.id as string,
      email: userRecord.email as string,
      name: userRecord.name as string,
      role: userRecord.role as string,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: userRecord.id,
        name: userRecord.name,
        email: userRecord.email,
        mobileNumber: userRecord.mobile_number || userRecord.phone,
        profileImage: userRecord.profile_image || googleUser.picture,
        role: userRecord.role,
      },
      message: "Google login successful.",
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
    console.error("Google Auth error:", error);
    return NextResponse.json(
      { success: false, message: "An unexpected error occurred during Google authentication." },
      { status: 500 }
    );
  }
}
