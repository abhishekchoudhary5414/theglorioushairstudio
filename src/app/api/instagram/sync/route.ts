import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/services/tenant.service";
import { syncBusinessHashtagPosts } from "@/lib/services/hashtag-sync.service";

/**
 * POST /api/instagram/sync
 * Manually synchronizes all active hashtags or a specific hashtag for the business
 */
export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const specificHashtagId = body.hashtagId;

    const result = await syncBusinessHashtagPosts(tenant.businessId, specificHashtagId);

    return NextResponse.json({
      success: result.status !== "FAILED",
      result,
      message:
        result.status === "SUCCESS"
          ? `Discovered ${result.postsDiscovered} posts, saved ${result.postsSaved} new.`
          : `Sync completed with notice: ${result.errorMessage || "See sync logs"}`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
