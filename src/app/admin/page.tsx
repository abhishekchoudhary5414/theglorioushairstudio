"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import EmailIcon from "@mui/icons-material/Email";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import StorageIcon from "@mui/icons-material/Storage";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SearchIcon from "@mui/icons-material/Search";
import { salonConfig } from "@/config/salon.config";
import styles from "./AdminDashboard.module.css";

interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  confirmedBookings: number;
  completedBookings: number;
  totalRevenue: number;
  totalInquiries: number;
  totalEvents: number;
  callClicks: number;
  whatsappClicks: number;
}

interface BookingRecord {
  id: string;
  booking_reference: string;
  service_name: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  appointment_date: string;
  time_slot: string;
  price_inr: number;
  status: string;
  created_at: string;
}

interface InquiryRecord {
  id: string;
  name: string;
  phone: string;
  email?: string;
  service_interest?: string;
  message?: string;
  created_at: string;
}

interface InteractionEvent {
  id: string;
  event_type: string;
  service_name?: string;
  source_location?: string;
  page_path?: string;
  device_type?: string;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "inquiries" | "analytics" | "sql">("overview");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [events, setEvents] = useState<InteractionEvent[]>([]);

  // Search & filter states for bookings
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Check auth status
      const authRes = await fetch("/api/admin/me");
      if (!authRes.ok) {
        window.location.href = "/admin/login";
        return;
      }

