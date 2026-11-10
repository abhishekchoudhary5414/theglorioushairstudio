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
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import RefreshIcon from "@mui/icons-material/Refresh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import SendIcon from "@mui/icons-material/Send";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from "@mui/icons-material/Menu";
import BarChartIcon from "@mui/icons-material/BarChart";
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

interface PopularService {
  service_name: string;
  bookings_count: number;
  total_revenue: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "receipts" | "inquiries" | "analytics">("overview");
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [events, setEvents] = useState<InteractionEvent[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);

  // Search & filter states for bookings
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Receipt Generator Form State
  const [receiptForm, setReceiptForm] = useState({
    bookingRef: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceName: "Bridal Signature HD Makeup",
    categoryTitle: "Luxury Bridal Services",
    appointmentDate: "",
    timeSlot: "11:00 AM",
    priceDisplay: "₹15,000",
    specialInstructions: "VIP Bridal Session at Scheme 78 Studio",
  });
  const [isSendingReceipt, setIsSendingReceipt] = useState(false);
  const [receiptStatusMsg, setReceiptStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    setReceiptForm((prev) => ({
      ...prev,
      appointmentDate: prev.appointmentDate || new Date().toISOString().split("T")[0],
    }));
  }, []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const authRes = await fetch("/api/admin/me");
      if (!authRes.ok) {
        router.push("/admin/login");
        return;
      }

      // 1. Fetch Stats & Graphs
      const statsRes = await fetch("/api/admin/stats");
      const statsData = await statsRes.json();
      if (statsData.success) {
        setStats(statsData.stats);
        if (statsData.popularServices) {
          setPopularServices(statsData.popularServices);
        }
      }

      // 2. Fetch Bookings
      const bookingsRes = await fetch(`/api/admin/bookings?search=${encodeURIComponent(searchTerm)}&status=${encodeURIComponent(statusFilter)}`);
      const bookingsData = await bookingsRes.json();
      if (bookingsData.success) {
        setBookings(bookingsData.bookings);
      }

      // 3. Fetch Inquiries
      const inqRes = await fetch("/api/admin/inquiries");
      const inqData = await inqRes.json();
      if (inqData.success) {
        setInquiries(inqData.inquiries);
      }

