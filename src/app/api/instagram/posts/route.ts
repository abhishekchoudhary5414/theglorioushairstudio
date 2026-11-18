import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getTenantContext } from "@/lib/services/tenant.service";

/**
 * GET /api/instagram/posts
 * Retrieves collected posts with filters: moderation status, approval, visibility, limit, pagination
 */
export async function GET(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "ALL"; // ALL, PENDING, APPROVED, REJECTED, HIDDEN
    const isApproved = searchParams.get("isApproved");
    const isVisible = searchParams.get("isVisible");
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const offset = (page - 1) * limit;

    let posts;
    let countRes;

    if (status !== "ALL") {
      posts = await sql`
        SELECT * FROM instagram_posts
        WHERE business_id = ${tenant.businessId}
          AND moderation_status = ${status}
        ORDER BY is_featured DESC, published_at DESC
        LIMIT ${limit} OFFSET ${offset};
      `;
      countRes = await sql`
        SELECT COUNT(*) as total FROM instagram_posts
        WHERE business_id = ${tenant.businessId}
          AND moderation_status = ${status};
      `;
    } else {
      posts = await sql`
        SELECT * FROM instagram_posts
        WHERE business_id = ${tenant.businessId}
        ORDER BY is_featured DESC, published_at DESC
        LIMIT ${limit} OFFSET ${offset};
      `;
      countRes = await sql`
        SELECT COUNT(*) as total FROM instagram_posts
        WHERE business_id = ${tenant.businessId};
      `;
    }

    const total = parseInt(countRes[0]?.total || "0", 10);

    return NextResponse.json({
      success: true,
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
