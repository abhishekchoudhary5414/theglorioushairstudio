"use client";

import React, { useState } from "react";
import PhoneIcon from "@mui/icons-material/Phone";
import EmailIcon from "@mui/icons-material/Email";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { salonConfig } from "@/config/salon.config";
import { trackInteraction } from "@/lib/utils/analytics";
import styles from "./contact.module.css";

export const ContactClient: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    serviceInterest: "hair-care",
    message: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to submit inquiry.");
      }

      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Submission error.";
      setErrorMessage(msg);
    } finally {
      setLoading(false);
    }
  };

  const whatsappUrl = `https://wa.me/${salonConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${salonConfig.name} Indore, I want to inquire about salon services.`
  )}`;

  return (
    <div className={styles.container}>
      <div className={styles.grid}>
        {/* Contact Info Column */}
        <div className={styles.infoCol}>
          <SectionHeading
            align="left"
            eyebrow="Get In Touch"
            title="We Are Always Happy to Help"
            subtitle="Call or message our front desk at Scheme 78, Vijay Nagar, Indore for appointments and queries."
          />

          <div className={styles.infoCard}>
            <div className={styles.infoRow}>
              <div className={styles.infoIconWrapper}>
                <LocationOnIcon fontSize="small" />
              </div>
              <div className={styles.infoDetails}>
                <span className={styles.infoLabel}>Main Salon Address (Vijay Nagar)</span>
                <span className={styles.infoValue}>
                  {salonConfig.address.line1}, {salonConfig.address.line2}, {salonConfig.address.city}, {salonConfig.address.state} - {salonConfig.address.pincode}
                </span>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoIconWrapper}>
                <PhoneIcon fontSize="small" />
              </div>
              <div className={styles.infoDetails}>
                <span className={styles.infoLabel}>Phone Number</span>
                <a
                  href={`tel:${salonConfig.contact.phone}`}
                  className={styles.infoValue}
                  onClick={() =>
                    trackInteraction({
                      eventType: "call_click",
                      sourceLocation: "contact_page",
                      targetUrl: `tel:${salonConfig.contact.phone}`
                    })
                  }
                >
                  {salonConfig.contact.phoneDisplay}
                </a>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoIconWrapper}>
                <WhatsAppIcon fontSize="small" />
              </div>
              <div className={styles.infoDetails}>
                <span className={styles.infoLabel}>WhatsApp Chat</span>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.infoValue}
                  onClick={() =>
                    trackInteraction({
                      eventType: "whatsapp_click",
                      sourceLocation: "contact_page",
                      targetUrl: whatsappUrl
                    })
                  }
                >
                  {salonConfig.contact.whatsappDisplay} (Click to Chat)
                </a>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoIconWrapper}>
                <EmailIcon fontSize="small" />
              </div>
              <div className={styles.infoDetails}>
                <span className={styles.infoLabel}>Email Support</span>
                <a href={`mailto:${salonConfig.contact.email}`} className={styles.infoValue}>
                  {salonConfig.contact.email}
                </a>
              </div>
            </div>

            <div className={styles.infoRow}>
              <div className={styles.infoIconWrapper}>
                <AccessTimeIcon fontSize="small" />
              </div>
              <div className={styles.infoDetails}>
                <span className={styles.infoLabel}>Working Hours</span>
                {salonConfig.hours.map((h, i) => (
                  <span key={i} className={styles.infoValue} style={{ fontSize: "0.875rem" }}>
                    {h.days}: {h.time}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Form Column */}
        <div className={styles.formCol}>
          <h2 className={styles.formTitle}>Send Us a Message</h2>
          <p className={styles.formSubtitle}>
            Fill in your details below and our team will get in touch with you shortly.
          </p>

          {submitted ? (
            <div style={{
              padding: "2rem",
              backgroundColor: "var(--color-surface-subtle)",
              borderRadius: "var(--radius-xs)",
              border: "1px solid var(--color-secondary)",
              textAlign: "center"
            }}>
              <h3 style={{ fontFamily: "var(--font-heading)", color: "var(--color-primary)", marginBottom: "0.5rem" }}>
                Thank You, {formData.name}!
              </h3>
              <p style={{ color: "var(--color-text-secondary)", fontSize: "0.9375rem" }}>
                We have received your message. Our team will call or WhatsApp you at {formData.phone} within 1 hour.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Your Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Mobile Number *</label>
                <input
                  type="tel"
                  required
                  placeholder="e.g. 79875 83445"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email Address (Optional)</label>
                <input
                  type="email"
                  placeholder="e.g. priya@gmail.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={styles.input}
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Service You Are Interested In</label>
                <select
                  value={formData.serviceInterest}
                  onChange={(e) => setFormData({ ...formData, serviceInterest: e.target.value })}
                  className={styles.select}
                >
                  <option value="hair-care">Haircut &amp; Keratin Treatment</option>
                  <option value="hair-colouring">Balayage &amp; Hair Highlights</option>
                  <option value="bridal-makeup">Bridal Makeup &amp; Packages</option>
                  <option value="facials">O3+ &amp; Glowing Facials</option>
                  <option value="spa-wellness">Body Massage &amp; Spa</option>
                  <option value="other">General Inquiries</option>
                </select>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Message or Preferred Time</label>
                <textarea
                  placeholder="Tell us what you need or when you'd like to visit..."
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className={styles.textarea}
                />
              </div>

              {errorMessage && (
                <div style={{ color: "var(--color-error)", fontSize: "0.875rem", marginBottom: "1rem" }}>
                  {errorMessage}
                </div>
              )}

              <PrimaryButton type="submit" variant="gold" fullWidth disabled={loading}>
                {loading ? "Submitting..." : "Submit Inquiry"}
              </PrimaryButton>
            </form>
          )}
        </div>
      </div>

      {/* Branches Section */}
      <div className={styles.branchesSection}>
        <SectionHeading
          eyebrow="Our Locations"
          title="Visit Us in Indore"
          subtitle="Two convenient salon locations with easy parking and comfortable air-conditioned interiors."
        />

        <div className={styles.branchesGrid}>
          {salonConfig.branches.map((b) => (
            <div key={b.id} className={styles.branchCard}>
              <h3 className={styles.branchName}>{b.name}</h3>
              <span className={styles.branchArea}>{b.area}</span>
              <p className={styles.branchAddress}>{b.address}</p>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-text-secondary)", marginBottom: "0.5rem" }}>
                Phone: {b.phone}
              </p>
              <p style={{ fontSize: "0.8125rem", color: "var(--color-secondary)" }}>
                Timing: {b.timing}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Map Embed */}
      <div className={styles.mapWrapper}>
        <iframe
          src={salonConfig.address.googleMapsEmbedUrl}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen={false}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Google Maps Location of Indore Salon"
        />
      </div>
    </div>
  );
};
