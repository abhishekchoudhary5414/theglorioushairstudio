"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import InstagramIcon from "@mui/icons-material/Instagram";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AddIcon from "@mui/icons-material/Add";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SettingsIcon from "@mui/icons-material/Settings";
import LinkIcon from "@mui/icons-material/Link";
import LinkOffIcon from "@mui/icons-material/LinkOff";
import TagIcon from "@mui/icons-material/Tag";
import styles from "./DitviInstagramManager.module.css";

interface ConnectionData {
  id: string;
  instagram_user_id: string;
  instagram_account_id?: string | null;
  instagram_username: string | null;
  username?: string | null;
  account_name?: string | null;
  account_type?: string | null;
  facebook_page_name: string | null;
  profile_picture_url: string | null;
  connection_status: "connected" | "disconnected" | "expired" | "error";
  token_expires_at: string | null;
  connected_at?: string | null;
  permissions?: string | null;
  error_message?: string | null;
}

interface HashtagItem {
  id: string;
  hashtag: string;
  hashtag_id: string | null;
  is_active: boolean;
  last_synced_at: string | null;
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
  is_approved?: boolean;
  is_visible?: boolean;
  is_featured: boolean;
  like_count?: number;
  comments_count?: number;
}

export const DitviInstagramManager: React.FC = () => {
  const [connection, setConnection] = useState<ConnectionData | null>(null);
  const [hashtags, setHashtags] = useState<HashtagItem[]>([]);
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [syncLogs, setSyncLogs] = useState<SyncLogData[]>([]);
  const [businessName, setBusinessName] = useState("");

  const [posts, setPosts] = useState<PostRecord[]>([]);
  const [activeTab, setActiveTab] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED" | "HIDDEN">("ALL");

  const [newHashtagInput, setNewHashtagInput] = useState("");
  const [autoSync, setAutoSync] = useState(true);
  const [autoPublish, setAutoPublish] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // 1. Fetch status & hashtags
  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/instagram/status");
      const data = await res.json();
      if (data.success) {
        setBusinessName(data.business?.name || "My Business");
        setConnection(data.connection);
        setHashtags(data.hashtags || []);
        setSettings(data.settings);
        setStats(data.stats);
        setSyncLogs(data.recentLogs || []);

        if (data.settings) {
          setAutoSync(Boolean(data.settings.auto_sync_enabled));
          setAutoPublish(Boolean(data.settings.auto_publish_enabled));
        }
      }
    } catch (err: unknown) {
      console.error("Status fetch error:", err);
    }
  }, []);

  // 2. Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      const url = new URL("/api/instagram/posts", window.location.origin);
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

  // 3. Add a new hashtag
  const handleAddHashtag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHashtagInput.trim()) return;
    setIsAddingTag(true);
    try {
      const res = await fetch("/api/instagram/hashtags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ hashtag: newHashtagInput.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: data.message });
        setNewHashtagInput("");
        fetchStatus();
      } else {
        setNotification({ type: "error", message: data.message || "Failed to add hashtag" });
      }
    } catch (err: unknown) {
      setNotification({ type: "error", message: (err as Error).message });
    } finally {
      setIsAddingTag(false);
    }
  };

  // 4. Remove hashtag
  const handleRemoveHashtag = async (id: string, tag: string) => {
    if (!window.confirm(`Are you sure you want to remove #${tag}?`)) return;
    try {
      const res = await fetch(`/api/instagram/hashtags/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: data.message });
        fetchStatus();
      }
    } catch (err: unknown) {
      setNotification({ type: "error", message: (err as Error).message });
    }
  };

  // 5. Toggle hashtag active status
  const handleToggleHashtag = async (id: string, currentState: boolean) => {
    try {
      const res = await fetch(`/api/instagram/hashtags/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentState }),
      });
      const data = await res.json();
      if (data.success) {
        setHashtags((prev) =>
          prev.map((h) => (h.id === id ? { ...h, is_active: !currentState } : h))
        );
      }
    } catch (err: unknown) {
      console.error(err);
    }
  };

  // 6. Save publishing rules
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/meta/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autoSyncEnabled: autoSync,
          autoPublishEnabled: autoPublish,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", message: "Publishing rules updated successfully!" });
        fetchStatus();
      }
    } catch (err: unknown) {
      setNotification({ type: "error", message: (err as Error).message });
    }
  };

  // 7. Trigger manual synchronization
  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch("/api/instagram/sync", { method: "POST" });
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

  // 8. Disconnect Instagram
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

  // 9. Update moderation status
  const handleUpdateStatus = async (postId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/instagram/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moderationStatus: newStatus }),
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

  // 10. Toggle featured status
  const handleToggleFeatured = async (postId: string, current: boolean) => {
    try {
      const res = await fetch(`/api/instagram/posts/${postId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFeatured: !current }),
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

  // 11. Delete post
  const handleDeletePost = async (postId: string) => {
    if (!window.confirm("Delete this post permanently from your database?")) return;
    try {
      const res = await fetch(`/api/instagram/posts/${postId}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setPosts((prev) => prev.filter((p) => p.id !== postId));
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

      {/* Top 2-Column: Connection Status & Hashtag Management */}
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
                    @{connection?.instagram_username || connection?.username || "Instagram User"}
                  </div>
                  {connection?.account_name && (
                    <div style={{ fontSize: "0.85rem", color: "#e4e4e7" }}>
                      {connection.account_name} &bull; <span style={{ color: "var(--color-gold, #c8a05a)" }}>{connection.account_type || "PROFESSIONAL"}</span>
                    </div>
                  )}
                  <div className={styles.metaSubtext}>
                    Account ID: {connection?.instagram_account_id || connection?.instagram_user_id} {connection?.facebook_page_name ? `• Page: ${connection.facebook_page_name}` : ""}
                  </div>
                  <div className={styles.metaSubtext}>
                    Connected: {connection?.connected_at ? new Date(connection.connected_at).toLocaleDateString() : "Active"} &bull; Token Expiry: {connection?.token_expires_at ? new Date(connection.token_expires_at).toLocaleDateString() : "60 Days"}
                  </div>
                  <div className={styles.metaSubtext}>
                    Last Synced:{" "}
                    {settings?.last_synced_at
                      ? new Date(settings.last_synced_at).toLocaleString()
                      : "Never"}
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
                  {isSyncing ? "Syncing..." : "Sync Hashtags Now"}
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
                Connect your salon&apos;s Instagram Professional account via Meta to discover customer posts containing your hashtags.
              </p>
              <a href="/api/instagram/connect" className={styles.btnPrimary}>
                <LinkIcon fontSize="small" />
                Connect Instagram Account
              </a>
            </div>
          )}
        </div>

        {/* Card 2: Multi-Hashtag Management */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div>
              <h3 className={styles.cardTitle}>
                <TagIcon style={{ color: "var(--color-gold, #c8a05a)" }} />
                Hashtag Discovery Settings
              </h3>
              <p className={styles.cardSubtitle}>
                Add hashtags e.g. #salon, #xyzsalon, #salonindore (Meta max: 30/week)
              </p>
            </div>
          </div>

          {/* Add Hashtag Form */}
          <form onSubmit={handleAddHashtag} style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
            <input
              type="text"
              value={newHashtagInput}
              onChange={(e) => setNewHashtagInput(e.target.value)}
              placeholder="e.g. reflectionsalon or #salonindore"
              className={styles.inputField}
              style={{ flex: 1 }}
              required
            />
            <button
              type="submit"
              disabled={isAddingTag}
              className={styles.btnPrimary}
              style={{ whiteSpace: "nowrap" }}
            >
              <AddIcon fontSize="small" />
              {isAddingTag ? "Adding..." : "Add Hashtag"}
            </button>
          </form>

          {/* Hashtags List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "160px", overflowY: "auto" }}>
            {hashtags.length === 0 ? (
              <p style={{ color: "#888888", fontSize: "0.85rem", fontStyle: "italic" }}>
                No hashtags configured yet. Add your first hashtag above.
              </p>
            ) : (
              hashtags.map((h) => (
                <div
                  key={h.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "0.5rem 0.75rem",
                    background: "rgba(255, 255, 255, 0.04)",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <span style={{ fontWeight: 600, color: h.is_active ? "var(--color-gold, #c8a05a)" : "#888888" }}>
                      #{h.hashtag}
                    </span>
                    <span style={{ fontSize: "0.75rem", color: "#666" }}>
                      {h.hashtag_id ? `(ID: ${h.hashtag_id.slice(0, 8)}...)` : "(pending lookup)"}
                    </span>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                    <button
                      type="button"
                      onClick={() => handleToggleHashtag(h.id, h.is_active)}
                      style={{
                        background: "none",
                        border: "none",
                        color: h.is_active ? "#4ade80" : "#a1a1aa",
                        cursor: "pointer",
                        fontSize: "0.75rem",
                        fontWeight: 600,
                      }}
                    >
                      {h.is_active ? "Enabled" : "Disabled"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveHashtag(h.id, h.hashtag)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#f87171",
                        cursor: "pointer",
                        padding: "2px",
                      }}
                      title="Remove hashtag"
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Quick Publishing Rules */}
          <form onSubmit={handleSaveSettings} style={{ marginTop: "1.25rem", borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1rem" }}>
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={autoPublish}
                  onChange={(e) => setAutoPublish(e.target.checked)}
                />
                <span>Auto-publish discovered posts directly to website</span>
              </label>
            </div>
            <button type="submit" className={styles.btnSecondary} style={{ fontSize: "0.8rem", padding: "0.35rem 0.8rem" }}>
              Save Publishing Policy
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
              const isApproved = post.moderation_status === "APPROVED" || post.is_approved === true;
              const isRejected = post.moderation_status === "REJECTED";
              const isHidden = post.moderation_status === "HIDDEN" || post.is_visible === false;

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
                      <button
                        type="button"
                        onClick={() => handleDeletePost(post.id)}
                        className={styles.actionBtn}
                        style={{ background: "rgba(255,255,255,0.06)", color: "#f87171", flex: "0 0 auto", padding: "0.35rem" }}
                        title="Delete permanently"
                      >
                        <DeleteOutlineIcon fontSize="inherit" />
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
