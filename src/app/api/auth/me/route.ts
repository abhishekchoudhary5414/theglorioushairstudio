import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";
import { getCustomerLoyaltyBalance } from "@/lib/services/loyalty.service";

export async function GET() {
  const session = await getCurrentUser();

  if (!session) {
    return NextResponse.json(
      { authenticated: false, user: null },
      { status: 401 }
    );
  }

  try {
    const users = await sql`
      SELECT id, name, email, phone, mobile_number, profile_image, email_verified, mobile_verified, role, created_at
      FROM users
      WHERE id = ${session.userId}
      LIMIT 1;
    `;

    if (users.length === 0) {
      return NextResponse.json(
        { authenticated: false, user: null },
        { status: 401 }
      );
    }

    const u = users[0];
    const loyalty = await getCustomerLoyaltyBalance(u.id as string);

    return NextResponse.json({
      authenticated: true,
      user: {
        userId: u.id,
        id: u.id,
        name: u.name,
        email: u.email,
        mobileNumber: u.mobile_number || u.phone,
        phone: u.phone,
        profileImage: u.profile_image,
        emailVerified: u.email_verified,
        mobileVerified: u.mobile_verified,
        role: u.role,
        createdAt: u.created_at,
      },
      loyalty,
    });
  } catch (error) {
    console.error("Auth me error:", error);
    return NextResponse.json(
      { authenticated: true, user: session },
      { status: 200 }
    );
  }
}
