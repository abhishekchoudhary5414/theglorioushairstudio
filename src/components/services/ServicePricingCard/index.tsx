"use client";

import React from "react";
import Link from "next/link";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { SubServiceItem } from "@/data/services";
import { salonConfig } from "@/config/salon.config";
import { trackInteraction } from "@/lib/utils/analytics";
import styles from "./ServicePricingCard.module.css";

interface ServicePricingCardProps {
  item: SubServiceItem;
  featured?: boolean;
}

export const ServicePricingCard: React.FC<ServicePricingCardProps> = ({
  item,
  featured = false,
}) => {
  const whatsappUrl = `https://wa.me/${salonConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${salonConfig.name}, I want to enquire about ${item.name} (${item.priceDisplay || ""}).`
  )}`;

  return (
    <article className={`${styles.card} ${featured ? styles.cardFeatured : ""}`}>
      {item.badge && <span className={styles.badge}>{item.badge}</span>}

      <div className={styles.header}>
        <h4 className={styles.title}>{item.name}</h4>
      </div>

      {item.description && <p className={styles.desc}>{item.description}</p>}

      <div className={styles.priceRow}>
        <span className={styles.priceLabel}>Price / Fees</span>
        <span className={styles.priceValue}>{item.priceDisplay}</span>
      </div>

      <div className={styles.actionsGrid}>
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={`${styles.actionBtn} ${styles.btnWhatsapp}`}
          aria-label={`WhatsApp about ${item.name}`}
          onClick={() =>
            trackInteraction({
              eventType: "whatsapp_click",
              serviceName: item.name,
              sourceLocation: "service_card",
              targetUrl: whatsappUrl
            })
          }
        >
          <WhatsAppIcon fontSize="inherit" />
          <span>WhatsApp</span>
        </a>

        <Link
          href={`/booking?serviceId=${encodeURIComponent(item.id)}`}
          className={`${styles.actionBtn} ${styles.btnBook}`}
          aria-label={`Book now for ${item.name}`}
          onClick={() =>
            trackInteraction({
              eventType: "booking_click",
              serviceName: item.name,
              sourceLocation: "service_card",
              targetUrl: `/booking?serviceId=${encodeURIComponent(item.id)}`
            })
          }
        >
          <span>Book Now</span>
        </Link>
      </div>

      <Link href={`/services/${item.slug}`} className={styles.detailsLink}>
        <span>View Full Details &amp; Benefits</span>
        <ArrowForwardIcon fontSize="inherit" />
      </Link>
    </article>
  );
};
