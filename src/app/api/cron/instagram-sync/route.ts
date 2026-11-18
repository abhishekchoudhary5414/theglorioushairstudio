import { NextResponse } from "next/server";
import { syncAllActiveBusinesses } from "@/lib/services/hashtag-sync.service";

/**
 * Scheduled cron endpoint for automatic background hashtag discovery
 * Compatible with Vercel Cron or any HTTP cron scheduler (cron-job.org, Cloudflare Workers, etc.)
 *
 * Headers expected: Authorization: Bearer <CRON_SECRET>
 */
export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || process.env.JWT_SECRET;

    if (authHeader && cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const results = await syncAllActiveBusinesses();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      businessesSynced: results.length,
      details: results,
    });
  } catch (err: unknown) {
    console.error("[Cron Instagram Sync] Error:", err);
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  return POST(req);
}
