import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";

/**
 * GET /api/gallery/[businessId]/posts
 * Public endpoint to fetch approved posts for embedding in websites.
 * Returns only APPROVED posts.
 * Supports pagination, mediaType filtering, sorting (newest/oldest), and featured priority.
 */
export async function GET(
  req: Request,
  props: { params: Promise<{ businessId: string }> }
) {
  try {
    const params = await props.params;
    const businessId = params.businessId;

    if (!businessId) {
      return NextResponse.json({ success: false, message: "businessId is required" }, { status: 400 });
    }

    const { searchParams } = new URL(req.url);
    const mediaType = searchParams.get("mediaType") || "ALL"; // ALL, IMAGE, VIDEO, CAROUSEL_ALBUM
    const sort = searchParams.get("sort") === "oldest" ? "ASC" : "DESC";
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "18", 10), 1), 60);
    const page = Math.max(parseInt(searchParams.get("page") || "1", 10), 1);
    const offset = (page - 1) * limit;

    let posts;
    let countRes;

    if (mediaType !== "ALL") {
      if (sort === "ASC") {
        posts = await sql`
          SELECT
            id,
            instagram_media_id,
            media_type,
            media_url,
            thumbnail_url,
            caption,
            permalink,
            username,
            published_at,
            is_featured,
            like_count,
            comments_count
          FROM instagram_posts
          WHERE business_id = ${businessId}
            AND moderation_status = 'APPROVED'
            AND media_type = ${mediaType}
          ORDER BY is_featured DESC, published_at ASC
          LIMIT ${limit} OFFSET ${offset};
        `;
      } else {
        posts = await sql`
          SELECT
            id,
            instagram_media_id,
            media_type,
            media_url,
            thumbnail_url,
            caption,
            permalink,
            username,
            published_at,
            is_featured,
            like_count,
            comments_count
          FROM instagram_posts
          WHERE business_id = ${businessId}
            AND moderation_status = 'APPROVED'
            AND media_type = ${mediaType}
          ORDER BY is_featured DESC, published_at DESC
          LIMIT ${limit} OFFSET ${offset};
        `;
      }

      countRes = await sql`
        SELECT COUNT(*) as total
        FROM instagram_posts
        WHERE business_id = ${businessId}
          AND moderation_status = 'APPROVED'
          AND media_type = ${mediaType};
      `;
    } else {
      if (sort === "ASC") {
        posts = await sql`
          SELECT
            id,
            instagram_media_id,
            media_type,
            media_url,
            thumbnail_url,
            caption,
            permalink,
            username,
            published_at,
            is_featured,
            like_count,
            comments_count
          FROM instagram_posts
          WHERE business_id = ${businessId}
            AND moderation_status = 'APPROVED'
          ORDER BY is_featured DESC, published_at ASC
          LIMIT ${limit} OFFSET ${offset};
        `;
      } else {
        posts = await sql`
          SELECT
            id,
            instagram_media_id,
            media_type,
            media_url,
            thumbnail_url,
            caption,
            permalink,
            username,
            published_at,
            is_featured,
            like_count,
            comments_count
          FROM instagram_posts
          WHERE business_id = ${businessId}
            AND moderation_status = 'APPROVED'
          ORDER BY is_featured DESC, published_at DESC
          LIMIT ${limit} OFFSET ${offset};
        `;
      }

      countRes = await sql`
        SELECT COUNT(*) as total
        FROM instagram_posts
        WHERE business_id = ${businessId}
          AND moderation_status = 'APPROVED';
      `;
    }

    const total = parseInt(countRes[0]?.total || "0", 10);

    return NextResponse.json(
      {
        success: true,
        posts,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
          hasMore: page * limit < total,
        },
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