      // 4. Fetch Events
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
      router.push("/admin/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Populate receipt generator from an existing booking row
  const handlePopulateReceipt = (b: BookingRecord) => {
    setReceiptForm({
      bookingRef: b.booking_reference,
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      customerEmail: b.customer_email || "",
      serviceName: b.service_name,
      categoryTitle: "Salon Atelier Service",
      appointmentDate: String(b.appointment_date).split("T")[0],
      timeSlot: b.time_slot,
      priceDisplay: b.price_inr ? `₹${Number(b.price_inr).toLocaleString("en-IN")}` : "Consultation",
      specialInstructions: "Client confirmed via online portal",
    });
    setActiveTab("receipts");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Dispatch receipt via email API
  const handleSendReceipt = async (e: React.FormEvent) => {
    e.preventDefault();
    setReceiptStatusMsg(null);
    setIsSendingReceipt(true);

    try {
      const res = await fetch("/api/admin/receipt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(receiptForm),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Failed to dispatch receipt.");
      }

      setReceiptStatusMsg({
        type: "success",
        text: `Receipt successfully generated and dispatched to ${receiptForm.customerEmail} with official PDF slip attached!`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Receipt dispatch failed.";
      setReceiptStatusMsg({ type: "error", text: msg });
    } finally {
      setIsSendingReceipt(false);
    }
  };

  const maxBookingsCount = Math.max(...popularServices.map((s) => s.bookings_count), 1);

  return (
    <div className={styles.adminShell}>
      {/* Fixed Sidebar with Cross Button */}
      <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarClosed : ""}`}>
        <div className={styles.sidebarHeader}>
          <div className={brandGroupStyle()}>
            <div className={styles.sidebarLogoWrapper}>
              <Image
                src="/images/logo.png"
                alt={salonConfig.name}
                width={42}
                height={42}
                className={styles.sidebarLogoImg}
              />
            </div>
            <div className={styles.sidebarBrandInfo}>
              <span className={styles.sidebarBrandName}>{salonConfig.name}</span>
              <span className={styles.sidebarBrandTag}>Atelier Control Panel</span>
            </div>
          </div>

          {/* Cross Button to close sidebar */}
          <button
            type="button"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close Sidebar"
            className={styles.closeSidebarBtn}
          >
            <CloseIcon fontSize="small" />
          </button>
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
            <span>Appointments Directory</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("receipts")}
            className={`${styles.navItem} ${activeTab === "receipts" ? styles.navItemActive : ""}`}
          >
            <ReceiptLongIcon fontSize="small" />
            <span>Receipt Generator &amp; Email</span>
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

      {/* 100% Width Main Content Area */}
      <main className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentFull : ""}`}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            {/* Toggle button to open sidebar when closed */}
            {!sidebarOpen && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                title="Open Sidebar Navigation"
                className={styles.toggleSidebarBtn}
              >
                <MenuIcon fontSize="small" />
              </button>
            )}

            <h1 className={styles.topBarTitle}>
              {activeTab === "overview" && "Executive Salon Overview & Graphs"}
              {activeTab === "bookings" && "Client Appointments Directory"}
              {activeTab === "receipts" && "Slip & Receipt Generator (Email PDF)"}
              {activeTab === "inquiries" && "Customer Concierge Inquiries"}
              {activeTab === "analytics" && "Interaction & Conversion Analytics"}
            </h1>
          </div>

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

        {/* Page Content Body taking 100% full width */}
        <div className={styles.pageBody}>
          {/* TAB 1: OVERVIEW & GRAPHS */}
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

              {/* Graphical Visualizations Section */}
              <div className={styles.chartsGrid}>
                {/* Horizontal Bar Graph: Most Booked Services */}
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Top Performing Services</h3>
                  <p className={styles.chartSubtitle}>Most popular salon rituals ranked by reservation count</p>

                  <div className={styles.barChartContainer}>
                    {popularServices.map((svc) => {
                      const percentage = Math.round((svc.bookings_count / maxBookingsCount) * 100);
                      return (
                        <div key={svc.service_name} className={styles.barRow}>
                          <div className={styles.barLabelGroup}>
                            <span className={styles.barName}>{svc.service_name}</span>
                            <span className={styles.barStats}>
                              {svc.bookings_count} bookings • ₹{Number(svc.total_revenue || 0).toLocaleString("en-IN")}
                            </span>
                          </div>
                          <div className={styles.barTrack}>
                            <div className={styles.barFill} style={{ width: `${Math.max(percentage, 10)}%` }} />
                          </div>
                        </div>
                      );
                    })}

                    {popularServices.length === 0 && (
                      <p style={{ color: "var(--color-text-muted)", fontSize: "0.9rem", textAlign: "center", padding: "2rem" }}>
                        Waiting for reservation data to populate charts.
                      </p>
                    )}
                  </div>
                </div>

                {/* Status Breakdown Card */}
                <div className={styles.chartCard}>
                  <h3 className={styles.chartTitle}>Appointment Status</h3>
                  <p className={styles.chartSubtitle}>Current distribution of booking stages</p>

                  <div className={styles.statusDonutList}>
                    <div className={styles.donutItem}>
                      <div className={styles.donutInfo}>
                        <span className={styles.donutIndicator} style={{ backgroundColor: "var(--color-success)" }} />
                        <span className={styles.donutName}>Confirmed</span>
                      </div>
                      <span className={styles.donutValue}>{stats?.confirmedBookings || 0}</span>
                    </div>

                    <div className={styles.donutItem}>
                      <div className={styles.donutInfo}>
                        <span className={styles.donutIndicator} style={{ backgroundColor: "var(--color-secondary)" }} />
                        <span className={styles.donutName}>Pending</span>
                      </div>
                      <span className={styles.donutValue}>{stats?.pendingBookings || 0}</span>
                    </div>

                    <div className={styles.donutItem}>
                      <div className={styles.donutInfo}>
                        <span className={styles.donutIndicator} style={{ backgroundColor: "#2b5278" }} />
                        <span className={styles.donutName}>Completed</span>
                      </div>
                      <span className={styles.donutValue}>{stats?.completedBookings || 0}</span>
                    </div>

                    <div className={styles.donutItem}>
                      <div className={styles.donutInfo}>
                        <span className={styles.donutIndicator} style={{ backgroundColor: "var(--color-accent)" }} />
                        <span className={styles.donutName}>Total Inquiries</span>
                      </div>
                      <span className={styles.donutValue}>{stats?.totalInquiries || 0}</span>
                    </div>
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

              {/* Recent Bookings Table */}
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
                        <th>Action</th>
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
                          <td>
                            <button
                              type="button"
                              onClick={() => handlePopulateReceipt(b)}
                              className={styles.actionBtnSmall}
                              title="Send Receipt to Customer"
                            >
                              <ReceiptLongIcon fontSize="inherit" />
                              <span>Receipt</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                      {bookings.length === 0 && (
                        <tr>
                          <td colSpan={8} className={styles.emptyNotice}>
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
                  <input
                    type="text"
                    placeholder="Search name, phone, ref..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={styles.searchInput}
                  />

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
                      <th>Send Receipt</th>
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
                        <td>
                          <button
                            type="button"
                            onClick={() => handlePopulateReceipt(b)}
                            className={styles.actionBtnSmall}
                          >
                            <ReceiptLongIcon fontSize="inherit" />
                            <span>Dispatch</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                    {bookings.length === 0 && (
                      <tr>
                        <td colSpan={10} className={styles.emptyNotice}>
                          No reservations match your filter criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: RECEIPT GENERATOR & EMAIL DISPATCH */}
          {activeTab === "receipts" && (
            <div className={styles.receiptGenCard}>
              <div className={styles.receiptGenHeader}>
                <h2 className={styles.receiptGenTitle}>Atelier Receipt &amp; Slip Generator</h2>
                <p className={styles.receiptGenSubtitle}>
                  Creates official branded confirmation PDF using <code>slip-template.ts</code> and emails directly to the client.
                </p>
              </div>

              {receiptStatusMsg && (
                <div
                  className={`${styles.receiptMsgBanner} ${
                    receiptStatusMsg.type === "success" ? styles.receiptMsgSuccess : styles.receiptMsgError
                  }`}
                >
                  {receiptStatusMsg.text}
                </div>
              )}

              <form onSubmit={handleSendReceipt}>
                <div className={styles.receiptGrid}>
                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Client Full Name *</label>
                    <input
                      type="text"
                      required
                      value={receiptForm.customerName}
                      onChange={(e) => setReceiptForm({ ...receiptForm, customerName: e.target.value })}
                      placeholder="e.g. Priya Sharma"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Recipient Client Email *</label>
                    <input
                      type="email"
                      required
                      value={receiptForm.customerEmail}
                      onChange={(e) => setReceiptForm({ ...receiptForm, customerEmail: e.target.value })}
                      placeholder="client@gmail.com"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Client Phone Number</label>
                    <input
                      type="text"
                      value={receiptForm.customerPhone}
                      onChange={(e) => setReceiptForm({ ...receiptForm, customerPhone: e.target.value })}
                      placeholder="+91 98765 43210"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Booking Reference Code</label>
                    <input
                      type="text"
                      value={receiptForm.bookingRef}
                      onChange={(e) => setReceiptForm({ ...receiptForm, bookingRef: e.target.value })}
                      placeholder="Auto generated (e.g. GG-849201)"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Reserved Service Name</label>
                    <input
                      type="text"
                      required
                      value={receiptForm.serviceName}
                      onChange={(e) => setReceiptForm({ ...receiptForm, serviceName: e.target.value })}
                      placeholder="Service Name"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Category</label>
                    <input
                      type="text"
                      value={receiptForm.categoryTitle}
                      onChange={(e) => setReceiptForm({ ...receiptForm, categoryTitle: e.target.value })}
                      placeholder="e.g. Luxury Hair Treatments"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Appointment Date</label>
                    <input
                      type="date"
                      required
                      value={receiptForm.appointmentDate}
                      onChange={(e) => setReceiptForm({ ...receiptForm, appointmentDate: e.target.value })}
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Time Slot</label>
                    <input
                      type="text"
                      required
                      value={receiptForm.timeSlot}
                      onChange={(e) => setReceiptForm({ ...receiptForm, timeSlot: e.target.value })}
                      placeholder="11:00 AM"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Price / Fees (INR)</label>
                    <input
                      type="text"
                      required
                      value={receiptForm.priceDisplay}
                      onChange={(e) => setReceiptForm({ ...receiptForm, priceDisplay: e.target.value })}
                      placeholder="₹2,500"
                      className={styles.receiptInput}
                    />
                  </div>
                </div>

                <div className={styles.receiptFieldGroup}>
                  <label className={styles.receiptLabel}>Special Notes / Client Instructions</label>
                  <input
                    type="text"
                    value={receiptForm.specialInstructions}
                    onChange={(e) => setReceiptForm({ ...receiptForm, specialInstructions: e.target.value })}
                    placeholder="e.g. Arrive 10 minutes prior for hair analysis"
                    className={styles.receiptInput}
                  />
                </div>

                <div className={styles.receiptActions}>
                  <button type="submit" disabled={isSendingReceipt} className={styles.sendReceiptBtn}>
                    <SendIcon fontSize="small" />
                    <span>{isSendingReceipt ? "Generating & Emailing..." : "Send Receipt to Client Email"}</span>
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* TAB 4: CUSTOMER INQUIRIES */}
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

          {/* TAB 5: VISITOR ACTIONS & EVENT LOGS */}
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
        </div>
      </main>
    </div>
  );
}

function brandGroupStyle() {
  return styles.brandGroup;
}
