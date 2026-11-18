/**
 * Instagram Graph API Client
 * Built strictly according to official Meta Graph API v21.0 specs.
 *
 * Supported Permissions (Facebook Login for Business):
 * - instagram_basic
 * - pages_show_list
 * - pages_read_engagement
 * - instagram_manage_insights (optional)
 * - instagram_public_content_access (Feature requiring Meta App Review)
 */

export interface MetaTokenResponse {
  access_token: string;
  token_type: string;
  expires_in?: number;
}

export interface InstagramAccountInfo {
  instagramBusinessAccountId: string;
  instagramUsername: string;
  profilePictureUrl?: string;
  facebookPageId: string;
  facebookPageName: string;
}

export interface InstagramHashtagInfo {
  id: string;
  name: string;
}

export interface InstagramHashtagMediaItem {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url?: string;
  thumbnail_url?: string;
  caption?: string;
  permalink: string;
  timestamp?: string;
  like_count?: number;
  comments_count?: number;
  children?: {
    data: Array<{
      id: string;
      media_type: string;
      media_url: string;
    }>;
  };
}

export class InstagramGraphService {
  private static readonly GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

  /**
   * Exchanges authorization code for short-lived user access token
   */
  static async exchangeCodeForToken(
    code: string,
    redirectUri: string,
    appId: string,
    appSecret: string
  ): Promise<MetaTokenResponse> {
    const url = new URL(`${this.GRAPH_API_BASE}/oauth/access_token`);
    url.searchParams.set("client_id", appId);
    url.searchParams.set("client_secret", appSecret);
    url.searchParams.set("redirect_uri", redirectUri);
    url.searchParams.set("code", code);

    const res = await fetch(url.toString(), { method: "GET" });
    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || "Failed to exchange authorization code";
      console.error("[InstagramGraphService] Token exchange error:", data.error);
      throw new Error(errMsg);
    }

    return data as MetaTokenResponse;
  }

  /**
   * Exchanges short-lived token for 60-day long-lived access token
   */
  static async getLongLivedUserToken(
    shortLivedToken: string,
    appId: string,
    appSecret: string
  ): Promise<MetaTokenResponse> {
    const url = new URL(`${this.GRAPH_API_BASE}/oauth/access_token`);
    url.searchParams.set("grant_type", "fb_exchange_token");
    url.searchParams.set("client_id", appId);
    url.searchParams.set("client_secret", appSecret);
    url.searchParams.set("fb_exchange_token", shortLivedToken);

    const res = await fetch(url.toString(), { method: "GET" });
    const data = await res.json();

    if (!res.ok || data.error) {
      console.warn("[InstagramGraphService] Could not upgrade to long-lived token, falling back to short-lived token:", data.error?.message);
      return {
        access_token: shortLivedToken,
        token_type: "bearer",
        expires_in: 3600,
      };
    }

    return data as MetaTokenResponse;
  }

  /**
   * Discovers the user's Facebook Pages and linked Instagram Professional Account
   */
  static async getConnectedInstagramAccount(userAccessToken: string): Promise<InstagramAccountInfo | null> {
    const url = new URL(`${this.GRAPH_API_BASE}/me/accounts`);
    url.searchParams.set("fields", "id,name,instagram_business_account{id,username,profile_picture_url}");
    url.searchParams.set("access_token", userAccessToken);

    const res = await fetch(url.toString(), { method: "GET" });
    const data = await res.json();

    if (!res.ok || data.error) {
      const errMsg = data.error?.message || "Failed to retrieve Facebook Pages";
      console.error("[InstagramGraphService] Accounts error:", data.error);
      throw new Error(errMsg);
    }

    const pages = data.data || [];
    for (const page of pages) {
      if (page.instagram_business_account && page.instagram_business_account.id) {
        return {
          instagramBusinessAccountId: page.instagram_business_account.id,
          instagramUsername: page.instagram_business_account.username || "",
          profilePictureUrl: page.instagram_business_account.profile_picture_url || "",
          facebookPageId: page.id,
          facebookPageName: page.name || "",
        };
      }
    }

    return null;
  }

  /**
   * Normalizes hashtag string according to Meta requirements:
   * Strips '#', spaces, punctuation, and converts to lowercase.
   */
  static normalizeHashtag(raw: string): string {
    if (!raw) return "";
    return raw
      .replace(/^#+/, "")
      .replace(/[\s\-_]/g, "")
      .trim()
      .toLowerCase();
  }

  /**
   * Searches for a hashtag ID via the IG Business Account
   * Endpoint: GET /ig_hashtag_search?user_id={ig-user-id}&q={hashtag-name}
   */
  static async searchHashtagId(
    igUserId: string,
    hashtag: string,
    accessToken: string
  ): Promise<string | null> {
    const cleanTag = this.normalizeHashtag(hashtag);
    if (!cleanTag) return null;

    const url = new URL(`${this.GRAPH_API_BASE}/ig_hashtag_search`);
    url.searchParams.set("user_id", igUserId);
    url.searchParams.set("q", cleanTag);
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url.toString(), { method: "GET" });
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error("[InstagramGraphService] Hashtag search error:", data.error);
      const errMsg = data.error?.message || "Failed to find hashtag ID";
      throw new Error(errMsg);
    }

    if (data.data && data.data.length > 0) {
      return data.data[0].id as string;
    }

    return null;
  }

  /**
   * Fetches media tagged with a hashtag
   * Endpoint: GET /{ig-hashtag-id}/recent_media or /{ig-hashtag-id}/top_media
   * Fields available: id, caption, media_type, media_url, permalink, timestamp, like_count, comments_count
   */
  static async fetchHashtagMedia(
    hashtagId: string,
    igUserId: string,
    accessToken: string,
    type: "recent_media" | "top_media" = "recent_media",
    limit = 25
  ): Promise<InstagramHashtagMediaItem[]> {
    const url = new URL(`${this.GRAPH_API_BASE}/${hashtagId}/${type}`);
    url.searchParams.set("user_id", igUserId);
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,permalink,timestamp,like_count,comments_count,children{id,media_type,media_url}"
    );
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url.toString(), { method: "GET" });
    const data = await res.json();

    if (!res.ok || data.error) {
      console.error(`[InstagramGraphService] Fetch ${type} error:`, data.error);
      const errMsg = data.error?.message || `Failed to fetch ${type} media`;
      throw new Error(errMsg);
    }

    return (data.data || []) as InstagramHashtagMediaItem[];
  }

  /**
   * Fetches own business posts if hashtag search is waiting for Advanced Access.
   * Useful as fallback to show business's tagged or published work.
   */
  static async fetchUserMedia(
    igUserId: string,
    accessToken: string,
    limit = 25
  ): Promise<InstagramHashtagMediaItem[]> {
    const url = new URL(`${this.GRAPH_API_BASE}/${igUserId}/media`);
    url.searchParams.set(
      "fields",
      "id,caption,media_type,media_url,thumbnail_url,permalink,timestamp,like_count,comments_count"
    );
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("access_token", accessToken);

    const res = await fetch(url.toString(), { method: "GET" });
    const data = await res.json();

    if (!res.ok || data.error) {
      throw new Error(data.error?.message || "Failed to fetch user media");
    }

    return (data.data || []) as InstagramHashtagMediaItem[];
  }
}
