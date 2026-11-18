import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getTenantContext } from "@/lib/services/tenant.service";
import { InstagramGraphService } from "@/lib/services/instagram.service";
import { decryptToken } from "@/lib/utils/encryption";

/**
 * GET /api/instagram/hashtags
 * Returns all configured hashtags for the authenticated salon business
 */
export async function GET() {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const hashtags = await sql`
      SELECT *
      FROM instagram_hashtags
      WHERE business_id = ${tenant.businessId}
      ORDER BY created_at ASC;
    `;

    return NextResponse.json({
      success: true,
      hashtags,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/instagram/hashtags
 * Adds a new hashtag for this business, strips '#', normalizes, resolves hashtag ID via Graph API
 */
export async function POST(req: Request) {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const rawTag = body.hashtag;
    if (!rawTag) {
      return NextResponse.json({ success: false, message: "Hashtag is required" }, { status: 400 });
    }

    const cleanTag = InstagramGraphService.normalizeHashtag(rawTag);
    if (!cleanTag) {
      return NextResponse.json({ success: false, message: "Invalid hashtag format" }, { status: 400 });
    }

    // Check 30-hashtag limit per 7 days
    const existingCount = await sql`
      SELECT COUNT(*) as count
      FROM instagram_hashtags
      WHERE business_id = ${tenant.businessId};
    `;

    if (parseInt(existingCount[0]?.count || "0", 10) >= 30) {
      return NextResponse.json(
        {
          success: false,
          message: "Meta limit reached: Maximum 30 unique hashtags can be queried within a 7-day period.",
        },
        { status: 400 }
      );
    }

    // Attempt to resolve hashtag ID if business is connected
    let resolvedHashtagId: string | null = null;
    try {
      const conn = await sql`
        SELECT instagram_user_id, encrypted_access_token
        FROM instagram_connections
        WHERE business_id = ${tenant.businessId} AND connection_status = 'connected'
        LIMIT 1;
      `;
      if (conn.length > 0) {
        const token = decryptToken(conn[0].encrypted_access_token);
        resolvedHashtagId = await InstagramGraphService.searchHashtagId(
          conn[0].instagram_user_id,
          cleanTag,
          token
        );
      }
    } catch (e: unknown) {
      console.warn(`[Hashtags API] Could not eagerly resolve hashtag ID for #${cleanTag}:`, (e as Error).message);
    }

    const inserted = await sql`
      INSERT INTO instagram_hashtags (
        business_id,
        hashtag,
        hashtag_id,
        is_active
      ) VALUES (
        ${tenant.businessId},
        ${cleanTag},
        ${resolvedHashtagId},
        TRUE
      )
      ON CONFLICT (business_id, hashtag) DO UPDATE SET
        is_active = TRUE,
        hashtag_id = COALESCE(EXCLUDED.hashtag_id, instagram_hashtags.hashtag_id),
        updated_at = NOW()
      RETURNING *;
    `;

    return NextResponse.json({
      success: true,
      hashtag: inserted[0],
      message: `Hashtag #${cleanTag} added successfully.`,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
