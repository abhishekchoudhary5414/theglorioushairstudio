"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import InstagramIcon from "@mui/icons-material/Instagram";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutlineOutlined";
import CollectionsIcon from "@mui/icons-material/Collections";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import FavoriteIcon from "@mui/icons-material/Favorite";
import RefreshIcon from "@mui/icons-material/Refresh";
import styles from "./DitviInstagramGallery.module.css";

export interface DitviGalleryProps {
  businessId: string;
  columns?: 2 | 3 | 4 | 5;
  limit?: number;
  showFilters?: boolean;
  showHeader?: boolean;
  title?: string;
  subtitle?: string;
}

interface PublicPost {
  id: string;
  instagram_media_id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  permalink: string;
  username: string | null;
  published_at: string | null;
  is_featured: boolean;
  like_count?: number;
  comments_count?: number;
}

interface GalleryMeta {
  businessId: string;
  businessName: string;
  hashtag: string | null;
  totalApprovedPosts: number;
}

export const DitviInstagramGallery: React.FC<DitviGalleryProps> = ({
  businessId,
  columns = 4,
  limit = 12,
  showFilters = true,
  showHeader = true,
  title,
  subtitle,
}) => {
  const [posts, setPosts] = useState<PublicPost[]>([]);
  const [galleryMeta, setGalleryMeta] = useState<GalleryMeta | null>(null);
  const [mediaType, setMediaType] = useState<"ALL" | "IMAGE" | "VIDEO">("ALL");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 1. Fetch Gallery Metadata
  useEffect(() => {
    if (!businessId) return;
    fetch(`/api/gallery/${businessId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.gallery) {
          setGalleryMeta(data.gallery);
        }
      })
      .catch((err) => console.warn("Could not fetch gallery meta:", err));
  }, [businessId]);

  // 2. Fetch Approved Gallery Posts
  const fetchPosts = useCallback(async () => {
    if (!businessId) return;
    setIsLoading(true);
    setError(null);
    try {
      const url = new URL(`/api/gallery/${businessId}/posts`, window.location.origin);
      url.searchParams.set("limit", String(limit));
      url.searchParams.set("sort", sort);
      if (mediaType !== "ALL") {
        url.searchParams.set("mediaType", mediaType);
      }

      const res = await fetch(url.toString());
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to load gallery posts");
      }

      setPosts(data.posts || []);
    } catch (err: unknown) {
      setError((err as Error).message || "Unable to display Instagram gallery at this moment.");
    } finally {
      setIsLoading(false);
    }
  }, [businessId, limit, mediaType, sort]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const gridClass =
    columns === 2
      ? styles.gridCols2
      : columns === 3
      ? styles.gridCols3
      : columns === 5
      ? styles.gridCols5
      : styles.gridCols4;

  return (
    <div className={styles.container}>
      {/* Header section */}
      {showHeader && (
        <div className={styles.header}>
          {galleryMeta?.hashtag && (
            <span className={styles.badge}>
              <InstagramIcon fontSize="small" />
              {galleryMeta.hashtag}
            </span>
          )}
          <h2 className={styles.title}>{title || "Client Transformations & Styles"}</h2>
          <p className={styles.subtitle}>
            {subtitle ||
              (galleryMeta?.hashtag
                ? `Tag ${galleryMeta.hashtag} in your Instagram posts to get featured in our client showcase!`
                : "Real beauty transformations captured live from our salon styling chairs.")}
          </p>
        </div>
      )}

      {/* Filter and sorting controls */}
      {showFilters && (
        <div className={styles.controls}>
          <div className={styles.filterTabs}>
            <button
              onClick={() => setMediaType("ALL")}
              className={`${styles.filterBtn} ${mediaType === "ALL" ? styles.filterBtnActive : ""}`}
            >
              All Posts
            </button>
            <button
              onClick={() => setMediaType("IMAGE")}
              className={`${styles.filterBtn} ${mediaType === "IMAGE" ? styles.filterBtnActive : ""}`}
            >
              Photos
            </button>
            <button
              onClick={() => setMediaType("VIDEO")}
              className={`${styles.filterBtn} ${mediaType === "VIDEO" ? styles.filterBtnActive : ""}`}
            >
              Videos &amp; Reels
            </button>
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as "newest" | "oldest")}
            className={styles.sortSelect}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className={`${styles.grid} ${gridClass}`}>
          {Array.from({ length: columns * 2 }).map((_, i) => (
            <div key={i} className={styles.skeletonCard}>
              <div className={styles.skeletonMedia} />
              <div className={styles.skeletonText} />
            </div>
          ))}
        </div>
      )}

      {/* Error state */}
      {!isLoading && error && (
        <div className={styles.stateBox}>
          <p className={styles.stateTitle}>Gallery Temporarily Unavailable</p>
          <p className={styles.stateDesc}>{error}</p>
          <button onClick={fetchPosts} className={styles.retryBtn}>
            <RefreshIcon fontSize="small" style={{ verticalAlign: "middle", marginRight: "4px" }} />
            Try Again
          </button>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && posts.length === 0 && (
        <div className={styles.stateBox}>
          <InstagramIcon className={styles.stateIcon} />
          <h3 className={styles.stateTitle}>No Public Posts Yet</h3>
          <p className={styles.stateDesc}>
            {galleryMeta?.hashtag
              ? `Be the first to be featured! Post on Instagram with ${galleryMeta.hashtag}.`
              : "No approved Instagram posts are currently featured in this gallery."}
          </p>
        </div>
      )}

      {/* Post Grid */}
      {!isLoading && !error && posts.length > 0 && (
        <div className={`${styles.grid} ${gridClass}`}>
          {posts.map((post) => {
            const displayUrl = post.media_url || post.thumbnail_url || "/gallery/gallery-1.jpg";
            return (
              <div key={post.id} className={styles.card}>
                <div className={styles.mediaWrapper}>
                  <Image
                    src={displayUrl}
                    alt={post.caption || "Instagram style post"}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className={styles.mediaImg}
                    loading="lazy"
                  />

                  {/* Media Type Icon Badge */}
                  {post.media_type === "VIDEO" && (
                    <div className={styles.mediaBadge}>
                      <PlayCircleOutlineIcon fontSize="inherit" />
                      <span>Reel</span>
                    </div>
                  )}
                  {post.media_type === "CAROUSEL_ALBUM" && (
                    <div className={styles.mediaBadge}>
                      <CollectionsIcon fontSize="inherit" />
                      <span>Album</span>
                    </div>
                  )}

                  {/* Featured Tag */}
                  {post.is_featured && <span className={styles.featuredPill}>Featured</span>}
                </div>

                <div className={styles.captionOverlay}>
                  {post.caption && <p className={styles.captionText}>{post.caption}</p>}

                  <div className={styles.cardFooter}>
                    <span>
                      {post.username ? `@${post.username}` : post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}
                    </span>

                    <a
                      href={post.permalink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.instagramLink}
                      title="View original on Instagram"
                    >
                      <InstagramIcon fontSize="inherit" />
                      <span>View</span>
                      <OpenInNewIcon fontSize="inherit" />
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
