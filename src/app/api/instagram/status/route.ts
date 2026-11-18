import { NextResponse } from "next/server";
import { sql } from "@/lib/db/neon";
import { getTenantContext } from "@/lib/services/tenant.service";

/**
 * GET /api/instagram/status
 * Complete status for the salon dashboard:
 * - Connection status & profile
 * - Active hashtags
 * - Gallery stats
 * - Recent synchronization logs
 */
export async function GET() {
  try {
    const tenant = await getTenantContext();
    if (!tenant) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const businessId = tenant.businessId;

    // 1. Connection
    const connRows = await sql`
      SELECT
        id,
        business_id,
        user_id,
        instagram_user_id,
        instagram_account_id,
        instagram_username,
        username,
        account_name,
        account_type,
        facebook_page_name,
        profile_picture_url,
        token_expires_at,
        connection_status,
        permissions,
        error_message,
        connected_at,
        updated_at
      FROM instagram_connections
      WHERE business_id = ${businessId}
      LIMIT 1;
    `;

    // 2. Hashtags
    const hashtags = await sql`
      SELECT *
      FROM instagram_hashtags
      WHERE business_id = ${businessId}
      ORDER BY created_at ASC;
    `;

    // 3. Settings
    let settingsRows = await sql`
      SELECT *
      FROM gallery_settings
      WHERE business_id = ${businessId}
      LIMIT 1;
    `;

    if (settingsRows.length === 0) {
      await sql`
        INSERT INTO gallery_settings (business_id, hashtag, auto_sync_enabled, auto_publish_enabled)
        VALUES (${businessId}, 'reflectionsalon', TRUE, FALSE)
        ON CONFLICT (business_id) DO NOTHING;
      `;
      settingsRows = await sql`SELECT * FROM gallery_settings WHERE business_id = ${businessId} LIMIT 1;`;
    }

    // 4. Counts
    const postCounts = await sql`
      SELECT
        COUNT(*) AS total,
        COUNT(*) FILTER (WHERE moderation_status = 'APPROVED' OR is_approved = TRUE) AS approved,
        COUNT(*) FILTER (WHERE moderation_status = 'PENDING') AS pending,
        COUNT(*) FILTER (WHERE moderation_status = 'REJECTED') AS rejected,
        COUNT(*) FILTER (WHERE moderation_status = 'HIDDEN' OR is_visible = FALSE) AS hidden,
        COUNT(*) FILTER (WHERE is_featured = TRUE) AS featured
      FROM instagram_posts
      WHERE business_id = ${businessId};
    `;

    // 5. Recent sync logs
    const syncLogs = await sql`
      SELECT id, status, posts_discovered, posts_saved, error_message, started_at, completed_at
      FROM sync_logs
      WHERE business_id = ${businessId}
      ORDER BY started_at DESC
      LIMIT 5;
    `;

    return NextResponse.json({
      success: true,
      business: {
        id: tenant.businessId,
        name: tenant.businessName,
      },
      connection: connRows.length > 0 ? connRows[0] : null,
      hashtags,
      settings: settingsRows.length > 0 ? settingsRows[0] : null,
      stats: postCounts[0] || { total: 0, approved: 0, pending: 0, rejected: 0, hidden: 0, featured: 0 },
      recentLogs: syncLogs,
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { success: false, message: (err as Error).message || "Internal server error" },
      { status: 500 }
    );
  }
}
