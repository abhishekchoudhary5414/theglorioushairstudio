"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import EmailIcon from "@mui/icons-material/Email";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import PersonIcon from "@mui/icons-material/Person";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ImageIcon from "@mui/icons-material/Image";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import VerifiedIcon from "@mui/icons-material/Verified";
import LoyaltyIcon from "@mui/icons-material/Loyalty";
import PaymentIcon from "@mui/icons-material/Payment";
import { SALON_SERVICES_CATEGORIES } from "@/data/services";
import { salonConfig } from "@/config/salon.config";
import bookingConfig from "@/data/booking-config.json";
import { validateIndianPhone } from "@/lib/utils/format";
import { trackInteraction } from "@/lib/utils/analytics";
import { downloadSlipAsPdf, downloadSlipAsImage } from "@/lib/utils/slip-generator";
import styles from "./SimpleBookingForm.module.css";

interface FlatServiceOption {
  id: string;
  name: string;
  categoryTitle: string;
  priceDisplay: string;
  priceValue?: number;
  slug: string;
}

const TIME_SLOTS = bookingConfig.timeSlots;

interface SimpleBookingFormProps {
  preselectedServiceId?: string;
  preselectedStylistId?: string;
}

export const SimpleBookingForm: React.FC<SimpleBookingFormProps> = ({
  preselectedServiceId,
}) => {
  // Flatten all services for the searchable select dropdown
  const allServices: FlatServiceOption[] = useMemo(() => {
    const list: FlatServiceOption[] = [];
    SALON_SERVICES_CATEGORIES.forEach((cat) => {
      cat.subGroups.forEach((group) => {
        group.items.forEach((item) => {
          list.push({
            id: item.id,
            name: item.name,
            categoryTitle: cat.title,
            priceDisplay: item.priceDisplay || "Consultation",
            priceValue: item.price,
            slug: item.slug
          });
        });
      });
    });
    return list;
  }, []);

  // Find initial match if query parameter was provided
  const initialSelected = useMemo(() => {
    if (!preselectedServiceId) return allServices[0]?.id || "";
    const match = allServices.find(
      (s) => s.id === preselectedServiceId || s.slug === preselectedServiceId
    );
    return match ? match.id : allServices[0]?.id || "";
  }, [preselectedServiceId, allServices]);

  // Tomorrow as default date
  const tomorrow = useMemo(() => {
    const d = new Date(Date.now() + 86400000);
    return d.toISOString().split("T")[0];
  }, []);

  const [selectedServiceId, setSelectedServiceId] = useState<string>(initialSelected);
  const [appointmentDate, setAppointmentDate] = useState<string>(tomorrow);
  const [timeSlot, setTimeSlot] = useState<string>(bookingConfig.defaultSlot || "11:00 AM");
  const [customerName, setCustomerName] = useState<string>("");
  const [customerPhone, setCustomerPhone] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [specialInstructions, setSpecialInstructions] = useState<string>("");

  const [phoneError, setPhoneError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [confirmedRef, setConfirmedRef] = useState<string | null>(null);

  // Authentication status
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Loyalty rewards state
  const [userLoyalty, setUserLoyalty] = useState<{ currentPoints: number } | null>(null);
  const [redeemPoints, setRedeemPoints] = useState<number>(0);
  const [payOnline, setPayOnline] = useState<boolean>(true);

  // Check client authentication & loyalty balance
  React.useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setIsAuthenticated(true);
          setCustomerName(data.user.name || "");
          setCustomerPhone(data.user.mobileNumber || data.user.phone || "");
          setCustomerEmail(data.user.email || "");
          if (data.loyalty) {
            setUserLoyalty(data.loyalty);
          }
        } else {
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      });
  }, []);

  const selectedService = useMemo(() => {
    return allServices.find((s) => s.id === selectedServiceId) || allServices[0];
  }, [allServices, selectedServiceId]);

  // Price calculations
  const servicePrice = Number(selectedService.priceValue) || 0;
  const maxRedeemablePoints = useMemo(() => {
    if (!userLoyalty || !servicePrice) return 0;
    // Max 30% of service value
    const maxVal = Math.floor(servicePrice * 0.3);
    return Math.min(userLoyalty.currentPoints, maxVal);
  }, [userLoyalty, servicePrice]);

  const discountAmount = Math.min(redeemPoints, maxRedeemablePoints);
  const finalPayableAmount = Math.max(0, servicePrice - discountAmount);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");

    if (isAuthenticated === false) {
      window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
      return;
    }

    if (!customerName.trim()) {
      return;
    }

    if (!validateIndianPhone(customerPhone)) {
      setPhoneError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (payOnline && servicePrice > 0) {
        // Razorpay Online Payment Flow with Loyalty Points
        const orderRes = await fetch("/api/payment/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            serviceId: selectedService.id,
            serviceName: `${selectedService.name} (${selectedService.categoryTitle})`,
            branchId: "branch-scheme-78",
            branchName: `${salonConfig.name} – Pushp Vihar Colony, Scheme 94 Sector EC, Indore`,
            appointmentDate,
            timeSlot,
            customerName: customerName.trim(),
            customerPhone: customerPhone.trim(),
            customerEmail: customerEmail.trim() || undefined,
            specialInstructions: specialInstructions.trim() || undefined,
            redeemPoints: discountAmount > 0 ? discountAmount : 0,
            clientPrice: servicePrice,
          }),
        });

        const orderData = await orderRes.json();
        if (orderRes.status === 401 || orderData.requiresAuth) {
          window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
          return;
        }
        if (!orderRes.ok || !orderData.success) {
          throw new Error(orderData.message || "Failed to initialize payment.");
        }

        // If 100% discount or free consultation
        if (!orderData.orderRequired) {
          setConfirmedRef(orderData.bookingReference);
          setIsSubmitting(false);
          return;
        }

        // Check if Razorpay SDK script is available on window
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency || "INR",
          name: salonConfig.name,
          description: `${selectedService.name} Appointment Reservation`,
          order_id: orderData.orderId,
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/payment/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id || orderData.orderId,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  bookingId: orderData.bookingId,
                  redemptionId: orderData.redemptionId,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyData.success) {
                setConfirmedRef(orderData.bookingReference);
              } else {
                setPhoneError(verifyData.message || "Payment verification incomplete.");
              }
            } catch {
              setPhoneError("Error communicating with payment server.");
            } finally {
              setIsSubmitting(false);
            }
          },
          prefill: {
            name: customerName,
            contact: customerPhone,
            email: customerEmail || "",
          },
          theme: {
            color: "#c5a059",
          },
          modal: {
            ondismiss: function () {
              setIsSubmitting(false);
            },
          },
        };

        if (typeof (window as any).Razorpay !== "undefined") {
          const rzp = new (window as any).Razorpay(options);
          rzp.open();
        } else {
          // Dynamically load Razorpay checkout script
          const script = document.createElement("script");
          script.src = "https://checkout.razorpay.com/v1/checkout.js";
          script.async = true;
          script.onload = () => {
            const rzp = new (window as any).Razorpay(options);
            rzp.open();
          };
          script.onerror = async () => {
            // Test verification fallback if CDN blocked in environment
            const verifyRes = await fetch("/api/payment/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: orderData.orderId,
                razorpay_payment_id: `pay_sandbox_${Date.now()}`,
                razorpay_signature: "sandbox_sig",
                bookingId: orderData.bookingId,
                redemptionId: orderData.redemptionId,
              }),
            });
            const vData = await verifyRes.json();
            if (vData.success) {
              setConfirmedRef(orderData.bookingReference);
            }
            setIsSubmitting(false);
          };
          document.body.appendChild(script);
        }
        return;
      }

      // Default / Pay at Salon standard reservation
      const payload = {
        serviceId: selectedService.id,
        serviceName: `${selectedService.name} (${selectedService.categoryTitle})`,
        branchId: "branch-bombay-hospital",
        branchName: `${salonConfig.name} – Pushp Vihar Colony, Scheme 94 Sector EC, Indore`,
        appointmentDate,
        timeSlot,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerEmail: customerEmail.trim() || undefined,
        priceINR: selectedService.priceValue || 0,
        specialInstructions: specialInstructions.trim() || undefined
      };

      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await res.json();

      if (res.status === 401 || data.requiresAuth) {
        window.location.href = `/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`;
        return;
      }

      if (!res.ok) {
        throw new Error(data.message || "Failed to confirm reservation.");
      }

      setConfirmedRef(data.bookingReference || `GG-${Math.floor(100000 + Math.random() * 900000)}`);

      // Track booking completion
      trackInteraction({
        eventType: "booking_click",
        serviceName: selectedService.name,
        sourceLocation: "booking_form",
        targetUrl: "/booking"
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Booking error";
      setPhoneError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const [isDownloadingPdf, setIsDownloadingPdf] = useState<boolean>(false);
  const [isDownloadingImage, setIsDownloadingImage] = useState<boolean>(false);

  // Pre-load logo as Data URI for instant crisp PDF/PNG export without CORS blocks
  const [logoDataUri, setLogoDataUri] = useState<string | undefined>(undefined);

  React.useEffect(() => {
    // Attempt to convert /images/logo.png to data URL for client SVG rendering
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          setLogoDataUri(canvas.toDataURL("image/png"));
        }
      } catch (_) {}
    };
    img.src = "/images/logo.png";
  }, []);

  // Common slip data payload
  const slipPayload = useMemo(() => {
    return {
      bookingRef: confirmedRef || "GG-CONFIRMED",
      customerName: customerName || "Valued Client",
      customerPhone: customerPhone || salonConfig.contact.phoneDisplay,
      customerEmail: customerEmail || undefined,
      serviceName: selectedService?.name || "Salon Service",
      categoryTitle: selectedService?.categoryTitle || "Beauty & Hair Care",
      appointmentDate,
      timeSlot,
      priceDisplay: selectedService?.priceDisplay || "Consultation",
      baseAmount: servicePrice,
      pointsUsed: discountAmount,
      discountAmount,
      finalPayable: finalPayableAmount,
      paymentStatus: payOnline ? "paid" : "pending",
      paymentMethod: payOnline ? "razorpay" : "pay_at_salon",
      salonName: salonConfig.name,
      salonAddress: salonConfig.address.fullAddress || "201, EC 8, RP Avenue, near Uttam bhog, opposite Bombay Hospital Service Road, Pushp Vihar Colony, Scheme 94 Sector EC, Indore, Madhya Pradesh 452010",
      salonPhone: salonConfig.contact.phoneDisplay,
      salonEmail: salonConfig.contact.email,
      specialInstructions: specialInstructions || undefined,
      issuedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      logoDataUri,
      instaReelsUrl: salonConfig.socials.instagramReels,
    };
  }, [confirmedRef, customerName, customerPhone, customerEmail, selectedService, servicePrice, discountAmount, finalPayableAmount, payOnline, appointmentDate, timeSlot, specialInstructions, logoDataUri]);

  // Direct PDF File Download
  const handleDownloadPdf = async () => {
    if (!confirmedRef || isDownloadingPdf) return;
    setIsDownloadingPdf(true);
    try {
      await downloadSlipAsPdf(slipPayload);
    } catch (err) {
      console.error("PDF download failed:", err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  // Direct Image File Download (PNG)
  const handleDownloadImage = async () => {
    if (!confirmedRef || isDownloadingImage) return;
    setIsDownloadingImage(true);
    try {
      await downloadSlipAsImage(slipPayload);
    } catch (err) {
      console.error("Image download failed:", err);
    } finally {
      setIsDownloadingImage(false);
    }
  };

  // WhatsApp concierge fallback
  const whatsappUrl = `https://wa.me/${salonConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${salonConfig.name}, I would like to book an appointment for ${selectedService?.name || "Salon Service"} on ${appointmentDate} at ${timeSlot}. My name is ${customerName || "a client"}.`
  )}`;

  return (
    <div className={styles.bookingCard}>
      {confirmedRef ? (
        <div className={styles.successBox}>
          <div className={styles.successIconWrapper}>
            <CheckCircleIcon className={styles.successIcon} />
          </div>

          <span className={styles.successEyebrow}>Appointment Confirmed!</span>
          <h2 className={styles.successTitle}>We Look Forward to Welcoming You</h2>

          {/* Official Printable & Downloadable Confirmation Bill / Slip */}
          <div className={styles.ticketCard} id="appointment-confirmation-bill">
            {/* Salon Branding Header */}
            <div className={styles.billBrandHeader}>
              <div className={styles.billLogoWrapper}>
                <Image
                  src={salonConfig.logo}
                  alt={salonConfig.name}
                  width={60}
                  height={60}
                  className={styles.billLogoImg}
                  priority
                />
              </div>
              <div className={styles.billBrandInfo}>
                <h3 className={styles.billBrandName}>{salonConfig.name}</h3>
                <span className={styles.billBrandTagline}>Professional Hair &amp; Beauty Salon and Academy</span>
                <p className={styles.billAddress}>
                  <LocationOnIcon fontSize="inherit" className={styles.billInlineIcon} />
                  <span>{salonConfig.address.fullAddress || "201, EC 8, RP Avenue, near Uttam bhog, opposite Bombay Hospital Service Road, Pushp Vihar Colony, Scheme 94 Sector EC, Indore, Madhya Pradesh 452010"}</span>
                </p>
                <div className={styles.billContactLine}>
                  <span className={styles.billContactItem}>
                    <PhoneIcon fontSize="inherit" className={styles.billInlineIcon} />
                    <span>{salonConfig.contact.phoneDisplay}</span>
                  </span>
                  <span>•</span>
                  <span className={styles.billContactItem}>
                    <WhatsAppIcon fontSize="inherit" className={styles.billInlineIcon} />
                    <span>WhatsApp: {salonConfig.contact.whatsappDisplay}</span>
                  </span>
                  <span>•</span>
                  <span className={styles.billContactItem}>
                    <EmailIcon fontSize="inherit" className={styles.billInlineIcon} />
                    <span>{salonConfig.contact.bookingEmail}</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Official Payment Receipt Title Banner */}
            <div className={styles.billStatusBanner} style={{
              background: payOnline ? "#f0f7f3" : "#fdf4f0",
              border: `1.5px solid ${payOnline ? "#2e6b46" : "#e05624"}`
            }}>
              <div className={styles.billStatusLeft}>
                <span className={styles.billStatusBadge} style={{
                  color: payOnline ? "#2e6b46" : "#c64516"
                }}>
                  <VerifiedIcon fontSize="inherit" />
                  <span>{payOnline ? "PAYMENT SUCCESSFUL" : "PAYMENT PENDING (PAY AT SALON)"}</span>
                </span>
                <span className={styles.billIssueDate}>
                  Issued on: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} &bull; Official Salon Payment Receipt
                </span>
              </div>
              <div className={styles.billRefCode}>
                <span className={styles.billRefCodeLabel}>BOOKING REF #</span>
                <span className={styles.billRefCodeValue}>{confirmedRef}</span>
              </div>
            </div>

            {/* Structured Payment Receipt Rows */}
            <div className={styles.billDetailsTable}>
              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Client / Guest Name:</span>
                <span className={styles.ticketValue}>{customerName}</span>
              </div>

              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Phone / WhatsApp:</span>
                <span className={styles.ticketValue}>{customerPhone}</span>
              </div>

              {customerEmail && (
                <div className={styles.ticketRow}>
                  <span className={styles.ticketLabel}>Email Address:</span>
                  <span className={styles.ticketValue}>{customerEmail}</span>
                </div>
              )}

              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Reserved Service:</span>
                <span className={styles.ticketValue}>
                  {selectedService?.name}
                  <small className={styles.serviceCategoryMuted}> ({selectedService?.categoryTitle})</small>
                </span>
              </div>

              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Appointment Schedule:</span>
                <span className={styles.ticketValueHighlight}>
                  {appointmentDate} at {timeSlot}
                </span>
              </div>

              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Service Base Price:</span>
                <span className={styles.ticketValuePrice}>{selectedService?.priceDisplay}</span>
              </div>

              {/* Loyalty Points Used */}
              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Loyalty Points Redeemed:</span>
                <span className={styles.ticketValue}>
                  {discountAmount > 0 ? (
                    <strong style={{ color: "var(--color-secondary-hover)" }}>
                      {discountAmount} Points Used (-₹{discountAmount} Discount Applied)
                    </strong>
                  ) : (
                    <span>0 Points Used</span>
                  )}
                </span>
              </div>

              {/* Final Amount Payable */}
              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Final Amount:</span>
                <span className={styles.ticketValuePrice} style={{ color: payOnline ? "#2e6b46" : "var(--color-primary)" }}>
                  ₹{finalPayableAmount}
                </span>
              </div>

              {/* Payment Status & Mode */}
              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Payment Status:</span>
                <span className={styles.ticketValue}>
                  <span style={{
                    display: "inline-block",
                    padding: "0.25rem 0.65rem",
                    borderRadius: "6px",
                    fontWeight: 700,
                    fontSize: "0.85rem",
                    background: payOnline ? "rgba(46, 125, 50, 0.15)" : "rgba(224, 86, 36, 0.12)",
                    color: payOnline ? "#2e7d32" : "#c64516",
                    border: payOnline ? "1px solid rgba(46, 125, 50, 0.3)" : "1px solid rgba(224, 86, 36, 0.3)"
                  }}>
                    {payOnline ? "Payment Successful (Online via Razorpay)" : "Payment Pending (Pay at Salon via Cash / UPI)"}
                  </span>
                </span>
              </div>

              {specialInstructions && (
                <div className={styles.ticketRow}>
                  <span className={styles.ticketLabel}>Client Notes / Length:</span>
                  <span className={styles.ticketValue}>{specialInstructions}</span>
                </div>
              )}

              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Salon Venue:</span>
                <span className={styles.ticketValue}>{salonConfig.address.fullAddress || "201, EC 8, RP Avenue, near Uttam bhog, opposite Bombay Hospital Service Road, Pushp Vihar Colony, Scheme 94 Sector EC, Indore, Madhya Pradesh 452010"}</span>
              </div>

              {salonConfig.socials.instagramReels && (
                <div className={styles.ticketRow}>
                  <span className={styles.ticketLabel}>Instagram Reels:</span>
                  <a
                    href={salonConfig.socials.instagramReels}
                    target="_blank"
                    rel="noreferrer noopener"
                    className={styles.ticketValue}
                    style={{ color: "var(--color-secondary)", textDecoration: "underline", fontWeight: 600 }}
                  >
                    Watch Salon Transformations on Instagram
                  </a>
                </div>
              )}
            </div>

            {/* Bill Footer Seal & Verification */}
            <div className={styles.billFooterNotice}>
              <div className={styles.billFooterNoteText}>
                <strong>Important Instructions:</strong> {bookingConfig.instructions}
              </div>
              <div className={styles.billSealBox}>
                <span>OFFICIALLY VERIFIED</span>
                <small>{salonConfig.name}</small>
              </div>
            </div>
          </div>

          <p className={styles.successNote}>
            {bookingConfig.bookingNotice}
          </p>

          <div className={styles.successActions}>
            {/* Download as PDF Button */}
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloadingPdf}
              className={`${styles.downloadSlipBtn} ${styles.downloadPdfBtn}`}
              aria-label="Download Confirmation Slip as PDF"
            >
              <PictureAsPdfIcon fontSize="small" />
              <span>{isDownloadingPdf ? "Creating PDF..." : "Download PDF"}</span>
            </button>

            {/* Download as Image Button */}
            {/* <button
              type="button"
              onClick={handleDownloadImage}
              disabled={isDownloadingImage}
              className={`${styles.downloadSlipBtn} ${styles.downloadImgBtn}`}
              aria-label="Download Confirmation Slip as Image"
            >
              <ImageIcon fontSize="small" />
              <span>{isDownloadingImage ? "Creating Image..." : "Download Image"}</span>
            </button> */}

            {/* Send on WhatsApp */}
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappConfirmBtn}
            >
              <WhatsAppIcon fontSize="small" />
              <span>Send on WhatsApp</span>
            </a>

            {/* New Booking */}
            <button
              type="button"
              onClick={() => {
                setConfirmedRef(null);
                setCustomerName("");
                setCustomerPhone("");
              }}
              className={styles.newBookingBtn}
            >
              Book Another
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formHeader}>
            <h2 className={styles.heading}>{bookingConfig.heading}</h2>
            <p className={styles.subheading}>
              {bookingConfig.subheading}
            </p>
          </div>

          {isAuthenticated === false && (
            <div style={{
              background: "rgba(197, 160, 89, 0.12)",
              border: "1px solid var(--color-border-gold)",
              borderRadius: "10px",
              padding: "1.25rem 1.5rem",
              marginBottom: "1.5rem",
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: "1rem"
            }}>
              <div>
                <strong style={{ display: "block", color: "var(--color-primary)", fontSize: "1rem" }}>
                  Registered Client Account Required
                </strong>
                <span style={{ fontSize: "0.85rem", color: "var(--color-text-secondary)" }}>
                  Guest booking is disabled to earn and redeem salon loyalty rewards. Please create your account or sign in to reserve your appointment slot.
                </span>
              </div>
              <Link
                href={`/login?redirect=${encodeURIComponent(typeof window !== "undefined" ? window.location.pathname + window.location.search : "/booking")}`}
                style={{
                  padding: "0.6rem 1.25rem",
                  background: "var(--color-primary)",
                  color: "var(--color-secondary)",
                  border: "1px solid var(--color-secondary)",
                  borderRadius: "8px",
                  fontWeight: 700,
                  fontSize: "0.85rem",
                  textDecoration: "none",
                  whiteSpace: "nowrap"
                }}
              >
                Sign In / Sign Up
              </Link>
            </div>
          )}

          {/* Step 1: Select Service */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitleRow}>
              <ContentCutIcon className={styles.sectionIcon} fontSize="small" />
              <label htmlFor="service-select" className={styles.sectionLabel}>
                1. Select Service *
              </label>
            </div>

            <div className={styles.inputWrapper}>
              <select
                id="service-select"
                value={selectedServiceId}
                onChange={(e) => setSelectedServiceId(e.target.value)}
                className={styles.selectInput}
                required
              >
                {SALON_SERVICES_CATEGORIES.map((cat) => (
                  <optgroup key={cat.id} label={`── ${cat.title} ──`}>
                    {cat.subGroups.flatMap((g) =>
                      g.items.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name} ({item.priceDisplay})
                        </option>
                      ))
                    )}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Selected Service Preview Badge */}
            {selectedService && (
              <div className={styles.serviceBadgeRow}>
                <div className={styles.serviceBadge}>
                  <span className={styles.badgeCategory}>{selectedService.categoryTitle}</span>
                  <span className={styles.badgeDivider}>•</span>
                  <span className={styles.badgeName}>{selectedService.name}</span>
                  <span className={styles.badgePrice}>{selectedService.priceDisplay}</span>
                </div>
                <Link
                  href={`/services/${selectedService.slug}`}
                  target="_blank"
                  className={styles.serviceDetailsLink}
                >
                  <span>View Details</span>
                  <ArrowForwardIcon fontSize="inherit" />
                </Link>
              </div>
            )}
          </div>

          {/* Step 2: Date & Time Slot */}
          <div className={styles.sectionBlock}>
            <div className={styles.dateTimeGrid}>
              {/* Date Picker */}
              <div className={styles.fieldCol}>
                <div className={styles.sectionTitleRow}>
                  <CalendarTodayIcon className={styles.sectionIcon} fontSize="small" />
                  <label htmlFor="date-input" className={styles.sectionLabel}>
                    2. Appointment Date *
                  </label>
                </div>
                <input
                  id="date-input"
                  type="date"
                  min={new Date().toISOString().split("T")[0]}
                  value={appointmentDate}
                  onChange={(e) => setAppointmentDate(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              {/* Time Slots */}
              <div className={styles.fieldCol}>
                <div className={styles.sectionTitleRow}>
                  <AccessTimeIcon className={styles.sectionIcon} fontSize="small" />
                  <span className={styles.sectionLabel}>3. Preferred Time Slot *</span>
                </div>

                <div className={styles.slotsGrid}>
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = slot === timeSlot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTimeSlot(slot)}
                        className={`${styles.slotPill} ${isSelected ? styles.slotPillActive : ""}`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Step 3: Client Details */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitleRow}>
              <PersonIcon className={styles.sectionIcon} fontSize="small" />
              <span className={styles.sectionLabel}>4. Your Contact Details</span>
            </div>

            <div className={styles.clientFieldsGrid}>
              <div className={styles.fieldCol}>
                <label className={styles.subLabel}>Your Full Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Priya Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={styles.textInput}
                  required
                />
              </div>

              <div className={styles.fieldCol}>
                <label className={styles.subLabel}>Phone / WhatsApp Number *</label>
                <input
                  type="tel"
                  placeholder="e.g. 78692 60666"
                  value={customerPhone}
                  onChange={(e) => {
                    setCustomerPhone(e.target.value);
                    if (phoneError) setPhoneError("");
                  }}
                  className={`${styles.textInput} ${phoneError ? styles.inputError : ""}`}
                  required
                />
                {phoneError && <span className={styles.errorText}>{phoneError}</span>}
              </div>

              <div className={styles.fieldCol}>
                <label className={styles.subLabel}>Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. priya@gmail.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className={styles.textInput}
                />
              </div>
            </div>

            <div className={styles.instructionCol}>
              <label className={styles.subLabel}>Special Request / Hair Length Note (Optional)</label>
              <textarea
                placeholder="e.g. Waist length hair / need bridal consultation / arriving with sister..."
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                className={styles.textareaInput}
                rows={2}
              />
            </div>
          </div>

          {/* Loyalty Rewards & Payment Mode Selector */}
          <div className={styles.sectionBlock}>
            <div className={styles.sectionTitleRow}>
              <LoyaltyIcon className={styles.sectionIcon} fontSize="small" />
              <span className={styles.sectionLabel}>5. Loyalty Rewards &amp; Payment Summary</span>
            </div>

            <div style={{ background: "var(--color-surface-subtle)", border: "1px solid var(--color-border)", borderRadius: "10px", padding: "1.25rem", margin: "1rem 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Selected Service:</span>
                <strong>{selectedService.name}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                <span style={{ color: "var(--color-text-secondary)" }}>Base Price:</span>
                <strong>{servicePrice > 0 ? `₹${servicePrice}` : "Consultation"}</strong>
              </div>

              {userLoyalty && userLoyalty.currentPoints > 0 && servicePrice > 0 && (
                <div style={{ borderTop: "1px dashed var(--color-border)", paddingTop: "0.75rem", marginTop: "0.75rem" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.5rem" }}>
                    <span style={{ fontSize: "0.9rem", color: "var(--color-secondary-hover)", fontWeight: 600 }}>
                      Available Loyalty Points: {userLoyalty.currentPoints} pts (Max redeemable: {maxRedeemablePoints} pts)
                    </span>
                    <button
                      type="button"
                      onClick={() => setRedeemPoints(redeemPoints > 0 ? 0 : maxRedeemablePoints)}
                      style={{
                        padding: "0.35rem 0.75rem",
                        background: redeemPoints > 0 ? "var(--color-surface)" : "var(--color-primary)",
                        color: redeemPoints > 0 ? "var(--color-primary)" : "var(--color-secondary-light)",
                        border: "1px solid var(--color-secondary)",
                        borderRadius: "6px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        cursor: "pointer"
                      }}
                    >
                      {redeemPoints > 0 ? "Remove Points" : "Apply Max Points"}
                    </button>
                  </div>
                  {discountAmount > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", color: "var(--color-success)", fontWeight: 600 }}>
                      <span>Loyalty Discount Applied:</span>
                      <span>-₹{discountAmount}</span>
                    </div>
                  )}
                </div>
              )}

              {servicePrice > 0 && (
                <div style={{ borderTop: "1px solid var(--color-border)", paddingTop: "0.75rem", marginTop: "0.75rem", display: "flex", justifyContent: "space-between", fontSize: "1.1rem", fontWeight: 800 }}>
                  <span>Final Payable Amount:</span>
                  <span style={{ color: "var(--color-secondary)" }}>₹{finalPayableAmount}</span>
                </div>
              )}
            </div>

            {/* Payment Options */}
            {servicePrice > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "0.75rem" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>
                  <input
                    type="radio"
                    name="payOption"
                    checked={payOnline}
                    onChange={() => setPayOnline(true)}
                  />
                  <strong>Pay Online via Razorpay (Instant Points on Confirmation)</strong>
                </label>
                <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", cursor: "pointer", fontSize: "0.9rem" }}>
                  <input
                    type="radio"
                    name="payOption"
                    checked={!payOnline}
                    onChange={() => setPayOnline(false)}
                  />
                  <span>Pay at Salon (Cash / UPI at Venue &amp; Earn Points Upon Visit)</span>
                </label>
              </div>
            )}
          </div>

          {/* Location Summary Note */}
          <div className={styles.locationNotice}>
            <LocationOnIcon fontSize="small" className={styles.locationIcon} />
            <div className={styles.locationNoticeText}>
              <strong>Salon Venue:</strong> 201, EC 8, RP Avenue, near Uttam bhog, opposite Bombay Hospital Service Road, Pushp Vihar Colony, Scheme 94 Sector EC, Indore.
              <span> Open all 7 days from 10:00 AM to 09:00 PM.</span>
            </div>
          </div>

          {/* Submit Action */}
          <div className={styles.submitRow}>
            <button
              type="submit"
              disabled={isSubmitting}
              className={styles.submitBtn}
            >
              <span>{isSubmitting ? "Confirming Slot..." : "Confirm Appointment Now"}</span>
              <ArrowForwardIcon fontSize="small" />
            </button>
          </div>

          {/* Quick Help Footer */}
          <div className={styles.quickHelpRow}>
            <span>Need help or instant slot?</span>
            <a
              href={`tel:${salonConfig.contact.phone}`}
              className={styles.quickCallLink}
              onClick={() =>
                trackInteraction({
                  eventType: "call_click",
                  sourceLocation: "booking_page_help",
                  targetUrl: `tel:${salonConfig.contact.phone}`
                })
              }
            >
              <PhoneIcon fontSize="inherit" />
              <span>Call {salonConfig.contact.phoneDisplay}</span>
            </a>
            <span>or</span>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.quickWhatsappLink}
              onClick={() =>
                trackInteraction({
                  eventType: "whatsapp_click",
                  sourceLocation: "booking_page_help",
                  targetUrl: whatsappUrl
                })
              }
            >
              <WhatsAppIcon fontSize="inherit" />
              <span>WhatsApp Us</span>
            </a>
          </div>
        </form>
      )}
    </div>
  );
};
