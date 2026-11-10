import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const inquiries = await sql`
      SELECT id, name, phone, email, service_interest, message, created_at
      FROM contact_inquiries
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    return NextResponse.json({ success: true, inquiries });
  } catch (error) {
    console.error("Admin inquiries GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch inquiries" }, { status: 500 });
  }
}
