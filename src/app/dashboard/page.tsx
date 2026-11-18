"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import PersonIcon from "@mui/icons-material/Person";
import MenuIcon from "@mui/icons-material/Menu";
import CloseIcon from "@mui/icons-material/Close";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AdminDashboardPage from "@/app/admin/page";
import { salonConfig } from "@/config/salon.config";
import styles from "./ExecutiveDashboard.module.css";

interface CustomerUser {
  id: string;
  name: string;
  email: string;
  mobileNumber?: string;
  phone?: string;
  role: string;
}

interface AppointmentItem {
  id: string;
  booking_reference: string;
  service_name: string;
  stylist_name?: string;
  appointment_date: string;
  time_slot: string;
  price_inr?: number;
  total_amount?: number;
  points_redeemed?: number;
  discount_amount?: number;
  payable_amount?: number;
  payment_status: string;
  status: string;
}

interface LoyaltySummary {
  currentPoints: number;
  totalEarned: number;
  totalRedeemed: number;
  totalExpired: number;
  expiringSoonPoints: number;
  nextExpiryDate: string | null;
}

interface LoyaltyTransaction {
  id: string;
  transaction_type: string;
  points: number;
  description: string;
  expires_at?: string;
  status: string;
  created_at: string;
}

interface PaymentItem {
  id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  currency: string;
  payment_status: string;
  booking_reference?: string;
  service_name?: string;
  created_at: string;
}

interface CustomerReceipt {
  id: string;
  receipt_number: string;
  booking_reference?: string;
  service_name: string;
  category_title?: string;
  appointment_date: string;
  time_slot: string;
  base_amount: number;
  discount_percentage?: number;
  discount_amount?: number;
  final_payable: number;
  payment_status: string;
  payment_method: string;
  sent_via_email?: boolean;
  created_at: string;
}

