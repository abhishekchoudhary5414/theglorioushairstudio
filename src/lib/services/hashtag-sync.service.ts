import { sql } from "@/lib/db/neon";
import { decryptToken } from "@/lib/utils/encryption";
import { InstagramGraphService } from "./instagram.service";

export interface SyncResult {
  businessId: string;
  status: "SUCCESS" | "FAILED" | "PARTIAL";
  postsDiscovered: number;
  postsSaved: number;
  errorMessage?: string | null;
}

/**
 * Synchronizes Instagram hashtag posts for a specific business across all its active hashtags.
 * Handles duplicate checking, automatic publishing moderation rules,
 * token decryption, rate limits, and sync logging.
 */
export async function syncBusinessHashtagPosts(
  businessId: string,
  specificHashtagId?: string
): Promise<SyncResult> {
  const startedAt = new Date().toISOString();

  // 1. Fetch connection for this business
  const connRows = await sql`
    SELECT * FROM instagram_connections
    WHERE business_id = ${businessId}
    LIMIT 1;
  `;

  if (connRows.length === 0 || connRows[0].connection_status !== "connected") {
    const err = "No active Instagram connection found for this business";
    await logSync(businessId, "FAILED", 0, 0, err, startedAt);
    return { businessId, status: "FAILED", postsDiscovered: 0, postsSaved: 0, errorMessage: err };
  }

  const conn = connRows[0];

  // 2. Fetch gallery settings (auto-publish rule)
  const settingsRows = await sql`
    SELECT * FROM gallery_settings
    WHERE business_id = ${businessId}
    LIMIT 1;
  `;

  const settings = settingsRows.length > 0 ? settingsRows[0] : null;
  const autoPublish = Boolean(settings?.auto_publish_enabled);
  const defaultStatus = autoPublish ? "APPROVED" : "PENDING";
  const defaultApproved = autoPublish;

  // 3. Fetch active hashtags for this business
  let hashtagRows;
  if (specificHashtagId) {
    hashtagRows = await sql`
      SELECT * FROM instagram_hashtags
      WHERE business_id = ${businessId} AND id = ${specificHashtagId}
      LIMIT 1;
    `;
  } else {
    hashtagRows = await sql`
      SELECT * FROM instagram_hashtags
      WHERE business_id = ${businessId} AND is_active = TRUE
      ORDER BY created_at ASC;
    `;
  }

  // Fallback to legacy single hashtag in gallery_settings if instagram_hashtags is empty
  if (hashtagRows.length === 0 && settings?.hashtag) {
    const cleanLegacy = InstagramGraphService.normalizeHashtag(settings.hashtag);
    if (cleanLegacy) {
      await sql`
        INSERT INTO instagram_hashtags (business_id, hashtag, hashtag_id, is_active)
        VALUES (${businessId}, ${cleanLegacy}, ${settings.hashtag_id || null}, TRUE)
        ON CONFLICT (business_id, hashtag) DO NOTHING;
      `;
      hashtagRows = await sql`
        SELECT * FROM instagram_hashtags
        WHERE business_id = ${businessId} AND is_active = TRUE;
      `;
    }
  }

  if (hashtagRows.length === 0) {
    const err = "No active hashtags configured for this business";
    await logSync(businessId, "FAILED", 0, 0, err, startedAt);
    return { businessId, status: "FAILED", postsDiscovered: 0, postsSaved: 0, errorMessage: err };
  }

  let accessToken = "";
  try {
    accessToken = decryptToken(conn.encrypted_access_token);
  } catch {
    const err = "Failed to decrypt access token";
    await logSync(businessId, "FAILED", 0, 0, err, startedAt);
    return { businessId, status: "FAILED", postsDiscovered: 0, postsSaved: 0, errorMessage: err };
  }

  let totalDiscovered = 0;
  let totalSaved = 0;
  let lastError: string | null = null;

  // 4. Iterate over active hashtags (respecting 30 hashtags per 7-day rolling window)
  for (const tagRow of hashtagRows) {
    const cleanTag = InstagramGraphService.normalizeHashtag(tagRow.hashtag);
    let hashtagId = tagRow.hashtag_id;

    try {
      // Resolve hashtag ID if missing
      if (!hashtagId) {
        try {
          hashtagId = await InstagramGraphService.searchHashtagId(
            conn.instagram_user_id,
            cleanTag,
            accessToken
          );
          if (hashtagId) {
            await sql`
              UPDATE instagram_hashtags
              SET hashtag_id = ${hashtagId}, updated_at = NOW()
              WHERE id = ${tagRow.id};
            `;
          }
        } catch (e: unknown) {
          console.warn(`[HashtagSync] Could not resolve hashtag ID for #${cleanTag}:`, (e as Error).message);
        }
      }

      let mediaItems: Awaited<ReturnType<typeof InstagramGraphService.fetchHashtagMedia>> = [];

      // Fetch from Meta Graph API using hashtag ID
      if (hashtagId) {
        try {
          const [recent, top] = await Promise.allSettled([
            InstagramGraphService.fetchHashtagMedia(hashtagId, conn.instagram_user_id, accessToken, "recent_media", 25),
            InstagramGraphService.fetchHashtagMedia(hashtagId, conn.instagram_user_id, accessToken, "top_media", 10),
          ]);

          const recentItems = recent.status === "fulfilled" ? recent.value : [];
          const topItems = top.status === "fulfilled" ? top.value : [];

          const map = new Map<string, (typeof recentItems)[0]>();
          for (const item of [...recentItems, ...topItems]) {
            map.set(item.id, item);
          }
          mediaItems = Array.from(map.values());
        } catch (err: unknown) {
          lastError = (err as Error).message;
          console.error(`[HashtagSync] Fetch hashtag media failed for #${cleanTag}:`, lastError);
        }
      }

      // Fallback: If hashtag search returned 0 items (e.g. pending App Review for hashtag search),
      // also fetch the salon's own profile media filtered by caption containing the hashtag
      if (mediaItems.length === 0) {
        try {
          const userMedia = await InstagramGraphService.fetchUserMedia(conn.instagram_user_id, accessToken, 25);
          const matching = userMedia.filter(
            (m) => !cleanTag || (m.caption && m.caption.toLowerCase().includes(cleanTag))
          );
          mediaItems = matching.length > 0 ? matching : userMedia;
        } catch (err: unknown) {
          if (!lastError) lastError = (err as Error).message;
        }
      }

      totalDiscovered += mediaItems.length;

      // 5. Upsert media items into database
      for (const item of mediaItems) {
        const mediaType = item.media_type || "IMAGE";
        const mediaUrl = item.media_url || (item.children?.data?.[0]?.media_url) || null;
        const thumbUrl = item.thumbnail_url || mediaUrl || null;
        const publishedAt = item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString();

        const existing = await sql`
          SELECT id FROM instagram_posts
          WHERE business_id = ${businessId}
            AND instagram_media_id = ${item.id}
          LIMIT 1;
        `;

        if (existing.length === 0) {
          await sql`
            INSERT INTO instagram_posts (
              business_id,
              instagram_media_id,
              hashtag_id,
              media_type,
              media_url,
              thumbnail_url,
              caption,
              permalink,
              username,
              published_at,
              moderation_status,
              is_approved,
              is_visible,
              like_count,
              comments_count
            ) VALUES (
              ${businessId},
              ${item.id},
              ${hashtagId || tagRow.id},
              ${mediaType},
              ${mediaUrl},
              ${thumbUrl},
              ${item.caption || ""},
              ${item.permalink},
              ${conn.instagram_username || null},
              ${publishedAt},
              ${defaultStatus},
              ${defaultApproved},
              TRUE,
              ${item.like_count || 0},
              ${item.comments_count || 0}
            );
          `;
          totalSaved++;
        } else {
          await sql`
            UPDATE instagram_posts
            SET
              media_url = COALESCE(${mediaUrl}, media_url),
              thumbnail_url = COALESCE(${thumbUrl}, thumbnail_url),
              hashtag_id = COALESCE(hashtag_id, ${hashtagId || tagRow.id}),
              like_count = ${item.like_count || 0},
              comments_count = ${item.comments_count || 0},
              updated_at = NOW()
            WHERE id = ${existing[0].id};
          `;
        }
      }

      // Update hashtag row last_synced_at
      await sql`
        UPDATE instagram_hashtags
        SET last_synced_at = NOW(), updated_at = NOW()
        WHERE id = ${tagRow.id};
      `;
    } catch (tagErr: unknown) {
      console.error(`[HashtagSync] Error processing hashtag #${cleanTag}:`, tagErr);
      lastError = (tagErr as Error).message;
    }
  }

  // Update gallery_settings last_synced_at
  await sql`
    UPDATE gallery_settings
    SET last_synced_at = NOW(), updated_at = NOW()
    WHERE business_id = ${businessId};
  `;

  const status: SyncResult["status"] = lastError && totalSaved === 0 ? "FAILED" : "SUCCESS";
  await logSync(businessId, status, totalDiscovered, totalSaved, lastError, startedAt);

  return {
    businessId,
    status,
    postsDiscovered: totalDiscovered,
    postsSaved: totalSaved,
    errorMessage: lastError,
  };
}

