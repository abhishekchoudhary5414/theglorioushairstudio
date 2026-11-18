import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getTenantContext } from "@/lib/services/tenant.service";

/**
 * GET /api/meta/posts
 * Retrieves collected posts for the authenticated business with pagination, filtering & search.
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedBusinessId = searchParams.get("businessId");
    const status = searchParams.get("status") || "ALL"; // ALL, PENDING, APPROVED, REJECTED, HIDDEN
    const mediaType = searchParams.get("mediaType") || "ALL";
    const isFeatured = searchParams.get("featured");
    const limit = Math.min(parseInt(searchParams.get("limit") || "24", 10), 100);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const offset = (page - 1) * limit;

    const tenant = await getTenantContext(requestedBusinessId);
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const businessId = tenant.businessId;

    let posts;
    let countRes;

    if (status !== "ALL" && mediaType !== "ALL") {
      posts = await sql`
        SELECT * FROM instagram_posts
        WHERE business_id = ${businessId}
          AND moderation_status = ${status}
          AND media_type = ${mediaType}
        ORDER BY is_featured DESC, published_at DESC
        LIMIT ${limit} OFFSET ${offset};
      `;
      countRes = await sql`
        SELECT COUNT(*) as total FROM instagram_posts
        WHERE business_id = ${businessId}
          AND moderation_status = ${status}
          AND media_type = ${mediaType};
      `;
    } else if (status !== "ALL") {
      posts = await sql`
        SELECT * FROM instagram_posts
        WHERE business_id = ${businessId}
          AND moderation_status = ${status}
        ORDER BY is_featured DESC, published_at DESC
        LIMIT ${limit} OFFSET ${offset};
      `;
      countRes = await sql`
        SELECT COUNT(*) as total FROM instagram_posts
        WHERE business_id = ${businessId}
          AND moderation_status = ${status};
      `;
    } else if (mediaType !== "ALL") {
      posts = await sql`
        SELECT * FROM instagram_posts
        WHERE business_id = ${businessId}
          AND media_type = ${mediaType}
        ORDER BY is_featured DESC, published_at DESC
        LIMIT ${limit} OFFSET ${offset};
      `;
      countRes = await sql`
        SELECT COUNT(*) as total FROM instagram_posts
        WHERE business_id = ${businessId}
          AND media_type = ${mediaType};
      `;
    } else {
      posts = await sql`
        SELECT * FROM instagram_posts
        WHERE business_id = ${businessId}
        ORDER BY is_featured DESC, published_at DESC
        LIMIT ${limit} OFFSET ${offset};
      `;
      countRes = await sql`
        SELECT COUNT(*) as total FROM instagram_posts
        WHERE business_id = ${businessId};
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

/**
 * PATCH /api/meta/posts
 * Updates post moderation status (APPROVED, REJECTED, HIDDEN, PENDING) or toggles is_featured.
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { postId, moderationStatus, isFeatured, businessId } = body;

    if (!postId) {
      return NextResponse.json({ success: false, message: "postId is required" }, { status: 400 });
    }

    const tenant = await getTenantContext(businessId);
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    // Verify post belongs to this business
    const existing = await sql`
      SELECT id FROM instagram_posts
      WHERE id = ${postId} AND business_id = ${tenant.businessId}
      LIMIT 1;
    `;

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, message: "Post not found or unauthorized" },
        { status: 404 }
      );
    }

    await sql`
      UPDATE instagram_posts
      SET
        moderation_status = COALESCE(${moderationStatus || null}, moderation_status),
        is_featured = COALESCE(${isFeatured !== undefined ? Boolean(isFeatured) : null}, is_featured),
        updated_at = NOW()
      WHERE id = ${postId} AND business_id = ${tenant.businessId};
    `;

    return NextResponse.json({
      success: true,
      message: "Post status updated successfully.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
