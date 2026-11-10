import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getCurrentUser } from "@/lib/auth/jwt";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== "admin") {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    if (!process.env.DATABASE_URL) {
      return NextResponse.json({ success: false, message: "No database configured" }, { status: 500 });
    }

    const [
      totalBookingsRes,
      pendingBookingsRes,
      confirmedBookingsRes,
      completedBookingsRes,
      revenueRes,
      totalInquiriesRes,
      totalEventsRes,
      callClicksRes,
      whatsappClicksRes,
      recentBookings,
      recentInquiries,
      popularServices,
    ] = await Promise.all([
      sql`SELECT COUNT(*)::int as count FROM bookings`,
      sql`SELECT COUNT(*)::int as count FROM bookings WHERE status = 'pending'`,
      sql`SELECT COUNT(*)::int as count FROM bookings WHERE status = 'confirmed'`,
      sql`SELECT COUNT(*)::int as count FROM bookings WHERE status = 'completed'`,
      sql`SELECT COALESCE(SUM(price_inr), 0)::numeric as total FROM bookings WHERE status IN ('confirmed', 'completed')`,
      sql`SELECT COUNT(*)::int as count FROM contact_inquiries`,
      sql`SELECT COUNT(*)::int as count FROM interaction_events`,
      sql`SELECT COUNT(*)::int as count FROM interaction_events WHERE event_type IN ('phone_click', 'call_click')`,
      sql`SELECT COUNT(*)::int as count FROM interaction_events WHERE event_type = 'whatsapp_click'`,
      sql`
        SELECT id, booking_reference, service_name, customer_name, customer_phone, appointment_date, time_slot, price_inr, status, created_at
        FROM bookings
        ORDER BY created_at DESC
        LIMIT 6;
      `,
      sql`
        SELECT id, name, phone, email, service_interest, message, created_at
        FROM contact_inquiries
        ORDER BY created_at DESC
        LIMIT 5;
      `,
      sql`
        SELECT service_name, COUNT(*)::int as bookings_count, COALESCE(SUM(price_inr), 0)::numeric as total_revenue
        FROM bookings
        GROUP BY service_name
        ORDER BY bookings_count DESC
        LIMIT 5;
      `,
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalBookings: totalBookingsRes[0]?.count || 0,
        pendingBookings: pendingBookingsRes[0]?.count || 0,
        confirmedBookings: confirmedBookingsRes[0]?.count || 0,
        completedBookings: completedBookingsRes[0]?.count || 0,
        totalRevenue: Number(revenueRes[0]?.total || 0),
        totalInquiries: totalInquiriesRes[0]?.count || 0,
        totalEvents: totalEventsRes[0]?.count || 0,
        callClicks: callClicksRes[0]?.count || 0,
        whatsappClicks: whatsappClicksRes[0]?.count || 0,
      },
      recentBookings,
      recentInquiries,
      popularServices,
    });
  } catch (error) {
    console.error("Admin stats API error:", error);
    return NextResponse.json({ success: false, message: "Failed to load dashboard metrics" }, { status: 500 });
  }
}