export default function CustomerDashboardPage() {
  const router = useRouter();

  // Desktop & Mobile sidebar state
  // On desktop: true = full sidebar (280px), false = collapsed sidebar (76px showing icons & logo)
  // On mobile: true = drawer slide in, false = drawer hidden
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentUser, setCurrentUser] = useState<CustomerUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Tabs: overview | appointments | loyalty | payments | receipts | profile
  const [activeTab, setActiveTab] = useState<"overview" | "appointments" | "loyalty" | "payments" | "receipts" | "profile">("overview");

  // Read URL query ?tab=loyalty or #loyalty on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      const tabParam = url.searchParams.get("tab") || window.location.hash.replace("#", "");
      if (tabParam && ["overview", "appointments", "loyalty", "payments", "receipts", "profile"].includes(tabParam)) {
        setActiveTab(tabParam as "overview" | "appointments" | "loyalty" | "payments" | "receipts" | "profile");
      }
    }
  }, []);

  // Tab data states
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [loyaltySummary, setLoyaltySummary] = useState<LoyaltySummary | null>(null);
  const [loyaltyTransactions, setLoyaltyTransactions] = useState<LoyaltyTransaction[]>([]);
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [receipts, setReceipts] = useState<CustomerReceipt[]>([]);

  // Profile form state
  const [editName, setEditName] = useState("");
  const [editMobile, setEditMobile] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [profileMsg, setProfileMsg] = useState("");
  const [profileError, setProfileError] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/auth/me");
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (data.authenticated && data.user) {
          if (data.user.role === "admin") {
            setIsAdmin(true);
            setLoading(false);
            return;
          }
          setCurrentUser(data.user);
          setEditName(data.user.name || "");
          setEditMobile(data.user.mobileNumber || data.user.phone || "");
          if (data.loyalty) {
            setLoyaltySummary(data.loyalty);
          }
        } else {
          window.location.href = "/login";
          return;
        }
      } catch {
        window.location.href = "/login";
        return;
      } finally {
        setLoading(false);
      }
    }
    loadSession();
  }, []);

  // Fetch appointments
  useEffect(() => {
    if (!currentUser) return;
    async function fetchAppointments() {
      try {
        const res = await fetch("/api/user/appointments");
        const data = await res.json();
        if (data.success) {
          setAppointments(data.appointments || []);
        }
      } catch (err) {
        console.error("Failed to load appointments:", err);
      }
    }
    fetchAppointments();
  }, [currentUser]);

  // Fetch loyalty
  useEffect(() => {
    if (!currentUser) return;
    async function fetchLoyalty() {
      try {
        const res = await fetch("/api/user/loyalty");
        const data = await res.json();
        if (data.success) {
          setLoyaltySummary(data.summary);
          setLoyaltyTransactions(data.transactions || []);
        }
      } catch (err) {
        console.error("Failed to load loyalty:", err);
      }
    }
    fetchLoyalty();
  }, [currentUser, activeTab]);

  // Fetch payments
  useEffect(() => {
    if (!currentUser) return;
    async function fetchPayments() {
      try {
        const res = await fetch("/api/user/payments");
        const data = await res.json();
        if (data.success) {
          setPayments(data.payments || []);
        }
      } catch (err) {
        console.error("Failed to load payments:", err);
      }
    }
    fetchPayments();
  }, [currentUser, activeTab]);

  // Fetch generated payment receipts
  useEffect(() => {
    if (!currentUser) return;
    async function fetchReceipts() {
      try {
        const res = await fetch("/api/user/receipts");
        const data = await res.json();
        if (data.success) {
          setReceipts(data.receipts || []);
        }
      } catch (err) {
        console.error("Failed to load receipts:", err);
      }
    }
    fetchReceipts();
  }, [currentUser, activeTab]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/login";
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg("");
    setProfileError("");
    setIsSavingProfile(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: editName,
          mobileNumber: editMobile,
          currentPassword: currentPassword || undefined,
          newPassword: newPassword || undefined,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setProfileMsg("Profile updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        setProfileError(data.message || "Failed to update profile.");
      }
    } catch {
      setProfileError("An unexpected error occurred.");
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "10rem 1rem", color: "var(--color-secondary)", fontSize: "1.2rem", fontWeight: 600 }}>
        Loading your client sanctuary...
      </div>
    );
  }

  // Preserve admin access redirection
  if (isAdmin) {
    return <AdminDashboardPage />;
  }

  const upcomingAppointments = appointments.filter(a => a.status !== "completed" && a.status !== "cancelled");

  return (
    <div className={styles.customerShell}>
      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div
          className={styles.sidebarOverlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* 1. Left Fixed Executive Sidebar */}
      <aside
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarCollapsed}`}
      >
        <div className={`${styles.sidebarHeader} ${!sidebarOpen ? styles.sidebarHeaderCollapsed : ""}`}>
          {sidebarOpen ? (
            <>
              <div className={styles.brandGroup}>
                <div className={styles.sidebarLogoWrapper}>
                  <Image
                    src={salonConfig.logo}
                    alt={salonConfig.name}
                    width={40}
                    height={40}
                    className={styles.sidebarLogoImg}
                  />
                </div>
                <div className={styles.sidebarBrandInfo}>
                  <span className={styles.sidebarBrandName}>{salonConfig.name}</span>
                  <span className={styles.sidebarBrandTag}>Client Privilege Portal</span>
                </div>
              </div>
              <button
                type="button"
                className={styles.closeSidebarBtn}
                onClick={() => setSidebarOpen(false)}
                title="Collapse Sidebar"
                aria-label="Collapse Sidebar"
              >
                <CloseIcon fontSize="small" />
              </button>
            </>
          ) : (
            <>
              <div className={styles.sidebarLogoWrapper} title={salonConfig.name}>
                <Image
                  src={salonConfig.logo}
                  alt={salonConfig.name}
                  width={40}
                  height={40}
                  className={styles.sidebarLogoImg}
                />
              </div>
              <button
                type="button"
                className={styles.openSidebarMiniBtn}
                onClick={() => setSidebarOpen(true)}
                title="Expand Sidebar"
                aria-label="Expand Sidebar"
              >
                <MenuIcon fontSize="small" />
              </button>
            </>
          )}
        </div>

        <nav className={styles.sidebarNav}>
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            title="Dashboard Overview"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "overview" ? styles.navItemActive : ""}`}
          >
            <DashboardOutlinedIcon fontSize="small" />
            {sidebarOpen && <span>Dashboard Overview</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("appointments")}
            title="My Appointments"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "appointments" ? styles.navItemActive : ""}`}
          >
            <EventAvailableOutlinedIcon fontSize="small" />
            {sidebarOpen && <span>My Appointments</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("loyalty")}
            title="Loyalty & Rewards Wallet"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "loyalty" ? styles.navItemActive : ""}`}
          >
            <LoyaltyIcon fontSize="small" />
            {sidebarOpen && <span>Loyalty &amp; Rewards Wallet</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("payments")}
            title="Payment Ledger"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "payments" ? styles.navItemActive : ""}`}
          >
            <ReceiptLongIcon fontSize="small" />
            {sidebarOpen && <span>Payment Ledger</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("receipts")}
            title="Payment Receipts & Slips"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "receipts" ? styles.navItemActive : ""}`}
          >
            <ReceiptLongIcon fontSize="small" style={{ color: "var(--color-secondary)" }} />
            {sidebarOpen && <span>Payment Receipts ({receipts.length})</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            title="Account Profile"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "profile" ? styles.navItemActive : ""}`}
          >
            <PersonIcon fontSize="small" />
            {sidebarOpen && <span>Account Profile</span>}
          </button>
        </nav>

        <div className={`${styles.sidebarFooter} ${!sidebarOpen ? styles.sidebarFooterCollapsed : ""}`}>
          {sidebarOpen ? (
            <div className={styles.clientUserBadge}>
              <div className={styles.clientAvatar}>
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "C"}
              </div>
              <div className={styles.clientUserInfo}>
                <span className={styles.clientUserName}>{currentUser?.name || "Member Client"}</span>
                <span className={styles.clientUserEmail}>{currentUser?.email}</span>
              </div>
            </div>
          ) : (
            <div
              className={styles.clientAvatar}
              title={`${currentUser?.name || "Member"} (${currentUser?.email})`}
            >
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "C"}
            </div>
          )}

          <button
            type="button"
            onClick={handleLogout}
            title="Sign Out"
            className={`${styles.logoutBtn} ${!sidebarOpen ? styles.logoutBtnCollapsed : ""}`}
          >
            <ExitToAppIcon fontSize="small" />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. Main Executive Content Area */}
      <main className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentMini : ""}`}>
        {/* Executive Sticky Top Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <button
              type="button"
              className={styles.mobileHamburgerBtn}
              onClick={() => setSidebarOpen((prev) => !prev)}
              aria-label="Toggle Dashboard Menu"
              title="Menu"
            >
              <MenuIcon fontSize="medium" />
            </button>

            <h2 className={styles.topBarTitle}>
              {activeTab === "overview" && "Client Executive Overview"}
              {activeTab === "appointments" && "My Appointments Directory"}
              {activeTab === "loyalty" && "Loyalty Rewards Wallet & History"}
              {activeTab === "payments" && "Verified Payments Ledger"}
              {activeTab === "receipts" && "Official Payment Receipts & Slips"}
              {activeTab === "profile" && "Account & Password Settings"}
            </h2>
          </div>

          <div className={styles.topBarRight}>
            <div className={styles.membershipBadge}>
              <CardGiftcardIcon fontSize="small" />
              <span>{loyaltySummary?.currentPoints ?? 0} Pts</span>
            </div>

            <Link href="/booking" className={styles.newBookingBtn}>
              <CalendarMonthIcon fontSize="small" />
              <span>Book Appointment</span>
            </Link>
          </div>
        </header>

        {/* Dynamic Page Body */}
        <div className={styles.pageBody}>
          {/* Executive 4-Stat Metric Cards Grid */}
          <div className={styles.statsGrid}>
            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Available Loyalty Points</span>
                <span className={`${styles.statValue} ${styles.statValueGold}`}>
                  {loyaltySummary?.currentPoints ?? 0} pts
                </span>
                <span className={styles.statSubtitle}>Equivalent to ₹{loyaltySummary?.currentPoints ?? 0} salon discount</span>
              </div>
              <div className={styles.statIconWrapper}>
                <LoyaltyIcon fontSize="medium" />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Total Bookings</span>
                <span className={styles.statValue}>{appointments.length}</span>
                <span className={styles.statSubtitle}>{upcomingAppointments.length} upcoming reservations</span>
              </div>
              <div className={styles.statIconWrapper}>
                <EventAvailableOutlinedIcon fontSize="medium" />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Lifetime Points Earned</span>
                <span className={styles.statValue}>{loyaltySummary?.totalEarned ?? 0}</span>
                <span className={styles.statSubtitle}>
                  {loyaltySummary?.totalRedeemed ? `${loyaltySummary.totalRedeemed} points redeemed` : "Total accumulated reward points"}
                </span>
              </div>
              <div className={styles.statIconWrapper}>
                <CardGiftcardIcon fontSize="medium" />
              </div>
            </div>

            <div className={styles.statCard}>
              <div className={styles.statContent}>
                <span className={styles.statLabel}>Total Amount Spent</span>
                <span className={styles.statValue}>
                  ₹{payments.filter(p => p.payment_status === "captured").reduce((sum, p) => sum + Number(p.amount), 0).toFixed(0)}
                </span>
                <span className={styles.statSubtitle}>Across {payments.length} verified transactions</span>
              </div>
              <div className={styles.statIconWrapper}>
                <ReceiptLongIcon fontSize="medium" />
              </div>
            </div>
          </div>

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <>
              {/* Upcoming Appointments Table */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    <CalendarMonthIcon fontSize="small" style={{ color: "var(--color-secondary)" }} />
                    <span>Recent &amp; Upcoming Appointments</span>
                  </h3>
                  <Link href="/booking" style={{ color: "var(--color-secondary-hover)", fontWeight: 700, fontSize: "0.85rem", textDecoration: "none" }}>
                    + Book New Slot
                  </Link>
                </div>

                <div className={styles.tableResponsive}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Booking Ref</th>
                        <th>Service</th>
                        <th>Date &amp; Time</th>
                        <th>Stylist</th>
                        <th>Payable</th>
                        <th>Payment Status</th>
                        <th>Appointment Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 5).map((apt) => (
                        <tr key={apt.id}>
                          <td><strong>{apt.booking_reference}</strong></td>
                          <td>{apt.service_name}</td>
                          <td>
                            {new Date(apt.appointment_date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })} at {apt.time_slot}
                          </td>
                          <td>{apt.stylist_name || "Any Expert"}</td>
                          <td><strong>₹{apt.payable_amount ?? apt.price_inr ?? 0}</strong></td>
                          <td>
                            <span className={apt.payment_status === "paid" ? styles.statusBadgeSuccess : styles.statusBadgePending}>
                              {apt.payment_status === "paid" ? "Paid Online" : "Pay at Salon"}
                            </span>
                          </td>
                          <td>
                            <span className={styles.statusBadgeSuccess}>{apt.status}</span>
                          </td>
                        </tr>
                      ))}
                      {appointments.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "2.5rem" }}>
                            You have no scheduled appointments yet.{" "}
                            <Link href="/booking" style={{ color: "var(--color-secondary)", fontWeight: 700 }}>
                              Book Your First Session &rarr;
                            </Link>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Loyalty Highlights */}
              <div className={styles.sectionCard}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>
                    <LoyaltyIcon fontSize="small" style={{ color: "var(--color-secondary)" }} />
                    <span>Loyalty Privilege Wallet Activity</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => setActiveTab("loyalty")}
                    style={{ background: "none", border: "none", color: "var(--color-secondary-hover)", fontWeight: 700, cursor: "pointer", fontSize: "0.85rem" }}
                  >
                    View All History &rarr;
                  </button>
                </div>

                <div className={styles.tableResponsive}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Description</th>
                        <th>Points</th>
                        <th>Expiry Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loyaltyTransactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id}>
                          <td>{new Date(tx.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                          <td><strong style={{ textTransform: "capitalize" }}>{tx.transaction_type}</strong></td>
                          <td>{tx.description}</td>
                          <td style={{ fontWeight: 800, color: tx.points > 0 ? "var(--color-success)" : "#a82b2b" }}>
                            {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                          </td>
                          <td>{tx.expires_at ? new Date(tx.expires_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"}</td>
                        </tr>
                      ))}
                      {loyaltyTransactions.length === 0 && (
                        <tr>
                          <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                            No loyalty point transactions recorded yet. Book and pay online to earn 10 points per ₹100 spent!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: APPOINTMENTS DIRECTORY */}
          {activeTab === "appointments" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Complete Appointments Directory</h3>
                <Link href="/booking" className={styles.newBookingBtn}>
                  + Book Appointment
                </Link>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Booking Ref</th>
                      <th>Service Details</th>
                      <th>Reserved Date &amp; Slot</th>
                      <th>Assigned Stylist</th>
                      <th>Total Fees</th>
                      <th>Discount</th>
                      <th>Payable</th>
                      <th>Payment</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {appointments.map((apt) => (
                      <tr key={apt.id}>
                        <td><strong>{apt.booking_reference}</strong></td>
                        <td>{apt.service_name}</td>
                        <td>
                          {new Date(apt.appointment_date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })} at {apt.time_slot}
                        </td>
                        <td>{apt.stylist_name || "Any Expert"}</td>
                        <td>₹{apt.total_amount ?? apt.price_inr ?? 0}</td>
                        <td style={{ color: "var(--color-success)" }}>
                          {apt.discount_amount ? `-₹${apt.discount_amount}` : "—"}
                        </td>
                        <td><strong>₹{apt.payable_amount ?? apt.price_inr ?? 0}</strong></td>
                        <td>
                          <span className={apt.payment_status === "paid" ? styles.statusBadgeSuccess : styles.statusBadgePending}>
                            {apt.payment_status === "paid" ? "Paid Online" : "Pay at Salon"}
                          </span>
                        </td>
                        <td>
                          <span className={styles.statusBadgeSuccess}>{apt.status}</span>
                        </td>
                      </tr>
                    ))}
                    {appointments.length === 0 && (
                      <tr>
                        <td colSpan={9} style={{ textAlign: "center", padding: "3rem" }}>
                          No appointments found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: LOYALTY WALLET */}
          {activeTab === "loyalty" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Loyalty Rewards Wallet Ledger</h3>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Transaction Type</th>
                      <th>Description</th>
                      <th>Points</th>
                      <th>Expiry Date (Asia/Kolkata)</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loyaltyTransactions.map((tx) => (
                      <tr key={tx.id}>
                        <td>{new Date(tx.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                        <td><strong style={{ textTransform: "capitalize" }}>{tx.transaction_type}</strong></td>
                        <td>{tx.description}</td>
                        <td style={{ fontWeight: 800, color: tx.points > 0 ? "var(--color-success)" : "#a82b2b" }}>
                          {tx.points > 0 ? `+${tx.points}` : tx.points} pts
                        </td>
                        <td>{tx.expires_at ? new Date(tx.expires_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" }) : "—"}</td>
                        <td><span className={styles.statusBadgeSuccess}>{tx.status}</span></td>
                      </tr>
                    ))}
                    {loyaltyTransactions.length === 0 && (
                      <tr>
                        <td colSpan={6} style={{ textAlign: "center", padding: "3rem" }}>
                          No loyalty points transactions recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: PAYMENTS LEDGER */}
          {activeTab === "payments" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Razorpay Verified Payments Ledger</h3>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Payment ID</th>
                      <th>Order ID</th>
                      <th>Service Details</th>
                      <th>Amount Paid</th>
                      <th>Currency</th>
                      <th>Payment Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {payments.map((p) => (
                      <tr key={p.id}>
                        <td>{new Date(p.created_at).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
                        <td><code>{p.razorpay_payment_id || "—"}</code></td>
                        <td><code>{p.razorpay_order_id}</code></td>
                        <td>{p.service_name || p.booking_reference || "Salon Service"}</td>
                        <td><strong>₹{p.amount}</strong></td>
                        <td>{p.currency}</td>
                        <td>
                          <span className={p.payment_status === "captured" ? styles.statusBadgeSuccess : styles.statusBadgePending}>
                            {p.payment_status}
                          </span>
                        </td>
                      </tr>
                    ))}
                    {payments.length === 0 && (
                      <tr>
                        <td colSpan={7} style={{ textAlign: "center", padding: "3rem" }}>
                          No payment transactions on record yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: OFFICIAL PAYMENT RECEIPTS & SLIPS */}
          {activeTab === "receipts" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>
                  <ReceiptLongIcon fontSize="small" style={{ color: "var(--color-secondary)" }} />
                  <span>My Official Payment Receipts ({receipts.length})</span>
                </h3>
              </div>

              <div className={styles.tableResponsive}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Receipt #</th>
                      <th>Booking Ref</th>
                      <th>Service</th>
                      <th>Appointment Date</th>
                      <th>Base Price</th>
                      <th>Discount</th>
                      <th>Amount Paid</th>
                      <th>Payment Mode</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.map((r) => (
                      <tr key={r.id}>
                        <td>
                          <strong style={{ color: "var(--color-secondary-hover)" }}>{r.receipt_number}</strong>
                        </td>
                        <td><code>{r.booking_reference || "—"}</code></td>
                        <td>{r.service_name}</td>
                        <td>
                          {new Date(r.appointment_date).toLocaleDateString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", year: "numeric" })} at {r.time_slot}
                        </td>
                        <td>₹{Number(r.base_amount || r.final_payable || 0).toLocaleString("en-IN")}</td>
                        <td style={{ color: "var(--color-success)" }}>
                          {r.discount_amount && Number(r.discount_amount) > 0 ? `-₹${Number(r.discount_amount).toLocaleString("en-IN")}` : "—"}
                        </td>
                        <td>
                          <strong style={{ fontSize: "0.95rem" }}>₹{Number(r.final_payable).toLocaleString("en-IN")}</strong>
                        </td>
                        <td style={{ textTransform: "capitalize" }}>
                          {r.payment_method ? r.payment_method.replace(/_/g, " ") : "In-Salon"}
                        </td>
                        <td>
                          <span className={styles.statusBadgeSuccess}>
                            {r.payment_status === "paid" ? "Paid" : r.payment_status}
                          </span>
                        </td>
                        <td>
                          <a
                            href={`/api/receipts/${r.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "0.3rem",
                              padding: "0.4rem 0.75rem",
                              background: "rgba(197, 160, 89, 0.15)",
                              border: "1px solid var(--color-secondary)",
                              color: "var(--color-secondary-hover)",
                              borderRadius: "6px",
                              fontSize: "0.78rem",
                              fontWeight: 700,
                              textDecoration: "none"
                            }}
                          >
                            <OpenInNewIcon fontSize="inherit" />
                            <span>View / PDF</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                    {receipts.length === 0 && (
                      <tr>
                        <td colSpan={10} style={{ textAlign: "center", padding: "3rem" }}>
                          No official payment receipts generated yet. Receipts issued by salon administration will appear here for download.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PROFILE SETTINGS */}
          {activeTab === "profile" && (
            <div className={styles.sectionCard}>
              <div className={styles.sectionHeader}>
                <h3 className={styles.sectionTitle}>Account Profile &amp; Security</h3>
              </div>

              {profileMsg && <div className={styles.statusBadgeSuccess} style={{ margin: "1rem 1.75rem 0", display: "inline-flex" }}>{profileMsg}</div>}
              {profileError && <div style={{ color: "var(--color-error)", margin: "1rem 1.75rem 0" }}>{profileError}</div>}

              <form onSubmit={handleUpdateProfile}>
                <div className={styles.formGrid}>
                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Full Name</label>
                    <input
                      type="text"
                      className={styles.formInput}
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      required
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Registered Email Address</label>
                    <input
                      type="email"
                      className={styles.formInput}
                      value={currentUser?.email || ""}
                      disabled
                      style={{ background: "#eee", cursor: "not-allowed" }}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Mobile Number (Optional)</label>
                    <input
                      type="tel"
                      className={styles.formInput}
                      placeholder="e.g. 9876543210"
                      value={editMobile}
                      onChange={(e) => setEditMobile(e.target.value)}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>Current Password (To Change)</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      placeholder="Enter current password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                    />
                  </div>

                  <div className={styles.formField}>
                    <label className={styles.formLabel}>New Password</label>
                    <input
                      type="password"
                      className={styles.formInput}
                      placeholder="Minimum 6 characters"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                  </div>
                </div>

                <div style={{ padding: "0 1.75rem 1.75rem" }}>
                  <button type="submit" disabled={isSavingProfile} className={styles.goldSaveBtn}>
                    {isSavingProfile ? "Saving changes..." : "Save Profile Details"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
