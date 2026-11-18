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
 * Synchronizes Instagram hashtag posts for a specific business.
 * Handles duplicate checking, automatic publishing moderation rules,
 * token decryption, rate limits, and sync logging.
 */
export async function syncBusinessHashtagPosts(businessId: string): Promise<SyncResult> {
  const startedAt = new Date().toISOString();

  // 1. Fetch connection & settings for this business
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

  const settingsRows = await sql`
    SELECT * FROM gallery_settings
    WHERE business_id = ${businessId}
    LIMIT 1;
  `;

  if (settingsRows.length === 0 || !settingsRows[0].hashtag) {
    const err = "No hashtag configured for this business gallery";
    await logSync(businessId, "FAILED", 0, 0, err, startedAt);
    return { businessId, status: "FAILED", postsDiscovered: 0, postsSaved: 0, errorMessage: err };
  }

  const settings = settingsRows[0];
  const rawTag = settings.hashtag;
  const cleanTag = InstagramGraphService.normalizeHashtag(rawTag);
  const autoPublish = Boolean(settings.auto_publish_enabled);
  const defaultStatus = autoPublish ? "APPROVED" : "PENDING";

  let accessToken = "";
  try {
    accessToken = decryptToken(conn.encrypted_access_token);
  } catch {
    const err = "Failed to decrypt access token";
    await logSync(businessId, "FAILED", 0, 0, err, startedAt);
    return { businessId, status: "FAILED", postsDiscovered: 0, postsSaved: 0, errorMessage: err };
  }

  let postsDiscovered = 0;
  let postsSaved = 0;
  let lastError: string | null = null;

  try {
    // 2. Resolve hashtag ID via Instagram Graph API
    let hashtagId = settings.hashtag_id;
    if (!hashtagId) {
      try {
        hashtagId = await InstagramGraphService.searchHashtagId(
          conn.instagram_user_id,
          cleanTag,
          accessToken
        );
        if (hashtagId) {
          await sql`
            UPDATE gallery_settings
            SET hashtag_id = ${hashtagId}, updated_at = NOW()
            WHERE business_id = ${businessId};
          `;
        }
      } catch (e: unknown) {
        console.warn(`[HashtagSync] Could not resolve hashtag ID for #${cleanTag}:`, (e as Error).message);
      }
    }

    let mediaItems: Awaited<ReturnType<typeof InstagramGraphService.fetchHashtagMedia>> = [];

    // 3. Fetch media from hashtag endpoint
    if (hashtagId) {
      try {
        const [recent, top] = await Promise.allSettled([
          InstagramGraphService.fetchHashtagMedia(hashtagId, conn.instagram_user_id, accessToken, "recent_media", 25),
          InstagramGraphService.fetchHashtagMedia(hashtagId, conn.instagram_user_id, accessToken, "top_media", 10),
        ]);

        const recentItems = recent.status === "fulfilled" ? recent.value : [];
        const topItems = top.status === "fulfilled" ? top.value : [];

        // Deduplicate in-memory by id
        const map = new Map<string, (typeof recentItems)[0]>();
        for (const item of [...recentItems, ...topItems]) {
          map.set(item.id, item);
        }
        mediaItems = Array.from(map.values());
      } catch (err: unknown) {
        lastError = (err as Error).message;
        console.error(`[HashtagSync] Fetch hashtag media failed:`, lastError);
      }
    }

    // 4. Fallback: If hashtag search returned 0 items (e.g. pending App Review for hashtag search),
    // also fetch the salon's own profile media filtered by caption containing the hashtag
    if (mediaItems.length === 0) {
      try {
        const userMedia = await InstagramGraphService.fetchUserMedia(conn.instagram_user_id, accessToken, 25);
        // Filter those containing the hashtag or save all for salon showcase
        const matching = userMedia.filter(
          (m) => !cleanTag || (m.caption && m.caption.toLowerCase().includes(cleanTag))
        );
        mediaItems = matching.length > 0 ? matching : userMedia;
      } catch (err: unknown) {
        if (!lastError) lastError = (err as Error).message;
      }
    }

    postsDiscovered = mediaItems.length;

    // 5. Upsert media items into database
    for (const item of mediaItems) {
      const mediaType = item.media_type || "IMAGE";
      const mediaUrl = item.media_url || (item.children?.data?.[0]?.media_url) || null;
      const thumbUrl = item.thumbnail_url || mediaUrl || null;
      const publishedAt = item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString();

      // Check if post already exists
      const existing = await sql`
        SELECT id, moderation_status
        FROM instagram_posts
        WHERE business_id = ${businessId}
          AND instagram_media_id = ${item.id}
        LIMIT 1;
      `;

      if (existing.length === 0) {
        // Insert new post
        await sql`
          INSERT INTO instagram_posts (
            business_id,
            instagram_media_id,
            media_type,
            media_url,
            thumbnail_url,
            caption,
            permalink,
            username,
            published_at,
            moderation_status,
            like_count,
            comments_count
          ) VALUES (
            ${businessId},
            ${item.id},
            ${mediaType},
            ${mediaUrl},
            ${thumbUrl},
            ${item.caption || ""},
            ${item.permalink},
            ${conn.instagram_username || null},
            ${publishedAt},
            ${defaultStatus},
            ${item.like_count || 0},
            ${item.comments_count || 0}
          );
        `;
        postsSaved++;
      } else {
        // Update counts & freshness without overriding user's manual moderation decisions
        await sql`
          UPDATE instagram_posts
          SET
            media_url = COALESCE(${mediaUrl}, media_url),
            thumbnail_url = COALESCE(${thumbUrl}, thumbnail_url),
            like_count = ${item.like_count || 0},
            comments_count = ${item.comments_count || 0},
            updated_at = NOW()
          WHERE id = ${existing[0].id};
        `;
      }
    }

    // 6. Update last_synced_at timestamp
    await sql`
      UPDATE gallery_settings
      SET last_synced_at = NOW(), updated_at = NOW()
      WHERE business_id = ${businessId};
    `;

    const status: SyncResult["status"] = lastError && postsSaved === 0 ? "FAILED" : "SUCCESS";
    await logSync(businessId, status, postsDiscovered, postsSaved, lastError, startedAt);

    return {
      businessId,
      status,
      postsDiscovered,
      postsSaved,
      errorMessage: lastError,
    };
  } catch (err: unknown) {
    const errorMsg = (err as Error).message || "Unknown error during sync";
    await logSync(businessId, "FAILED", postsDiscovered, postsSaved, errorMsg, startedAt);
    return {
      businessId,
      status: "FAILED",
      postsDiscovered,
      postsSaved,
      errorMessage: errorMsg,
    };
  }
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
      AND gs.hashtag IS NOT NULL
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
