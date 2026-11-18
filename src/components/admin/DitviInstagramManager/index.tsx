"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import InstagramIcon from "@mui/icons-material/Instagram";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import StarIcon from "@mui/icons-material/Star";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SettingsIcon from "@mui/icons-material/Settings";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import styles from "./DitviInstagramManager.module.css";

interface ConnectionData {
  id: string;
  instagram_user_id: string;
  instagram_username: string | null;
  facebook_page_name: string | null;
  profile_picture_url: string | null;
  connection_status: "connected" | "disconnected" | "expired" | "error";
  token_expires_at: string | null;
  error_message?: string | null;
}

interface SettingsData {
  hashtag: string | null;
  auto_sync_enabled: boolean;
  auto_publish_enabled: boolean;
  last_synced_at: string | null;
}

interface StatsData {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  hidden: number;
  featured: number;
}

interface SyncLogData {
  id: string;
  status: string;
  posts_discovered: number;
  posts_saved: number;
  error_message: string | null;
  started_at: string;
  completed_at: string | null;
}

interface PostRecord {
  id: string;
  instagram_media_id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string | null;
  thumbnail_url: string | null;
  caption: string | null;
  permalink: string;
  username: string | null;
  published_at: string | null;
  moderation_status: "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN";
  is_featured: boolean;
  like_count?: number;
  comments_count?: number;
}

