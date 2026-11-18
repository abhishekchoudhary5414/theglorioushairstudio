import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, comparePassword } from "@/lib/auth/jwt";
import { sql } from "@/lib/db/neon";
import { validateIndianPhone } from "@/lib/utils/format";

export async function PATCH(req: Request) {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ success: false, message: "Unauthorized. Please sign in." }, { status: 401 });
  }

  try {
    const { name, mobileNumber, currentPassword, newPassword, profileImage } = await req.json();

    // Handle password change if requested
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { success: false, message: "Current password is required to set a new password." },
          { status: 400 }
        );
      }
      if (newPassword.length < 6) {
        return NextResponse.json(
          { success: false, message: "New password must be at least 6 characters long." },
          { status: 400 }
        );
      }

      const userRow = await sql`SELECT password_hash FROM users WHERE id = ${session.userId} LIMIT 1;`;
      if (userRow.length === 0) {
        return NextResponse.json({ success: false, message: "User not found." }, { status: 404 });
      }

      const isMatch = await comparePassword(currentPassword, userRow[0].password_hash as string);
      if (!isMatch) {
        return NextResponse.json({ success: false, message: "Current password is incorrect." }, { status: 400 });
      }

      const newHash = await hashPassword(newPassword);
      await sql`
        UPDATE users
        SET password_hash = ${newHash}, updated_at = NOW()
        WHERE id = ${session.userId};
      `;
    }

    // Handle profile update
    const cleanMobile = mobileNumber ? mobileNumber.replace(/\D/g, "").slice(-10) : undefined;
    if (cleanMobile && !validateIndianPhone(cleanMobile)) {
      return NextResponse.json({ success: false, message: "Invalid 10-digit mobile number." }, { status: 400 });
    }

    const updated = await sql`
      UPDATE users
      SET name = COALESCE(${name ? name.trim() : null}, name),
          mobile_number = COALESCE(${cleanMobile || null}, mobile_number),
          phone = COALESCE(${cleanMobile || null}, phone),
          profile_image = COALESCE(${profileImage || null}, profile_image),
          updated_at = NOW()
      WHERE id = ${session.userId}
      RETURNING id, name, email, mobile_number, profile_image;
    `;

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      user: updated[0],
    });
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to update profile." },
      { status: 500 }
    );
  }
}
