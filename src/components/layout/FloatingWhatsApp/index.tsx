"use client";

import React from "react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { salonConfig } from "@/config/salon.config";
import { trackInteraction } from "@/lib/utils/analytics";
import styles from "./FloatingWhatsApp.module.css";

export const FloatingWhatsApp: React.FC = () => {
  const whatsappUrl = `https://wa.me/${salonConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${salonConfig.name}, I would like to book an appointment.`
  )}`;

  const handleWhatsappClick = () => {
    trackInteraction({
      eventType: "whatsapp_click",
      sourceLocation: "floating_bottom_right",
      targetUrl: whatsappUrl
    });
  };

  const handleBookingClick = () => {
    trackInteraction({
      eventType: "booking_click",
      sourceLocation: "floating_bottom_right",
      targetUrl: "/booking"
    });
  };

  return (
    <div className={styles.floatingContainer}>
      <a
        href="/booking"
        onClick={handleBookingClick}
        className={`${styles.floatBtn} ${styles.bookBtn}`}
        aria-label="Book an appointment now"
      >
        <span className={styles.label}>Book Now</span>
      </a>

      <a
        href={whatsappUrl}
        onClick={handleWhatsappClick}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.floatBtn} ${styles.whatsappBtn}`}
        aria-label="WhatsApp Salon Concierge"
      >
        <WhatsAppIcon fontSize="medium" />
        <span className={styles.label}>WhatsApp</span>
      </a>
    </div>
  );
};