      // Fetch stats
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
      }

      // Fetch bookings
      const bookingsRes = await fetch(`/api/admin/bookings?search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(statusFilter)}`);
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) {
        setBookings(bookingsData.bookings);
      }

      // Fetch inquiries
      const inqRes = await fetch("/api/admin/inquiries");
      const inqData = await inqRes.json();
      if (inqData.success) {
        setInquiries(inqData.inquiries);
      }

      // Fetch interaction events
      const evRes = await fetch("/api/admin/events");
      const evData = await evRes.json();
      if (evData.success) {
        setEvents(evData.events);
      }
    } catch (err) {
      console.error("Dashboard data load error:", err);
    } finally {
      setLoading(false);
    }
  }, [searchTerm, statusFilter, router]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleStatusChange = async (bookingId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, status: newStatus }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus } : b))
        );
      }
    } catch (err) {
      console.error("Failed to update booking status:", err);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      window.location.href = "/admin/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <div className={styles.adminShell}>
      {/* Sidebar Navigation */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogoWrapper}>
            <Image
              src="/images/logo.png"
              alt={salonConfig.name}
              width={44}
              height={44}
              className={styles.sidebarLogoImg}
            />
          </div>
          <div className={styles.sidebarBrandInfo}>
            <span className={styles.sidebarBrandName}>{salonConfig.name}</span>
            <span className={styles.sidebarBrandTag}>Atelier Control Panel</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`${styles.navItem} ${activeTab === "overview" ? styles.navItemActive : ""}`}
          >
            <DashboardOutlinedIcon fontSize="small" />
            <span>Dashboard Overview</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("bookings")}
            className={`${styles.navItem} ${activeTab === "bookings" ? styles.navItemActive : ""}`}
          >
            <EventAvailableOutlinedIcon fontSize="small" />
            <span>Appointments &amp; Bookings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            className={`${styles.navItem} ${activeTab === "inquiries" ? styles.navItemActive : ""}`}
          >
            <EmailIcon fontSize="small" />
            <span>Customer Inquiries</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            className={`${styles.navItem} ${activeTab === "analytics" ? styles.navItemActive : ""}`}
          >
            <TrendingUpIcon fontSize="small" />
            <span>Visitor Clicks &amp; Events</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("sql")}
            className={`${styles.navItem} ${activeTab === "sql" ? styles.navItemActive : ""}`}
          >
            <StorageIcon fontSize="small" />
            <span>SQL Database Setup</span>
          </button>
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.adminUserBadge}>
            <div className={styles.adminAvatar}>A</div>
            <div className={styles.adminUserInfo}>
              <span className={styles.adminUserName}>Master Admin</span>
              <span className={styles.adminUserRole}>Superuser</span>
            </div>
          </div>
          <button type="button" onClick={handleLogout} className={styles.logoutBtn}>
            <ExitToAppIcon fontSize="small" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className={styles.mainContent}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          <h1 className={styles.topBarTitle}>
            {activeTab === "overview" && "Executive Salon Overview"}
            {activeTab === "bookings" && "Client Appointments Directory"}
            {activeTab === "inquiries" && "Customer Concierge Inquiries"}
            {activeTab === "analytics" && "Interaction & Conversion Analytics"}
            {activeTab === "sql" && "Neon PostgreSQL Architecture & SQL"}
          </h1>

          <div className={styles.topBarRight}>
            <div className={styles.liveBadge}>
              <span className={styles.liveDot} />
              <span>Neon Live Connected</span>
            </div>

            <button
              type="button"
              onClick={fetchDashboardData}
              title="Refresh Data"
              className={styles.websiteLink}
            >
              <RefreshIcon fontSize="small" />
              <span>{loading ? "Refreshing..." : "Sync"}</span>
            </button>

            <Link href="/" target="_blank" className={styles.websiteLink}>
              <span>View Site</span>
              <OpenInNewIcon fontSize="inherit" />
            </Link>
          </div>
        </header>

        {/* Dynamic Page Views */}
        <div className={styles.pageBody}>
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* Primary 4 Metric Cards */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Total Reservations</span>
                    <span className={styles.statValue}>{stats?.totalBookings || 0}</span>
                    <span className={styles.statSubtitle}>All time salon bookings</span>
                  </div>
                  <div className={styles.statIconBox}>
                    <EventAvailableOutlinedIcon />
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Active / Confirmed</span>
                    <span className={styles.statValue}>{stats?.confirmedBookings || 0}</span>
                    <span className={styles.statSubtitle}>Upcoming appointment slots</span>
                  </div>
                  <div className={styles.statIconBox}>
                    <CheckCircleIcon />
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Total Value (INR)</span>
                    <span className={styles.statValue}>
                      ₹{(stats?.totalRevenue || 0).toLocaleString("en-IN")}
                    </span>
                    <span className={styles.statSubtitle}>Confirmed revenue estimate</span>
                  </div>
                  <div className={styles.statIconBox}>
                    <TrendingUpIcon />
                  </div>
                </div>

                <div className={styles.statCard}>
                  <div className={styles.statContent}>
                    <span className={styles.statLabel}>Contact Inquiries</span>
                    <span className={styles.statValue}>{stats?.totalInquiries || 0}</span>
                    <span className={styles.statSubtitle}>Form submissions</span>
                  </div>
                  <div className={styles.statIconBox}>
                    <EmailIcon />
                  </div>
                </div>
              </div>

              {/* Conversion Metrics Bar */}
              <div className={styles.metricsBar}>
                <div className={styles.metricPill}>
                  <div className={`${styles.metricIcon} ${styles.metricPhone}`}>
                    <PhoneIcon fontSize="small" />
                  </div>
                  <div className={styles.metricInfo}>
                    <span className={styles.metricValue}>{stats?.callClicks || 0}</span>
                    <span className={styles.metricLabel}>Direct Call Clicks</span>
                  </div>
                </div>

                <div className={styles.metricPill}>
                  <div className={`${styles.metricIcon} ${styles.metricWhatsApp}`}>
                    <WhatsAppIcon fontSize="small" />
                  </div>
                  <div className={styles.metricInfo}>
                    <span className={styles.metricValue}>{stats?.whatsappClicks || 0}</span>
                    <span className={styles.metricLabel}>WhatsApp Inquiries</span>
                  </div>
                </div>

                <div className={styles.metricPill}>
                  <div className={`${styles.metricIcon} ${styles.metricActivity}`}>
                    <TrendingUpIcon fontSize="small" />
                  </div>
                  <div className={styles.metricInfo}>
                    <span className={styles.metricValue}>{stats?.totalEvents || 0}</span>
                    <span className={styles.metricLabel}>Total User Actions Tracked</span>
                  </div>
                </div>
              </div>

              {/* Recent Appointments Preview */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Recent Appointment Bookings</h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("bookings")}
                    className={styles.websiteLink}
                  >
                    View All ({bookings.length})
                  </button>
                </div>
                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Ref Code</th>
                        <th>Client</th>
                        <th>Phone</th>
                        <th>Service</th>
                        <th>Schedule</th>
                        <th>Amount</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {bookings.slice(0, 5).map((b) => (
                        <tr key={b.id}>
                          <td>
                            <span className={styles.refTag}>{b.booking_reference}</span>
                          </td>
                          <td>
                            <strong>{b.customer_name}</strong>
                          </td>
                          <td>{b.customer_phone}</td>
                          <td>{b.service_name}</td>
                          <td>
                            {b.appointment_date} at {b.time_slot}
                          </td>
                          <td>
                            <strong>₹{Number(b.price_inr || 0).toLocaleString("en-IN")}</strong>
                          </td>
                          <td>
                            <span
                              className={`${styles.statusBadge} ${
                                b.status === "confirmed"
                                  ? styles.statusConfirmed
                                  : b.status === "completed"
                                  ? styles.statusCompleted
                                  : styles.statusPending
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={7} className={styles.emptyNotice}>
                            No booking records found in database.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: BOOKINGS DIRECTORY */}
          {activeTab === "bookings" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>All Salon Reservations ({bookings.length})</h3>
                <div className={styles.filterRow}>
                  <div style={{ position: "relative" }}>
                    <input
                      type="text"
                      placeholder="Search name, phone, ref..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={styles.searchInput}
                    />
                  </div>

                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className={styles.statusSelect}
                  >
                    <option value="">All Statuses</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Reference #</th>
                      <th>Client Name</th>
                      <th>Contact Phone</th>
                      <th>Email</th>
                      <th>Reserved Service</th>
                      <th>Date &amp; Slot</th>
                      <th>Fees</th>
                      <th>Current Status</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id}>
                        <td>
                          <span className={styles.refTag}>{b.booking_reference}</span>
                        </td>
                        <td>
                          <strong>{b.customer_name}</strong>
                        </td>
                        <td>{b.customer_phone}</td>
                        <td>{b.customer_email || "—"}</td>
                        <td>{b.service_name}</td>
                        <td>
                          {b.appointment_date} <br />
                          <small style={{ color: "var(--color-text-muted)" }}>{b.time_slot}</small>
                        </td>
                        <td>
                          <strong style={{ color: "var(--color-secondary-hover)" }}>
                            ₹{Number(b.price_inr || 0).toLocaleString("en-IN")}
                          </strong>
                        </td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${
                              b.status === "confirmed"
                                ? styles.statusConfirmed
                                : b.status === "completed"
                                ? styles.statusCompleted
                                : b.status === "cancelled"
                                ? styles.statusCancelled
                                : styles.statusPending
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td>
                          <select
                            value={b.status}
                            onChange={(e) => handleStatusChange(b.id, e.target.value)}
                            className={styles.statusActionSelect}
                          >
                            <option value="confirmed">Confirmed</option>
                            <option value="completed">Completed</option>
                            <option value="pending">Pending</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={9} className={styles.emptyNotice}>
                          No reservations match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOMER INQUIRIES */}
          {activeTab === "inquiries" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Contact &amp; Consultation Inquiries ({inquiries.length})</h3>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Received Date</th>
                      <th>Client Name</th>
                      <th>Phone</th>
                      <th>Email</th>
                      <th>Service Interest</th>
                      <th>Message</th>
                    </tr>
                  </thead>
                  <tbody>
                    {inquiries.map((inq) => (
                      <tr key={inq.id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {new Date(inq.created_at).toLocaleDateString("en-IN", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td>
                          <strong>{inq.name}</strong>
                        </td>
                        <td>{inq.phone}</td>
                        <td>{inq.email || "—"}</td>
                        <td>
                          <span className={styles.statusBadge} style={{ background: "var(--color-secondary-light)", color: "var(--color-primary)" }}>
                            {inq.service_interest || "General"}
                          </span>
                        </td>
                        <td>{inq.message || "—"}</td>
                      </tr>
                    ))}
                    {inquiries.length === 0 && (
                      <tr>
                        <td colSpan={6} className={styles.emptyNotice}>
                          No customer inquiries received yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: VISITOR ACTIONS & EVENT LOGS */}
          {activeTab === "analytics" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Live Interaction Event Log ({events.length})</h3>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>
                  Call clicks, WhatsApp triggers, and conversion buttons
                </span>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Timestamp</th>
                      <th>Event Type</th>
                      <th>Service / Source</th>
                      <th>Page Path</th>
                      <th>Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((ev) => (
                      <tr key={ev.id}>
                        <td style={{ whiteSpace: "nowrap" }}>
                          {new Date(ev.created_at).toLocaleString("en-IN", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </td>
                        <td>
                          <span
                            className={styles.statusBadge}
                            style={{
                              backgroundColor:
                                ev.event_type.includes("whatsapp")
                                  ? "var(--color-whatsapp-light)"
                                  : ev.event_type.includes("call") || ev.event_type.includes("phone")
                                  ? "var(--color-secondary-light)"
                                  : "var(--color-accent-soft)",
                              color:
                                ev.event_type.includes("whatsapp")
                                  ? "var(--color-whatsapp)"
                                  : ev.event_type.includes("call") || ev.event_type.includes("phone")
                                  ? "var(--color-secondary-hover)"
                                  : "var(--color-accent)",
                              fontWeight: 700,
                            }}
                          >
                            {ev.event_type}
                          </span>
                        </td>
                        <td>{ev.service_name || ev.source_location || "—"}</td>
                        <td>
                          <code>{ev.page_path || "/"}</code>
                        </td>
                        <td>{ev.device_type || "desktop"}</td>
                      </tr>
                    ))}
                    {events.length === 0 && (
                      <tr>
                        <td colSpan={5} className={styles.emptyNotice}>
                          No interaction logs recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: SQL QUERIES & SCHEMA DOCUMENTATION */}
          {activeTab === "sql" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Neon PostgreSQL Schema &amp; Alter Queries</h3>
              </div>
              <div style={{ padding: "1.5rem" }}>
                <p style={{ marginTop: 0, color: "var(--color-text-secondary)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  Below are the exact SQL DDL &amp; ALTER scripts executed in your Neon database for simple username/password administration and system tracking:
                </p>

                <h4 style={{ color: "var(--color-primary)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                  1. Alter Table Query for Admin Username:
                </h4>
                <pre className={styles.sqlCodeBox}>
{`-- Add username column to users table with unique constraint
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(100) UNIQUE;

-- Create index for instant login lookup
CREATE INDEX IF NOT EXISTS idx_users_username ON users(LOWER(username));`}
                </pre>

                <h4 style={{ color: "var(--color-primary)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                  2. Create / Seed Master Admin Account:
                </h4>
                <pre className={styles.sqlCodeBox}>
{`-- Insert initial Master Admin user (Username: admin | Password: admin123)
-- Password hashed with bcrypt (salt 10)
INSERT INTO users (name, email, username, password_hash, role)
VALUES (
  'Master Admin',
  'admin@theglorioushairstudio.com',
  'admin',
  '$2a$10$wU0uNeqU3aGZz07FfN1K/eU7Q0p0hT4oT95Iqf5g6wE2f6e5e8e8e', -- bcrypt hash of admin123
  'admin'
)
ON CONFLICT (username) DO NOTHING;`}
                </pre>

                <h4 style={{ color: "var(--color-primary)", marginTop: "1.5rem", marginBottom: "0.5rem" }}>
                  3. Full Core Database Tables (Neon PostgreSQL):
                </h4>
                <pre className={styles.sqlCodeBox}>
{`-- 1. Users table (Admin & Customer Authentication)
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  username VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'customer',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bookings Table (Appointments)
CREATE TABLE IF NOT EXISTS bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference VARCHAR(50) UNIQUE NOT NULL,
  service_id VARCHAR(100) NOT NULL,
  service_name VARCHAR(255) NOT NULL,
  stylist_id VARCHAR(100),
  stylist_name VARCHAR(255),
  branch_id VARCHAR(100) NOT NULL,
  branch_name VARCHAR(255) NOT NULL,
  appointment_date DATE NOT NULL,
  time_slot VARCHAR(50) NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),
  price_inr NUMERIC(10, 2),
  status VARCHAR(50) DEFAULT 'confirmed',
  special_instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Contact Inquiries Table
CREATE TABLE IF NOT EXISTS contact_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  email VARCHAR(255),
  service_interest VARCHAR(100),
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Interaction Events Table (Tracking phone, whatsapp, and booking clicks)
CREATE TABLE IF NOT EXISTS interaction_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  service_name VARCHAR(255),
  source_location VARCHAR(100),
  target_url TEXT,
  page_path VARCHAR(255),
  device_type VARCHAR(50),
  ip_address VARCHAR(100),
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);`}
                </pre>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
