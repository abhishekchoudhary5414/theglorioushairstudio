import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const [events, countsByDevice, countsByType] = await Promise.all([
      sql`
        SELECT id, event_type, service_name, source_location, target_url, page_path, device_type, ip_address, created_at
        FROM interaction_events
        ORDER BY created_at DESC
        LIMIT 100;
      `,
      sql`
        SELECT device_type, COUNT(*)::int as count
        FROM interaction_events
        GROUP BY device_type;
      `,
      sql`
        SELECT event_type, COUNT(*)::int as count
        FROM interaction_events
        GROUP BY event_type
        ORDER BY count DESC;
      `,
    ]);

    return NextResponse.json({
      success: true,
      events,
      breakdown: {
        byDevice: countsByDevice,
        byType: countsByType,
      },
    });
  } catch (error) {
    console.error("Admin events GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch interaction events" }, { status: 500 });
  }
}
