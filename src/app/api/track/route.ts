import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      eventType,
      serviceName,
      sourceLocation,
      targetUrl,
      pagePath,
      deviceType
    } = body;

    if (!eventType) {
      return NextResponse.json(
        { success: false, message: "eventType is required." },
        { status: 400 }
      );
    }

    const userAgent = req.headers.get("user-agent") || null;
    const ipAddress =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      null;

    await sql`
      INSERT INTO interaction_events (
        event_type,
        service_name,
        source_location,
        target_url,
        page_path,
        device_type,
        ip_address,
        user_agent
      ) VALUES (
        ${eventType},
        ${serviceName || null},
        ${sourceLocation || null},
        ${targetUrl || null},
        ${pagePath || null},
        ${deviceType || null},
        ${ipAddress},
        ${userAgent}
      );
    `;

    return NextResponse.json({ success: true, message: "Interaction recorded." });
  } catch (error) {
    console.error("Error saving interaction event:", error);
    // Don't fail the user interaction even if logging has an issue
    return NextResponse.json(
      { success: false, message: "Event logging failed." },
      { status: 500 }
    );
  }
}
