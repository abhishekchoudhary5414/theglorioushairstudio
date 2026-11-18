export interface Business {
  id: string;
  owner_id?: string | null;
  name: string;
  website_url?: string | null;
  created_at: string;
  updated_at: string;
}

export type ConnectionStatus = "connected" | "disconnected" | "expired" | "error";

export interface InstagramConnection {
  id: string;
  business_id: string;
  instagram_user_id: string;
  instagram_username: string | null;
  facebook_page_id: string | null;
  facebook_page_name: string | null;
  profile_picture_url: string | null;
  token_expires_at: string | null;
  token_type: string;
  connection_status: ConnectionStatus;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface GallerySettings {
  id: string;
  business_id: string;
  hashtag: string | null;
  hashtag_id: string | null;
  auto_sync_enabled: boolean;
  auto_publish_enabled: boolean;
  sync_interval_minutes: number;
  last_synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type ModerationStatus = "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";

export type InstagramMediaType = "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";

export interface InstagramPost {
  id: string;
  business_id: string;
  instagram_media_id: string;
  media_type: InstagramMediaType;
  media_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  permalink: string;
  username: string | null;
  published_at: string | null;
  moderation_status: ModerationStatus;
  is_featured: boolean;
  like_count?: number;
  comments_count?: number;
  created_at: string;
  updated_at: string;
}

export type SyncLogStatus = "SUCCESS" | "FAILED" | "IN_PROGRESS" | "PARTIAL";

export interface SyncLog {
  id: string;
  business_id: string;
  status: SyncLogStatus;
  posts_discovered: number;
  posts_saved: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}
