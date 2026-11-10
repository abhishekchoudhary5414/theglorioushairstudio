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

  const selectedService = useMemo(() => {
    return allServices.find((s) => s.id === selectedServiceId) || allServices[0];
  }, [allServices, selectedServiceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPhoneError("");

    if (!customerName.trim()) {
      return;
    }

    if (!validateIndianPhone(customerPhone)) {
      setPhoneError("Please enter a valid 10-digit Indian phone number.");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        serviceId: selectedService.id,
        serviceName: `${selectedService.name} (${selectedService.categoryTitle})`,
        branchId: "branch-scheme-78",
        branchName: "The Glorious Hair Studio – Scheme 78, Vijay Nagar, Indore",
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
      salonName: salonConfig.name,
      salonAddress: salonConfig.address.fullAddress || "Scheme No 78, Yashraj Complex, Sector C, Aranya Nagar, Vijay Nagar, Indore",
      salonPhone: salonConfig.contact.phoneDisplay,
      salonEmail: salonConfig.contact.email,
      specialInstructions: specialInstructions || undefined,
      issuedDate: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
      logoDataUri
    };
  }, [confirmedRef, customerName, customerPhone, customerEmail, selectedService, appointmentDate, timeSlot, specialInstructions, logoDataUri]);

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
                  <span>{salonConfig.address.fullAddress || "Scheme No 78, Yashraj Complex, Sector C, Aranya Nagar, Vijay Nagar, Indore, MP 452010"}</span>
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

            {/* Official Slip Title Banner */}
            <div className={styles.billStatusBanner}>
              <div className={styles.billStatusLeft}>
                <span className={styles.billStatusBadge}>
                  <VerifiedIcon fontSize="inherit" />
                  <span>SLOT CONFIRMED</span>
                </span>
                <span className={styles.billIssueDate}>
                  Issued on: {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </div>
              <div className={styles.billRefCode}>
                <span className={styles.billRefCodeLabel}>BOOKING REF #</span>
                <span className={styles.billRefCodeValue}>{confirmedRef}</span>
              </div>
            </div>

            {/* Structured Bill Item Rows */}
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
                <span className={styles.ticketLabel}>Price / Fees (Estimate):</span>
                <span className={styles.ticketValuePrice}>{selectedService?.priceDisplay}</span>
              </div>

              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Payment Terms:</span>
                <span className={styles.ticketValue}>Pay at Salon (Cash / UPI / Card / No Advance Needed)</span>
              </div>

              {specialInstructions && (
                <div className={styles.ticketRow}>
                  <span className={styles.ticketLabel}>Client Notes / Length:</span>
                  <span className={styles.ticketValue}>{specialInstructions}</span>
                </div>
              )}

              <div className={styles.ticketRow}>
                <span className={styles.ticketLabel}>Salon Venue:</span>
                <span className={styles.ticketValue}>Yashraj Complex, Sector C, Scheme 78, Vijay Nagar, Indore</span>
              </div>
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
                  placeholder="e.g. 79875 83445"
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

          {/* Location Summary Note */}
          <div className={styles.locationNotice}>
            <LocationOnIcon fontSize="small" className={styles.locationIcon} />
            <div className={styles.locationNoticeText}>
              <strong>Salon Venue:</strong> Scheme No 78, Yashraj Complex, Sector C, Aranya Nagar, Vijay Nagar, Indore.
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
