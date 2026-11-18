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
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import GroupIcon from "@mui/icons-material/Group";
import SettingsIcon from "@mui/icons-material/Settings";
import PercentIcon from "@mui/icons-material/Percent";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import { DitviInstagramManager } from "@/components/admin/DitviInstagramManager";
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
  total_amount?: number;
  discount_amount?: number;
  points_redeemed?: number;
  payable_amount?: number;
  status: string;
  payment_status?: string;
  payment_method?: string;
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

interface SavedReceiptRecord {
  id: string;
  receipt_number: string;
  booking_reference?: string;
  customer_name: string;
  customer_phone?: string;
  customer_email: string;
  service_name: string;
  category_title?: string;
  appointment_date?: string;
  time_slot?: string;
  base_amount: number;
  discount_percentage?: number;
  discount_amount?: number;
  points_used?: number;
  final_payable: number;
  payment_status: string;
  payment_method: string;
  sent_via_email?: boolean;
  created_at: string;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "receipts" | "inquiries" | "analytics" | "loyalty" | "instagram">("overview");

  // Loyalty Management State
  const [loyaltySettings, setLoyaltySettings] = useState<any>({
    isEnabled: true,
    spendingAmount: 100,
    pointsPerUnit: 10,
    pointValue: 1,
    minimumRedemption: 50,
    maximumRedemptionPercentage: 30,
    expirationDays: 90,
  });
  const [loyaltyAnalytics, setLoyaltyAnalytics] = useState<any>(null);
  const [loyaltyCustomers, setLoyaltyCustomers] = useState<any[]>([]);
  const [loyaltyCustomerSearch, setLoyaltyCustomerSearch] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);
  const [settingsSaveMsg, setSettingsSaveMsg] = useState("");

  // Adjustment Modal State
  const [adjustTargetCustomer, setAdjustTargetCustomer] = useState<any | null>(null);
  const [adjustPoints, setAdjustPoints] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState("");
  const [isAdjusting, setIsAdjusting] = useState(false);

  const fetchLoyaltyData = useCallback(async () => {
    try {
      const [settingsRes, customersRes] = await Promise.all([
        fetch("/api/admin/loyalty/settings"),
        fetch(`/api/admin/loyalty/customers?search=${encodeURIComponent(loyaltyCustomerSearch)}`)
      ]);
      const sData = await settingsRes.json();
      const cData = await customersRes.json();
      if (sData.success) {
        setLoyaltySettings(sData.settings);
        setLoyaltyAnalytics(sData.analytics);
      }
      if (cData.success) {
        setLoyaltyCustomers(cData.customers);
      }
    } catch (err) {
      console.error("Failed to fetch loyalty admin data:", err);
    }
  }, [loyaltyCustomerSearch]);

  useEffect(() => {
    if (activeTab === "loyalty") {
      fetchLoyaltyData();
    }
  }, [activeTab, fetchLoyaltyData]);

  const handleSaveLoyaltySettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    setSettingsSaveMsg("");
    try {
      const res = await fetch("/api/admin/loyalty/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(loyaltySettings),
      });
      const data = await res.json();
      if (data.success) {
        setSettingsSaveMsg("Loyalty settings saved successfully!");
      }
    } catch {
      setSettingsSaveMsg("Failed to save settings.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAdjustPointsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTargetCustomer || !adjustReason) return;
    setIsAdjusting(true);
    try {
      const res = await fetch("/api/admin/loyalty/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: adjustTargetCustomer.id,
          points: adjustPoints,
          reason: adjustReason,
        }),
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message);
        setAdjustTargetCustomer(null);
        setAdjustReason("");
        fetchLoyaltyData();
      } else {
        alert(data.message || "Adjustment failed");
      }
    } catch {
      alert("Error submitting adjustment");
    } finally {
      setIsAdjusting(false);
    }
  };
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [inquiries, setInquiries] = useState<InquiryRecord[]>([]);
  const [events, setEvents] = useState<InteractionEvent[]>([]);
  const [popularServices, setPopularServices] = useState<PopularService[]>([]);
  const [savedReceipts, setSavedReceipts] = useState<SavedReceiptRecord[]>([]);
  const [receiptSearchTerm, setReceiptSearchTerm] = useState("");

  // Search & filter states for bookings
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Discount Modal State
  const [discountModalBooking, setDiscountModalBooking] = useState<BookingRecord | null>(null);
  const [modalDiscountPct, setModalDiscountPct] = useState<number>(0);
  const [modalDiscountFlat, setModalDiscountFlat] = useState<number>(0);
  const [isSavingDiscount, setIsSavingDiscount] = useState<boolean>(false);

  // Receipt Generator Form State
  const [receiptForm, setReceiptForm] = useState<{
    bookingRef: string;
    customerName: string;
    customerPhone: string;
    customerEmail: string;
    serviceName: string;
    categoryTitle: string;
    appointmentDate: string;
    timeSlot: string;
    priceDisplay: string;
    baseAmount?: number;
    pointsUsed?: number;
    discountPercentage?: number;
    discountAmount?: number;
    finalPayable?: number;
    paymentStatus?: string;
    paymentMethod?: string;
    specialInstructions: string;
  }>({
    bookingRef: "",
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    serviceName: "Bridal Signature HD Makeup",
    categoryTitle: "Luxury Bridal Services",
    appointmentDate: "",
    timeSlot: "11:00 AM",
    priceDisplay: "₹15,000",
    baseAmount: 15000,
    pointsUsed: 0,
    discountPercentage: 0,
    discountAmount: 0,
    finalPayable: 15000,
    specialInstructions: "VIP Bridal Session at Scheme 94 Studio",
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

      // 5. Fetch Generated Receipts
      const recRes = await fetch("/api/admin/receipt");
      const recData = await recRes.json();
      if (recData.success) {
        setSavedReceipts(recData.receipts || []);
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

  const [paymentUpdateMsg, setPaymentUpdateMsg] = useState<{ id: string; text: string } | null>(null);

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

  const handlePaymentChange = async (bookingId: string, newPaymentStatus: string, newPaymentMethod?: string) => {
    try {
      const payload: any = { id: bookingId, payment_status: newPaymentStatus };
      if (newPaymentMethod) {
        payload.payment_method = newPaymentMethod;
      }
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? {
            ...b,
            payment_status: data.booking.payment_status,
            payment_method: data.booking.payment_method || b.payment_method,
            status: data.booking.status || b.status
          } : b))
        );
        if (data.pointsAwarded && data.pointsAwarded > 0) {
          setPaymentUpdateMsg({
            id: bookingId,
            text: `Payment confirmed! Awarded ${data.pointsAwarded} loyalty points to client wallet.`
          });
          setTimeout(() => setPaymentUpdateMsg(null), 6000);
        }
      }
    } catch (err) {
      console.error("Failed to update payment status:", err);
    }
  };

  // Handle quick discount update from bookings directory
  const handleDiscountChange = async (bookingId: string, discountVal: number) => {
    try {
      const res = await fetch("/api/admin/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: bookingId, discount_amount: discountVal }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.booking) {
        setBookings((prev) =>
          prev.map((b) =>
            b.id === bookingId
              ? {
                  ...b,
                  discount_amount: data.booking.discount_amount,
                  payable_amount: data.booking.payable_amount,
                }
              : b
          )
        );
        setPaymentUpdateMsg({
          id: bookingId,
          text: `Discount updated to ₹${discountVal}. Final payable amount is now ₹${data.booking.payable_amount}.`,
        });
        setTimeout(() => setPaymentUpdateMsg(null), 5000);
      }
    } catch (err) {
      console.error("Failed to update discount:", err);
    }
  };

  // Open Discount Popup Modal for a booking
  const handleOpenDiscountModal = (b: BookingRecord) => {
    const base = Number(b.total_amount || b.price_inr || 0);
    const disc = Number(b.discount_amount || 0);
    const pct = base > 0 ? Math.round((disc / base) * 100) : 0;
    setDiscountModalBooking(b);
    setModalDiscountPct(pct);
    setModalDiscountFlat(disc);
  };

  const handleApplyDiscountModal = async () => {
    if (!discountModalBooking) return;
    setIsSavingDiscount(true);
    try {
      await handleDiscountChange(discountModalBooking.id, modalDiscountFlat);
      setDiscountModalBooking(null);
    } finally {
      setIsSavingDiscount(false);
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
    const base = Number(b.total_amount || b.price_inr || 0);
    const disc = Number(b.discount_amount || 0);
    const pct = base > 0 ? Math.round((disc / base) * 100) : 0;
    const payable = b.payable_amount !== undefined && b.payable_amount !== null
      ? Number(b.payable_amount)
      : Math.max(0, base - disc);

    setReceiptForm({
      bookingRef: b.booking_reference,
      customerName: b.customer_name,
      customerPhone: b.customer_phone,
      customerEmail: b.customer_email || "",
      serviceName: b.service_name,
      categoryTitle: "Salon Atelier Service",
      appointmentDate: String(b.appointment_date).split("T")[0],
      timeSlot: b.time_slot,
      priceDisplay: base > 0 ? `₹${base.toLocaleString("en-IN")}` : "Consultation",
      baseAmount: base,
      pointsUsed: b.points_redeemed || 0,
      discountPercentage: pct,
      discountAmount: disc,
      finalPayable: payable,
      paymentStatus: b.payment_status || "pending",
      paymentMethod: b.payment_method || "pay_at_salon",
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
        text: `Payment Receipt (${data.receiptNumber || "Generated"}) successfully created, saved to database, and dispatched to ${receiptForm.customerEmail}!`,
      });
      // Refresh receipts list
      const recRes = await fetch("/api/admin/receipt");
      const recData = await recRes.json();
      if (recData.success) {
        setSavedReceipts(recData.receipts || []);
      }
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
        <div className={`${styles.sidebarHeader} ${!sidebarOpen ? styles.sidebarHeaderCollapsed : ""}`}>
          {sidebarOpen ? (
            <>
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

              {/* Cross Button to close/collapse sidebar */}
              <button
                type="button"
                onClick={() => setSidebarOpen(false)}
                aria-label="Collapse Sidebar"
                title="Collapse Sidebar"
                className={styles.closeSidebarBtn}
              >
                <CloseIcon fontSize="small" />
              </button>
            </>
          ) : (
            <>
              <div className={styles.sidebarLogoWrapper} title={salonConfig.name}>
                <Image
                  src="/images/logo.png"
                  alt={salonConfig.name}
                  width={42}
                  height={42}
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
            onClick={() => setActiveTab("bookings")}
            title="Appointments Directory"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "bookings" ? styles.navItemActive : ""}`}
          >
            <EventAvailableOutlinedIcon fontSize="small" />
            {sidebarOpen && <span>Appointments Directory</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("receipts")}
            title="Receipt Generator & Email"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "receipts" ? styles.navItemActive : ""}`}
          >
            <ReceiptLongIcon fontSize="small" />
            {sidebarOpen && <span>Receipt Generator &amp; Email</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("inquiries")}
            title="Customer Inquiries"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "inquiries" ? styles.navItemActive : ""}`}
          >
            <EmailIcon fontSize="small" />
            {sidebarOpen && <span>Customer Inquiries</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("analytics")}
            title="Visitor Clicks & Events"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "analytics" ? styles.navItemActive : ""}`}
          >
            <TrendingUpIcon fontSize="small" />
            {sidebarOpen && <span>Visitor Clicks &amp; Events</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("loyalty")}
            title="Loyalty & Rewards"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "loyalty" ? styles.navItemActive : ""}`}
          >
            <LoyaltyIcon fontSize="small" />
            {sidebarOpen && <span>Loyalty &amp; Rewards</span>}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("instagram")}
            title="Ditvi Instagram Gallery"
            className={`${styles.navItem} ${!sidebarOpen ? styles.navItemCollapsed : ""} ${activeTab === "instagram" ? styles.navItemActive : ""}`}
          >
            <CameraAltIcon fontSize="small" />
            {sidebarOpen && <span>Instagram Gallery</span>}
          </button>
        </nav>

        <div className={`${styles.sidebarFooter} ${!sidebarOpen ? styles.sidebarFooterCollapsed : ""}`}>
          {sidebarOpen ? (
            <div className={styles.adminUserBadge}>
              <div className={styles.adminAvatar}>A</div>
              <div className={styles.adminUserInfo}>
                <span className={styles.adminUserName}>Master Admin</span>
                <span className={styles.adminUserRole}>Superuser</span>
              </div>
            </div>
          ) : (
            <div className={styles.adminAvatar} title="Master Admin (Superuser)">
              A
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

      {/* 100% Width Main Content Area */}
      <main className={`${styles.mainContent} ${!sidebarOpen ? styles.mainContentFull : ""}`}>
        {/* Top Header Bar */}
        <header className={styles.topBar}>
          <div className={styles.topBarLeft}>
            <h1 className={styles.topBarTitle}>
              {activeTab === "overview" && "Executive Salon Overview & Graphs"}
              {activeTab === "bookings" && "Client Appointments Directory"}
              {activeTab === "receipts" && "Slip & Receipt Generator (Email PDF)"}
              {activeTab === "inquiries" && "Customer Concierge Inquiries"}
              {activeTab === "analytics" && "Interaction & Conversion Analytics"}
              {activeTab === "loyalty" && "Loyalty & Rewards Program Management"}
              {activeTab === "instagram" && "Ditvi Instagram Hashtag Gallery & Moderation"}
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

              {paymentUpdateMsg && (
                <div style={{
                  margin: "1rem 1.5rem",
                  padding: "0.75rem 1.25rem",
                  background: "rgba(46, 125, 50, 0.12)",
                  border: "1px solid #2e7d32",
                  borderRadius: "8px",
                  color: "#1b5e20",
                  fontWeight: 600,
                  fontSize: "0.875rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem"
                }}>
                  <CheckCircleIcon fontSize="small" />
                  <span>{paymentUpdateMsg.text}</span>
                </div>
              )}

              <div className={styles.tableWrapper}>
                <table className={styles.dataTable}>
                  <thead>
                    <tr>
                      <th>Reference #</th>
                      <th>Client Name</th>
                      <th>Contact Phone</th>
                      <th>Reserved Service</th>
                      <th>Date &amp; Slot</th>
                      <th>Total Fees</th>
                      <th>Discount (% / ₹)</th>
                      <th>Final Payable</th>
                      <th>Booking Status</th>
                      <th>Payment Status</th>
                      <th>Payment Method (Cash / QR / Razorpay)</th>
                      <th>Send Receipt</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b) => {
                      const totalBase = Number(b.total_amount || b.price_inr || 0);
                      const currentDisc = Number(b.discount_amount || 0);
                      const currentPct = totalBase > 0 ? Math.round((currentDisc / totalBase) * 100) : 0;

                      return (
                      <tr key={b.id}>
                        <td>
                          <span className={styles.refTag}>{b.booking_reference}</span>
                        </td>
                        <td>
                          <strong>{b.customer_name}</strong>
                          {b.customer_email && (
                            <div style={{ fontSize: "0.75rem", color: "var(--color-text-muted)" }}>
                              {b.customer_email}
                            </div>
                          )}
                        </td>
                        <td>{b.customer_phone}</td>
                        <td>{b.service_name}</td>
                        <td>
                          {b.appointment_date} <br />
                          <small style={{ color: "var(--color-text-muted)" }}>{b.time_slot}</small>
                        </td>
                        <td>
                          <strong>₹{totalBase.toLocaleString("en-IN")}</strong>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            <button
                              type="button"
                              onClick={() => handleOpenDiscountModal(b)}
                              className={styles.discountBtn}
                              title="Click to apply or change discount"
                            >
                              <PercentIcon fontSize="inherit" />
                              <span>{currentDisc > 0 ? `${currentPct}% Off` : "Discount"}</span>
                            </button>
                            <span style={{ fontSize: "0.72rem", color: currentDisc > 0 ? "#2e7d32" : "var(--color-text-muted)", fontWeight: 600 }}>
                              {currentDisc > 0 ? `-₹${currentDisc.toLocaleString("en-IN")}` : "₹0 discount"}
                              {b.points_redeemed ? ` (${b.points_redeemed} Pts)` : ""}
                            </span>
                          </div>
                        </td>
                        <td>
                          <strong style={{ color: "var(--color-secondary-hover)" }}>
                            ₹{Number(b.payable_amount !== undefined && b.payable_amount !== null ? b.payable_amount : Math.max(0, totalBase - currentDisc)).toLocaleString("en-IN")}
                          </strong>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
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
                            <select
                              value={b.status}
                              onChange={(e) => handleStatusChange(b.id, e.target.value)}
                              className={styles.statusActionSelect}
                              style={{ fontSize: "0.75rem" }}
                            >
                              <option value="confirmed">Confirmed</option>
                              <option value="completed">Completed</option>
                              <option value="pending">Pending</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            <span
                              style={{
                                display: "inline-block",
                                padding: "0.25rem 0.5rem",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                fontWeight: 700,
                                textAlign: "center",
                                textTransform: "capitalize",
                                background: b.payment_status === "paid" ? "rgba(46, 125, 50, 0.15)" : "rgba(224, 86, 36, 0.12)",
                                color: b.payment_status === "paid" ? "#2e7d32" : "#c64516",
                                border: b.payment_status === "paid" ? "1px solid rgba(46, 125, 50, 0.3)" : "1px solid rgba(224, 86, 36, 0.25)"
                              }}
                            >
                              {b.payment_status || "Pending"}
                            </span>
                            <select
                              value={b.payment_status || "pending"}
                              onChange={(e) => handlePaymentChange(b.id, e.target.value)}
                              className={styles.statusActionSelect}
                              style={{ fontSize: "0.75rem", fontWeight: 600 }}
                            >
                              <option value="pending">Mark Pending</option>
                              <option value="paid">Mark Paid (Award Points)</option>
                            </select>
                          </div>
                        </td>
                        <td>
                          <div style={{ display: "flex", flexDirection: "column", gap: "0.35rem" }}>
                            <select
                              value={b.payment_method || "pay_at_salon"}
                              onChange={(e) => handlePaymentChange(b.id, b.payment_status || "paid", e.target.value)}
                              className={styles.statusActionSelect}
                              style={{ fontSize: "0.75rem", fontWeight: 600 }}
                            >
                              <option value="pay_at_salon">Pay at Salon</option>
                              <option value="cash">Cash (In-Person)</option>
                              <option value="qr_upi">QR Code / UPI</option>
                              <option value="card_pos">Card POS Swipe</option>
                              <option value="razorpay">Razorpay Online</option>
                            </select>
                            {b.payment_method && (
                              <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "capitalize" }}>
                                Mode: {b.payment_method.replace(/_/g, " ")}
                              </span>
                            )}
                          </div>
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
                    );
                    })}
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
                    <label className={styles.receiptLabel}>Service Base Price (INR) *</label>
                    <input
                      type="number"
                      required
                      value={receiptForm.baseAmount ?? 0}
                      onChange={(e) => {
                        const base = Number(e.target.value);
                        const disc = Number(receiptForm.discountAmount || 0);
                        setReceiptForm({
                          ...receiptForm,
                          baseAmount: base,
                          priceDisplay: `₹${base.toLocaleString("en-IN")}`,
                          finalPayable: Math.max(0, base - disc),
                        });
                      }}
                      placeholder="2500"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Special Discount (% Percentage)</label>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={receiptForm.discountPercentage ?? 0}
                        onChange={(e) => {
                          const pct = Math.min(100, Math.max(0, Number(e.target.value)));
                          const base = Number(receiptForm.baseAmount || 0);
                          const computedDisc = Math.round((base * pct) / 100);
                          setReceiptForm({
                            ...receiptForm,
                            discountPercentage: pct,
                            discountAmount: computedDisc,
                            finalPayable: Math.max(0, base - computedDisc),
                          });
                        }}
                        placeholder="e.g. 15 for 15%"
                        className={styles.receiptInput}
                      />
                      <span style={{ fontSize: "1rem", fontWeight: 700, color: "var(--color-secondary)" }}>%</span>
                    </div>
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Discount Amount (Calculated ₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={receiptForm.discountAmount ?? 0}
                      onChange={(e) => {
                        const disc = Number(e.target.value);
                        const base = Number(receiptForm.baseAmount || 0);
                        const pct = base > 0 ? Math.round((disc / base) * 100) : 0;
                        setReceiptForm({
                          ...receiptForm,
                          discountPercentage: pct,
                          discountAmount: disc,
                          finalPayable: Math.max(0, base - disc),
                        });
                      }}
                      placeholder="e.g. 500"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Final Payable Amount (INR) *</label>
                    <input
                      type="number"
                      required
                      value={receiptForm.finalPayable ?? 0}
                      onChange={(e) => setReceiptForm({ ...receiptForm, finalPayable: Number(e.target.value) })}
                      placeholder="2000"
                      className={styles.receiptInput}
                    />
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Payment Status</label>
                    <select
                      value={receiptForm.paymentStatus || "pending"}
                      onChange={(e) => setReceiptForm({ ...receiptForm, paymentStatus: e.target.value })}
                      className={styles.receiptInput}
                    >
                      <option value="pending">Pending (Pay at Salon)</option>
                      <option value="paid">Payment Confirmed / Paid</option>
                    </select>
                  </div>

                  <div className={styles.receiptFieldGroup}>
                    <label className={styles.receiptLabel}>Payment Method</label>
                    <select
                      value={receiptForm.paymentMethod || "pay_at_salon"}
                      onChange={(e) => setReceiptForm({ ...receiptForm, paymentMethod: e.target.value })}
                      className={styles.receiptInput}
                    >
                      <option value="pay_at_salon">Pay at Salon (Venue)</option>
                      <option value="cash">Cash (In-Person)</option>
                      <option value="qr_upi">QR Code / UPI</option>
                      <option value="card_pos">Card POS Swipe</option>
                      <option value="razorpay">Razorpay Online</option>
                    </select>
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
                    <span>{isSendingReceipt ? "Generating, Saving & Emailing..." : "Generate Payment Receipt (Save & Email)"}</span>
                  </button>
                </div>
              </form>

              {/* GENERATED RECEIPTS DIRECTORY SECTION */}
              <div style={{ marginTop: "3rem", borderTop: "2px solid var(--color-border)", paddingTop: "2rem" }}>
                <div className={styles.sectionHeader} style={{ padding: "0 0 1rem 0" }}>
                  <div>
                    <h3 className={styles.sectionTitle} style={{ fontSize: "1.15rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <ReceiptLongIcon fontSize="small" style={{ color: "var(--color-secondary)" }} />
                      <span>Generated Payment Receipts Archive ({savedReceipts.length})</span>
                    </h3>
                    <p style={{ margin: "0.25rem 0 0 0", fontSize: "0.8rem", color: "var(--color-text-muted)" }}>
                      Every receipt generated is persisted in the database with its unique invoice number and official PDF.
                    </p>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Search receipts..."
                      value={receiptSearchTerm}
                      onChange={(e) => setReceiptSearchTerm(e.target.value)}
                      className={styles.searchInput}
                      style={{ padding: "0.45rem 0.85rem", fontSize: "0.825rem" }}
                    />
                  </div>
                </div>

                <div className={styles.tableWrapper}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Receipt #</th>
                        <th>Created Date</th>
                        <th>Client</th>
                        <th>Service Details</th>
                        <th>Schedule</th>
                        <th>Base Price</th>
                        <th>Discount</th>
                        <th>Final Payable</th>
                        <th>Mode &amp; Status</th>
                        <th>PDF Document</th>
                      </tr>
                    </thead>
                    <tbody>
                      {savedReceipts
                        .filter((r) => {
                          if (!receiptSearchTerm) return true;
                          const term = receiptSearchTerm.toLowerCase();
                          return (
                            r.receipt_number.toLowerCase().includes(term) ||
                            r.customer_name.toLowerCase().includes(term) ||
                            r.customer_email.toLowerCase().includes(term) ||
                            r.service_name.toLowerCase().includes(term) ||
                            (r.booking_reference && r.booking_reference.toLowerCase().includes(term))
                          );
                        })
                        .map((r) => (
                          <tr key={r.id}>
                            <td>
                              <strong style={{ color: "var(--color-secondary-hover)" }}>{r.receipt_number}</strong>
                              {r.booking_reference && (
                                <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                                  Ref: {r.booking_reference}
                                </div>
                              )}
                            </td>
                            <td style={{ whiteSpace: "nowrap", fontSize: "0.8rem" }}>
                              {new Date(r.created_at).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </td>
                            <td>
                              <strong>{r.customer_name}</strong>
                              <div style={{ fontSize: "0.72rem", color: "var(--color-text-muted)" }}>
                                {r.customer_email}
                              </div>
                            </td>
                            <td>{r.service_name}</td>
                            <td style={{ fontSize: "0.8rem" }}>
                              {r.appointment_date ? String(r.appointment_date).split("T")[0] : "—"} {r.time_slot}
                            </td>
                            <td>₹{Number(r.base_amount || 0).toLocaleString("en-IN")}</td>
                            <td style={{ color: "var(--color-success)" }}>
                              {r.discount_amount && Number(r.discount_amount) > 0
                                ? `-₹${Number(r.discount_amount).toLocaleString("en-IN")}`
                                : "—"}
                            </td>
                            <td>
                              <strong style={{ color: "var(--color-secondary-hover)", fontSize: "0.95rem" }}>
                                ₹{Number(r.final_payable).toLocaleString("en-IN")}
                              </strong>
                            </td>
                            <td>
                              <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                                <span className={styles.statusBadge} style={{ background: "rgba(46, 125, 50, 0.12)", color: "#1b5e20", fontSize: "0.72rem", textTransform: "capitalize" }}>
                                  {r.payment_status}
                                </span>
                                <span style={{ fontSize: "0.7rem", color: "var(--color-text-muted)", textTransform: "capitalize" }}>
                                  {r.payment_method?.replace(/_/g, " ")}
                                </span>
                              </div>
                            </td>
                            <td>
                              <a
                                href={`/api/receipts/${r.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.actionBtnSmall}
                                style={{ display: "inline-flex", textDecoration: "none" }}
                              >
                                <OpenInNewIcon fontSize="inherit" />
                                <span>PDF Slip</span>
                              </a>
                            </td>
                          </tr>
                        ))}
                      {savedReceipts.length === 0 && (
                        <tr>
                          <td colSpan={10} className={styles.emptyNotice}>
                            No payment receipts generated yet. Use the form above to generate and store your first receipt.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
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

          {/* ======================================================== */}
          {/* TAB 6: LOYALTY & REWARDS MANAGEMENT                        */}
          {/* ======================================================== */}
          {activeTab === "loyalty" && (
            <div className={styles.tabContent}>
              {/* Analytics Summary */}
              <div className={styles.statsGrid}>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Total Points Issued</div>
                  <div className={styles.statValue} style={{ color: "#c5a059" }}>
                    {loyaltyAnalytics?.totalIssued ?? 0}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Total Points Redeemed</div>
                  <div className={styles.statValue} style={{ color: "#2e6b46" }}>
                    {loyaltyAnalytics?.totalRedeemed ?? 0}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Total Points Expired</div>
                  <div className={styles.statValue} style={{ color: "#a82b2b" }}>
                    {loyaltyAnalytics?.totalExpired ?? 0}
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Outstanding Liability</div>
                  <div className={styles.statValue}>
                    {loyaltyAnalytics?.outstandingPoints ?? 0} pts
                  </div>
                </div>
                <div className={styles.statCard}>
                  <div className={styles.statLabel}>Customers Enrolled</div>
                  <div className={styles.statValue}>
                    {loyaltyAnalytics?.enrolledCustomers ?? 0}
                  </div>
                </div>
              </div>

              {/* General Configuration Section */}
              <div className={styles.sectionCard} style={{ marginTop: "2rem" }}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Loyalty Program Rules &amp; Global Configuration</h3>
                  {settingsSaveMsg && <span style={{ color: "#2e6b46", fontWeight: 600 }}>{settingsSaveMsg}</span>}
                </div>

                <form onSubmit={handleSaveLoyaltySettings} style={{ padding: "1.5rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Program Status
                      </label>
                      <select
                        value={loyaltySettings.isEnabled ? "true" : "false"}
                        onChange={(e) => setLoyaltySettings({ ...loyaltySettings, isEnabled: e.target.value === "true" })}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
                      >
                        <option value="true">Enabled (Active)</option>
                        <option value="false">Disabled (Suspended)</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Spend Unit Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={loyaltySettings.spendingAmount}
                        onChange={(e) => setLoyaltySettings({ ...loyaltySettings, spendingAmount: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Points Earned Per Unit
                      </label>
                      <input
                        type="number"
                        value={loyaltySettings.pointsPerUnit}
                        onChange={(e) => setLoyaltySettings({ ...loyaltySettings, pointsPerUnit: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Point Conversion Value (1 pt = ₹)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={loyaltySettings.pointValue}
                        onChange={(e) => setLoyaltySettings({ ...loyaltySettings, pointValue: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Min Points for Redemption
                      </label>
                      <input
                        type="number"
                        value={loyaltySettings.minimumRedemption}
                        onChange={(e) => setLoyaltySettings({ ...loyaltySettings, minimumRedemption: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Max Redemption % Per Appointment
                      </label>
                      <input
                        type="number"
                        value={loyaltySettings.maximumRedemptionPercentage}
                        onChange={(e) => setLoyaltySettings({ ...loyaltySettings, maximumRedemptionPercentage: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.5rem" }}>
                        Point Expiration (Days)
                      </label>
                      <input
                        type="number"
                        value={loyaltySettings.expirationDays}
                        onChange={(e) => setLoyaltySettings({ ...loyaltySettings, expirationDays: Number(e.target.value) })}
                        style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ marginTop: "1.5rem" }}>
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      style={{
                        padding: "0.75rem 1.75rem",
                        background: "#181413",
                        color: "#c5a059",
                        border: "1px solid #c5a059",
                        borderRadius: "8px",
                        fontWeight: 700,
                        cursor: "pointer"
                      }}
                    >
                      {isSavingSettings ? "Saving Settings..." : "Save Loyalty Settings"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Customer Loyalty Directory & Manual Adjustments */}
              <div className={styles.sectionCard} style={{ marginTop: "2rem" }}>
                <div className={styles.sectionHeader}>
                  <h3 className={styles.sectionTitle}>Customer Loyalty Balances &amp; Adjustments</h3>
                  <div style={{ display: "flex", gap: "0.75rem" }}>
                    <input
                      type="text"
                      placeholder="Search customer name, email, phone..."
                      value={loyaltyCustomerSearch}
                      onChange={(e) => setLoyaltyCustomerSearch(e.target.value)}
                      style={{ padding: "0.5rem 1rem", borderRadius: "6px", border: "1px solid #ccc" }}
                    />
                    <button
                      type="button"
                      onClick={() => fetchLoyaltyData()}
                      style={{ padding: "0.5rem 1rem", background: "#f5f0e6", border: "1px solid #ccc", borderRadius: "6px", cursor: "pointer" }}
                    >
                      Search
                    </button>
                  </div>
                </div>

                <div className={styles.tableResponsive}>
                  <table className={styles.dataTable}>
                    <thead>
                      <tr>
                        <th>Customer Name</th>
                        <th>Contact</th>
                        <th>Available Points</th>
                        <th>Total Earned</th>
                        <th>Total Redeemed</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loyaltyCustomers.map((c) => (
                        <tr key={c.id}>
                          <td><strong>{c.name}</strong></td>
                          <td>
                            <div>{c.email}</div>
                            <small style={{ color: "#666" }}>{c.mobile_number || c.phone || "—"}</small>
                          </td>
                          <td style={{ fontWeight: 800, color: "#c5a059" }}>{c.current_points} pts</td>
                          <td>{c.total_earned}</td>
                          <td>{c.total_redeemed}</td>
                          <td>
                            <button
                              type="button"
                              onClick={() => {
                                setAdjustTargetCustomer(c);
                                setAdjustPoints(50);
                                setAdjustReason("");
                              }}
                              style={{
                                padding: "0.4rem 0.8rem",
                                background: "#181413",
                                color: "#f7f1e5",
                                border: "none",
                                borderRadius: "4px",
                                cursor: "pointer",
                                fontSize: "0.8rem"
                              }}
                            >
                              Adjust Points
                            </button>
                          </td>
                        </tr>
                      ))}
                      {loyaltyCustomers.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: "center", padding: "2rem" }}>
                            No customers found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Modal for Manual Point Adjustment */}
              {adjustTargetCustomer && (
                <div style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 9999
                }}>
                  <div style={{
                    background: "#fff",
                    borderRadius: "12px",
                    padding: "2rem",
                    width: "100%",
                    maxWidth: "460px"
                  }}>
                    <h3 style={{ marginBottom: "0.5rem" }}>Manual Points Adjustment</h3>
                    <p style={{ fontSize: "0.9rem", color: "#666", marginBottom: "1.5rem" }}>
                      Customer: <strong>{adjustTargetCustomer.name}</strong> (Current Balance: {adjustTargetCustomer.current_points} pts)
                    </p>

                    <form onSubmit={handleAdjustPointsSubmit}>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                          Points Adjustment (Positive to Add, Negative to Deduct)
                        </label>
                        <input
                          type="number"
                          value={adjustPoints}
                          onChange={(e) => setAdjustPoints(Number(e.target.value))}
                          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
                          required
                        />
                      </div>

                      <div style={{ marginBottom: "1.5rem" }}>
                        <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: "0.4rem" }}>
                          Audit Adjustment Reason *
                        </label>
                        <textarea
                          rows={2}
                          placeholder="e.g. Complimentary festive bonus, VIP client privilege, refund deduction..."
                          value={adjustReason}
                          onChange={(e) => setAdjustReason(e.target.value)}
                          style={{ width: "100%", padding: "0.75rem", borderRadius: "8px", border: "1px solid #ccc" }}
                          required
                        />
                      </div>

                      <div style={{ display: "flex", justifyContent: "flex-end", gap: "0.75rem" }}>
                        <button
                          type="button"
                          onClick={() => setAdjustTargetCustomer(null)}
                          style={{ padding: "0.6rem 1.25rem", borderRadius: "6px", border: "1px solid #ccc", background: "transparent", cursor: "pointer" }}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={isAdjusting}
                          style={{
                            padding: "0.6rem 1.25rem",
                            borderRadius: "6px",
                            border: "none",
                            background: "#181413",
                            color: "#c5a059",
                            fontWeight: 700,
                            cursor: "pointer"
                          }}
                        >
                          {isAdjusting ? "Submitting..." : "Confirm Adjustment"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 7: DITVI INSTAGRAM GALLERY & HASHTAG MANAGEMENT       */}
          {/* ======================================================== */}
          {activeTab === "instagram" && (
            <div className={styles.tabContent}>
              <DitviInstagramManager />
            </div>
          )}
        </div>
      </main>

      {/* ================= DISCOUNT POPUP MODAL ================= */}
      {discountModalBooking && (
        <div
          className={styles.discountModalOverlay}
          onClick={() => setDiscountModalBooking(null)}
        >
          <div
            className={styles.discountModalContent}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.discountModalHeader}>
              <div>
                <h3 className={styles.discountModalTitle}>Apply Special Discount</h3>
                <p className={styles.discountModalSubtitle}>
                  Booking Ref: <strong>{discountModalBooking.booking_reference}</strong> &bull; Client: {discountModalBooking.customer_name}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDiscountModalBooking(null)}
                className={styles.closeModalBtn}
                aria-label="Close Modal"
              >
                <CloseIcon fontSize="small" />
              </button>
            </div>

            <div className={styles.discountModalBody}>
              {/* Service & Base Price Summary */}
              <div className={styles.discountSummaryBox}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Reserved Service:</span>
                  <span className={styles.summaryVal}>{discountModalBooking.service_name}</span>
                </div>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Service Base Price:</span>
                  <span className={styles.summaryValGold}>
                    ₹{Number(discountModalBooking.total_amount || discountModalBooking.price_inr || 0).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>

              {/* Quick Percentage Presets */}
              <div style={{ marginBottom: "1.25rem" }}>
                <label className={styles.inputGroupLabel}>Quick Discount Presets (%):</label>
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginTop: "0.4rem" }}>
                  {[5, 10, 15, 20, 25, 30, 50].map((presetPct) => (
                    <button
                      key={presetPct}
                      type="button"
                      onClick={() => {
                        const base = Number(discountModalBooking.total_amount || discountModalBooking.price_inr || 0);
                        const computed = Math.round((base * presetPct) / 100);
                        setModalDiscountPct(presetPct);
                        setModalDiscountFlat(computed);
                      }}
                      className={`${styles.presetBtn} ${modalDiscountPct === presetPct ? styles.presetBtnActive : ""}`}
                    >
                      {presetPct}%
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => {
                      setModalDiscountPct(0);
                      setModalDiscountFlat(0);
                    }}
                    className={styles.presetBtn}
                    style={{ color: "#a82b2b" }}
                  >
                    Clear (0%)
                  </button>
                </div>
              </div>

              {/* Two-way Percentage & Flat Rupee inputs */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.25rem" }}>
                <div>
                  <label className={styles.inputGroupLabel}>Discount Percentage (%)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={modalDiscountPct}
                      onChange={(e) => {
                        const pct = Math.min(100, Math.max(0, Number(e.target.value)));
                        const base = Number(discountModalBooking.total_amount || discountModalBooking.price_inr || 0);
                        const computed = Math.round((base * pct) / 100);
                        setModalDiscountPct(pct);
                        setModalDiscountFlat(computed);
                      }}
                      className={styles.modalInput}
                    />
                    <span style={{ fontWeight: 800, color: "var(--color-secondary)" }}>%</span>
                  </div>
                </div>

                <div>
                  <label className={styles.inputGroupLabel}>Discount Amount (₹)</label>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.35rem" }}>
                    <span style={{ fontWeight: 800, color: "var(--color-secondary)" }}>₹</span>
                    <input
                      type="number"
                      min="0"
                      value={modalDiscountFlat}
                      onChange={(e) => {
                        const flat = Math.max(0, Number(e.target.value));
                        const base = Number(discountModalBooking.total_amount || discountModalBooking.price_inr || 0);
                        const pct = base > 0 ? Math.round((flat / base) * 100) : 0;
                        setModalDiscountFlat(flat);
                        setModalDiscountPct(pct);
                      }}
                      className={styles.modalInput}
                    />
                  </div>
                </div>
              </div>

              {/* Final Payable calculation */}
              <div className={styles.finalPayableBox}>
                <div>
                  <span style={{ fontSize: "0.85rem", color: "var(--color-text-muted)" }}>New Final Payable:</span>
                  <div style={{ fontSize: "1.5rem", fontWeight: 800, color: "var(--color-secondary-hover)" }}>
                    ₹{Math.max(
                      0,
                      Number(discountModalBooking.total_amount || discountModalBooking.price_inr || 0) - modalDiscountFlat
                    ).toLocaleString("en-IN")}
                  </div>
                </div>
                <div style={{ textAlign: "right", fontSize: "0.8rem", color: "#2e7d32", fontWeight: 700 }}>
                  {modalDiscountFlat > 0 ? `You Save: ₹${modalDiscountFlat.toLocaleString("en-IN")} (${modalDiscountPct}% Off)` : "Standard Rate"}
                </div>
              </div>
            </div>

            <div className={styles.discountModalFooter}>
              <button
                type="button"
                onClick={() => setDiscountModalBooking(null)}
                className={styles.cancelBtn}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyDiscountModal}
                disabled={isSavingDiscount}
                className={styles.applyBtn}
              >
                {isSavingDiscount ? "Updating Price..." : "Apply Discount & Update Price"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function brandGroupStyle() {
  return styles.brandGroup;
}
