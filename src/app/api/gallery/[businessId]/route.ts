import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";

/**
 * GET /api/gallery/[businessId]
 * Public endpoint to fetch gallery configuration and metadata for an embed.
 * Never exposes access tokens, passwords, or internal IDs.
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

    const businessRows = await sql`
      SELECT id, name, website_url
      FROM businesses
      WHERE id = ${businessId}
      LIMIT 1;
    `;

    if (businessRows.length === 0) {
      return NextResponse.json({ success: false, message: "Gallery not found" }, { status: 404 });
    }

    const business = businessRows[0];

    const settingsRows = await sql`
      SELECT hashtag, last_synced_at
      FROM gallery_settings
      WHERE business_id = ${businessId}
      LIMIT 1;
    `;

    const settings = settingsRows.length > 0 ? settingsRows[0] : null;

    const countRes = await sql`
      SELECT COUNT(*) as count
      FROM instagram_posts
      WHERE business_id = ${businessId}
        AND moderation_status = 'APPROVED';
    `;

    return NextResponse.json(
      {
        success: true,
        gallery: {
          businessId: business.id,
          businessName: business.name,
          websiteUrl: business.website_url,
          hashtag: settings?.hashtag ? `#${settings.hashtag}` : null,
          totalApprovedPosts: parseInt(countRes[0]?.count || "0", 10),
          lastSyncedAt: settings?.last_synced_at || null,
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
