import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getTenantContext } from "@/lib/services/tenant.service";
import { InstagramGraphService } from "@/lib/services/instagram.service";

/**
 * PATCH /api/meta/settings
 * Updates business hashtag and auto-sync / auto-publish rules
 */
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { hashtag, autoSyncEnabled, autoPublishEnabled, businessId } = body;

    const tenant = await getTenantContext(businessId);
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const cleanTag = hashtag !== undefined ? InstagramGraphService.normalizeHashtag(hashtag) : undefined;

    // Reset hashtag_id when hashtag changes so it gets resolved freshly on next sync
    await sql`
      INSERT INTO gallery_settings (
        business_id,
        hashtag,
        hashtag_id,
        auto_sync_enabled,
        auto_publish_enabled,
        updated_at
      ) VALUES (
        ${tenant.businessId},
        COALESCE(${cleanTag}, 'reflectionsalon'),
        NULL,
        COALESCE(${autoSyncEnabled !== undefined ? Boolean(autoSyncEnabled) : null}, TRUE),
        COALESCE(${autoPublishEnabled !== undefined ? Boolean(autoPublishEnabled) : null}, FALSE),
        NOW()
      )
      ON CONFLICT (business_id) DO UPDATE SET
        hashtag = CASE WHEN ${cleanTag !== undefined} THEN ${cleanTag} ELSE gallery_settings.hashtag END,
        hashtag_id = CASE WHEN ${cleanTag !== undefined} THEN NULL ELSE gallery_settings.hashtag_id END,
        auto_sync_enabled = CASE WHEN ${autoSyncEnabled !== undefined} THEN ${Boolean(autoSyncEnabled)} ELSE gallery_settings.auto_sync_enabled END,
        auto_publish_enabled = CASE WHEN ${autoPublishEnabled !== undefined} THEN ${Boolean(autoPublishEnabled)} ELSE gallery_settings.auto_publish_enabled END,
        updated_at = NOW();
    `;

    const updated = await sql`
      SELECT * FROM gallery_settings WHERE business_id = ${tenant.businessId} LIMIT 1;
    `;

    return NextResponse.json({
      success: true,
      settings: updated[0],
      message: "Gallery settings updated successfully.",
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
