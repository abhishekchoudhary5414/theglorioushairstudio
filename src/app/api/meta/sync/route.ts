import { NextResponse } from "next/server";
import { getTenantContext } from "@/lib/services/tenant.service";
import { syncBusinessHashtagPosts } from "@/lib/services/hashtag-sync.service";

/**
 * POST /api/meta/sync
 * Manually triggers hashtag synchronization for the authenticated business.
 */
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const tenant = await getTenantContext(body.businessId);
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const result = await syncBusinessHashtagPosts(tenant.businessId);

    return NextResponse.json({
      success: result.status !== "FAILED",
      result,
      message:
        result.status === "SUCCESS"
          ? `Sync completed. Discovered ${result.postsDiscovered} posts, saved ${result.postsSaved} new.`
          : `Sync completed with warnings: ${result.errorMessage || "See sync logs"}`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
