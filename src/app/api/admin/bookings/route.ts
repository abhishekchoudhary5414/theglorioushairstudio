import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "";

    let bookings;
    if (search && status) {
      bookings = await sql`
        SELECT *
        FROM bookings
        WHERE (
          LOWER(customer_name) LIKE LOWER(${`%${search}%`})
          OR LOWER(customer_phone) LIKE LOWER(${`%${search}%`})
          OR LOWER(booking_reference) LIKE LOWER(${`%${search}%`})
          OR LOWER(service_name) LIKE LOWER(${`%${search}%`})
        )
        AND status = ${status}
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else if (search) {
      bookings = await sql`
        SELECT *
        FROM bookings
        WHERE (
          LOWER(customer_name) LIKE LOWER(${`%${search}%`})
          OR LOWER(customer_phone) LIKE LOWER(${`%${search}%`})
          OR LOWER(booking_reference) LIKE LOWER(${`%${search}%`})
          OR LOWER(service_name) LIKE LOWER(${`%${search}%`})
        )
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else if (status) {
      bookings = await sql`
        SELECT *
        FROM bookings
        WHERE status = ${status}
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    } else {
      bookings = await sql`
        SELECT *
        FROM bookings
        ORDER BY created_at DESC
        LIMIT 100;
      `;
    }

    return NextResponse.json({ success: true, bookings });
  } catch (error) {
    console.error("Admin bookings GET error:", error);
    return NextResponse.json({ success: false, message: "Failed to fetch bookings" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ success: false, message: "ID and status are required." }, { status: 400 });
    }

    const updated = await sql`
      UPDATE bookings
      SET status = ${status}
      WHERE id = ${id}
      RETURNING id, booking_reference, status;
    `;

    if (updated.length === 0) {
      return NextResponse.json({ success: false, message: "Booking not found." }, { status: 404 });
    }

    return NextResponse.json({ success: true, booking: updated[0] });
  } catch (error) {
    console.error("Admin bookings PATCH error:", error);
    return NextResponse.json({ success: false, message: "Failed to update booking status" }, { status: 500 });
  }
}