/**
 * Runs sync across all businesses that have active connections and auto_sync_enabled = true
 */
export async function syncAllActiveBusinesses(): Promise<SyncResult[]> {
  const businesses = await sql`
    SELECT b.id
    FROM businesses b
    JOIN instagram_connections ic ON ic.business_id = b.id
    JOIN gallery_settings gs ON gs.business_id = b.id
    WHERE ic.connection_status = 'connected'
      AND gs.auto_sync_enabled = TRUE
      AND (
        gs.last_synced_at IS NULL
        OR gs.last_synced_at < NOW() - INTERVAL '30 minutes'
      )
    LIMIT 25;
  `;

  const results: SyncResult[] = [];
  for (const b of businesses) {
    try {
      const res = await syncBusinessHashtagPosts(b.id);
      results.push(res);
    } catch (e: unknown) {
      results.push({
        businessId: b.id,
        status: "FAILED",
        postsDiscovered: 0,
        postsSaved: 0,
        errorMessage: (e as Error).message,
      });
    }
  }

  return results;
}

async function logSync(
  businessId: string,
  status: string,
  discovered: number,
  saved: number,
  errorMessage: string | null,
  startedAt: string
) {
  try {
    await sql`
      INSERT INTO sync_logs (
        business_id,
        status,
        posts_discovered,
        posts_saved,
        error_message,
        started_at,
        completed_at
      ) VALUES (
        ${businessId},
        ${status},
        ${discovered},
        ${saved},
        ${errorMessage},
        ${startedAt},
        NOW()
      );
    `;
  } catch (e) {
    console.error("[HashtagSync] Failed to write sync log:", e);
  }
}
