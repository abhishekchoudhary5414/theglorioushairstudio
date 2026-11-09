"use client";

import React from "react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import PhoneIcon from "@mui/icons-material/Phone";
import { salonConfig } from "@/config/salon.config";
import { trackInteraction } from "@/lib/utils/analytics";
import styles from "./FloatingWhatsApp.module.css";

export const FloatingWhatsApp: React.FC = () => {
  const whatsappUrl = `https://wa.me/${salonConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${salonConfig.name}, I would like to enquire about appointment availability.`
  )}`;

  const handleCallClick = () => {
    trackInteraction({
      eventType: "call_click",
      sourceLocation: "floating_bottom_right",
      targetUrl: `tel:${salonConfig.contact.phone}`
    });
  };

  const handleWhatsappClick = () => {
    trackInteraction({
      eventType: "whatsapp_click",
      sourceLocation: "floating_bottom_right",
      targetUrl: whatsappUrl
    });
  };

  return (
    <div className={styles.floatingContainer}>
      {/* Call Button */}
      <a
        href={`tel:${salonConfig.contact.phone}`}
        onClick={handleCallClick}
        className={`${styles.floatBtn} ${styles.callBtn}`}
        aria-label={`Call Salon at ${salonConfig.contact.phoneDisplay}`}
      >
        <PhoneIcon fontSize="medium" />
        <span className={styles.label}>Call Us</span>
      </a>

      {/* WhatsApp Button */}
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