export const DitviInstagramManager: React.FC = () => {
  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLogData[]>([]);
  const [businessName, setBusinessName] = useState("");

  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN">("ALL");

  const [hashtagInput, setHashtagInput] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Fetch connection status & stats
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/meta/status");
      const data = await res.json();
      if (data.success) {
        setBusinessName(data.business?.name || "My Business");
        setConnection(data.connection);
        setSettings(data.settings);
        setStats(data.stats);
        setSyncLogs(data.recentLogs || []);

        if (data.settings) {
          setHashtagInput(data.settings.hashtag || "");
          setAutoSync(Boolean(data.settings.auto_sync_enabled));
          setAutoPublish(Boolean(data.settings.auto_publish_enabled));
        }
      }
    } catch (err: unknown) {
      console.error("Status fetch error:", err);
    }
  }, []);

  // 2. Fetch posts based on active filter
  const fetchPosts = useCallback(async () => {
    try {
      const url = new URL("/api/meta/posts", window.location.origin);
      url.searchParams.set("status", activeTab);
      url.searchParams.set("limit", "50");

      const res = await fetch(url.toString());
      const data = await res.json();
      if (data.success) {
        setPosts(data.posts || []);
      }
    } catch (err: unknown) {
      console.error("Posts fetch error:", err);
    }
  }, [activeTab]);

  useEffect(() => {
    Promise.all([fetchStatus(), fetchPosts()]).finally(() => setIsLoading(false));
  }, [fetchStatus, fetchPosts]);

  // Check URL query parameters for OAuth callbacks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("success") === "connected") {
      setNotification({ type: "success", message: "Instagram Professional account connected successfully!" });
      fetchStatus();
      fetchPosts();
    } else if (params.get("error")) {
      setNotification({ type: "error", message: decodeURIComponent(params.get("error") || "OAuth connection failed") });
    }
  }, [fetchStatus, fetchPosts]);

  // 3. Save hashtag and publishing rules
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/meta/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          hashtag: hashtagInput,
          autoSyncEnabled: autoSync,
          autoPublishEnabled: autoPublish,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: "Gallery settings updated successfully!" });
        fetchStatus();
      } else {
        setNotification({ type: "error", message: data.message || "Failed to save settings" });
      }
    } catch (err: unknown) {
      setNotification({ type: "error", message: (err as Error).message });
    } finally {
      setIsSavingSettings(false);
    }
  };

  // 4. Trigger manual synchronization
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/meta/sync", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: data.message || "Sync finished successfully!" });
        fetchStatus();
        fetchPosts();
      } else {
        setNotification({ type: "error", message: data.message || "Sync encountered warnings" });
      }
    } catch (err: unknown) {
      setNotification({ type: "error", message: (err as Error).message });
    } finally {
      setIsSyncing(false);
    }
  };

  // 5. Disconnect Instagram
  const handleDisconnect = async () => {
    if (!window.confirm("Are you sure you want to disconnect this Instagram account?")) return;
    try {
      const res = await fetch("/api/meta/disconnect", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: "Account disconnected." });
        fetchStatus();
      }
    } catch (err: unknown) {
      setNotification({ type: "error", message: (err as Error).message });
    }
  };

  // 6. Update moderation status
  const handleUpdateStatus = async (postId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/meta/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, moderationStatus: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, moderation_status: newStatus as any } : p))
        );
        fetchStatus();
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // 7. Toggle featured status
  const handleToggleFeatured = async (postId: string, current: boolean) => {
    try {
      const res = await fetch("/api/meta/posts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId, isFeatured: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) =>
          prev.map((p) => (p.id === postId ? { ...p, is_featured: !current } : p))
        );
        fetchStatus();
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const isConnected = connection?.connection_status === "connected";

  return (
    <div className={styles.container}>
      {/* Notifications */}
      {notification && (
        <div className={`${styles.alertBox} ${notification.type === "success" ? styles.alertSuccess : styles.alertError}`}>
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top 2-Column: Connection Status & Hashtag Settings */}
      <div className={styles.grid2}>
        {/* Card 1: Instagram Account Connection */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>
                <InstagramIcon style={{ color: "#e1306c" }} />
                Instagram Connection
              </h3>
              <p className={styles.cardSubtitle}>
                Tenant: <strong>{businessName}</strong>
              </p>
            </div>
            <div>
              {isConnected ? (
                <span className={styles.statusConnected}>
                  <CheckCircleIcon fontSize="inherit" /> Connected
                </span>
              ) : (
                <span className={styles.statusDisconnected}>
                  <CancelIcon fontSize="inherit" /> Disconnected
                </span>
              )}
            </div>
          </div>

          {isConnected ? (
            <div>
              <div className={styles.accountProfile}>
                <div className={styles.avatar}>
                  {connection?.profile_picture_url ? (
                    <Image
                      src={connection.profile_picture_url}
                      alt="Instagram Avatar"
                      width={56}
                      height={56}
                      className={styles.avatarImg}
                    />
                  ) : (
                    <InstagramIcon style={{ color: "var(--color-gold, #c8a05a)" }} />
                  )}
                </div>
                <div>
                  <div className={styles.username}>
                    @{connection?.instagram_username || "Instagram User"}
                  </div>
                  <div className={styles.metaSubtext}>
                    IG ID: {connection?.instagram_user_id} &bull; Page: {connection?.facebook_page_name || "Linked Page"}
                  </div>
                  <div className={styles.metaSubtext}>
                    Token Expiry:{" "}
                    {connection?.token_expires_at
                      ? new Date(connection.token_expires_at).toLocaleDateString()
                      : "60-Day Long-Lived Token"}
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "0.75rem", marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                  className={styles.btnPrimary}
                >
                  <RefreshIcon fontSize="small" className={isSyncing ? "rotating" : ""} />
                  {isSyncing ? "Syncing..." : "Sync Hashtag Now"}
                </button>

                <button
                  type="button"
                  onClick={handleDisconnect}
                  className={styles.btnDanger}
                >
                  <LinkOffIcon fontSize="small" />
                  Disconnect
                </button>
              </div>
            </div>
          ) : (
            <div>
              <p style={{ color: "#a1a1aa", fontSize: "0.9rem", lineHeight: 1.5, marginBottom: "1.25rem" }}>
                Connect your salon&apos;s Instagram Professional (Business or Creator) account via Meta to automatically discover customer posts with your business hashtag.
              </p>
              <a href="/api/meta/connect" className={styles.btnPrimary}>
                <LinkIcon fontSize="small" />
                Connect Instagram Account
              </a>
            </div>
          )}
        </div>

        {/* Card 2: Business Hashtag Settings */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>
                <SettingsIcon style={{ color: "var(--color-gold, #c8a05a)" }} />
                Hashtag &amp; Auto-Publish Rules
              </h3>
              <p className={styles.cardSubtitle}>Configure discovery hashtag &amp; moderation policy</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Business Hashtag (without #)</label>
              <input
                type="text"
                value={hashtagInput}
                onChange={(e) => setHashtagInput(e.target.value)}
                placeholder="e.g. reflectionsalon"
                className={styles.inputField}
                required
              />
              <span style={{ fontSize: "0.75rem", color: "#888888", display: "block", marginTop: "0.25rem" }}>
                Target: #{hashtagInput.replace(/^#+/, "").toLowerCase()}
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={autoSync}
                  onChange={(e) => setAutoSync(e.target.checked)}
                />
                <span>Enable periodic automatic synchronization</span>
              </label>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                />
                <span>Auto-publish discovered posts (otherwise kept PENDING for review)</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSavingSettings}
              className={styles.btnPrimary}
              style={{ marginTop: "0.5rem" }}
            >
              {isSavingSettings ? "Saving..." : "Save Gallery Settings"}
            </button>
          </form>
        </div>
      </div>

      {/* Moderation & Post Management */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <div>
            <h3 className={styles.cardTitle}>Gallery Moderation &amp; Review</h3>
            <p className={styles.cardSubtitle}>
              Total Posts: {stats?.total || 0} &bull; Approved: {stats?.approved || 0} &bull; Pending: {stats?.pending || 0}
            </p>
          </div>
          <button type="button" onClick={fetchPosts} className={styles.btnSecondary}>
            <RefreshIcon fontSize="small" />
            Refresh
          </button>
        </div>

        {/* Filter Tabs */}
        <div className={styles.filterBar}>
          <div className={styles.tabs}>
            {(["ALL", "PENDING", "APPROVED", "REJECTED", "HIDDEN"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`${styles.tabBtn} ${activeTab === tab ? styles.tabBtnActive : ""}`}
              >
                {tab}
                {tab === "PENDING" && stats?.pending ? ` (${stats.pending})` : ""}
                {tab === "APPROVED" && stats?.approved ? ` (${stats.approved})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Posts Grid */}
        {posts.length === 0 ? (
          <div style={{ textAlign: "center", padding: "3rem", color: "#888888" }}>
            No posts found under the <strong>{activeTab}</strong> tab.
            {isConnected && (
              <div style={{ marginTop: "1rem" }}>
                <button type="button" onClick={handleManualSync} className={styles.btnSecondary}>
                  Run Hashtag Sync Now
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={styles.postsGrid}>
            {posts.map((post) => {
              const displayUrl = post.media_url || post.thumbnail_url || "/gallery/gallery-1.jpg";
              const isPending = post.moderation_status === "PENDING";
              const isApproved = post.moderation_status === "APPROVED";
              const isRejected = post.moderation_status === "REJECTED";
              const isHidden = post.moderation_status === "HIDDEN";

              return (
                <div key={post.id} className={styles.postCard}>
                  <div className={styles.postMediaWrapper}>
                    <Image
                      src={displayUrl}
                      alt={post.caption || "Instagram media"}
                      fill
                      sizes="280px"
                      className={styles.postImg}
                    />
                    <span className={`${styles.statusPill} ${styles[`pill${post.moderation_status}`]}`}>
                      {post.moderation_status}
                    </span>
                  </div>

                  <div className={styles.postContent}>
                    {post.caption && <p className={styles.postCaption}>{post.caption}</p>}

                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "#888888" }}>
                      <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : ""}</span>
                      <a
                        href={post.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "var(--color-gold, #c8a05a)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "2px" }}
                      >
                        Instagram <OpenInNewIcon fontSize="inherit" />
                      </a>
                    </div>

                    <div className={styles.postActions}>
                      {!isApproved && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(post.id, "APPROVED")}
                          className={`${styles.actionBtn} ${styles.btnApprove}`}
                        >
                          Approve
                        </button>
                      )}
                      {!isRejected && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(post.id, "REJECTED")}
                          className={`${styles.actionBtn} ${styles.btnReject}`}
                        >
                          Reject
                        </button>
                      )}
                      {!isHidden ? (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(post.id, "HIDDEN")}
                          className={`${styles.actionBtn} ${styles.btnHide}`}
                        >
                          Hide
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(post.id, "APPROVED")}
                          className={`${styles.actionBtn} ${styles.btnApprove}`}
                        >
                          Restore
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(post.id, post.is_featured)}
                        className={`${styles.actionBtn} ${post.is_featured ? styles.btnFeatureActive : styles.btnFeature}`}
                        title={post.is_featured ? "Remove featured badge" : "Mark as featured"}
                      >
                        {post.is_featured ? "★ Featured" : "☆ Feature"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sync Logs */}
      {syncLogs.length > 0 && (
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h3 className={styles.cardTitle}>Recent Synchronization Logs</h3>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem", color: "#d1d5db" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", textAlign: "left", color: "#888888" }}>
                  <th style={{ padding: "0.5rem" }}>Started</th>
                  <th style={{ padding: "0.5rem" }}>Status</th>
                  <th style={{ padding: "0.5rem" }}>Discovered</th>
                  <th style={{ padding: "0.5rem" }}>Saved</th>
                  <th style={{ padding: "0.5rem" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {syncLogs.map((log) => (
                  <tr key={log.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <td style={{ padding: "0.5rem" }}>{new Date(log.started_at).toLocaleString()}</td>
                    <td style={{ padding: "0.5rem" }}>
                      <span
                        style={{
                          color: log.status === "SUCCESS" ? "#4ade80" : "#f87171",
                          fontWeight: 600,
                        }}
                      >
                        {log.status}
                      </span>
                    </td>
                    <td style={{ padding: "0.5rem" }}>{log.posts_discovered}</td>
                    <td style={{ padding: "0.5rem" }}>{log.posts_saved}</td>
                    <td style={{ padding: "0.5rem", color: "#a1a1aa" }}>{log.error_message || "Completed cleanly"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
