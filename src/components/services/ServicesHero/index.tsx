"use client";

import React from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import styles from "./ServicesHero.module.css";

interface ServicesHeroProps {
  title?: string;
  subtitle?: string;
  onExploreClick?: () => void;
}

export const ServicesHero: React.FC<ServicesHeroProps> = ({
  title = "Our Services",
  subtitle = "All services in separate sections with instant WhatsApp, Call, and Online Booking. No hidden costs.",
  onExploreClick,
}) => {
  return (
    <section className={styles.heroWrapper}>
      <div
        className={styles.heroBackground}
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1920&auto=format&fit=crop')",
        }}
      />
      <div className={styles.glowOrb} />
      <div className={styles.overlay} />

      <div className={styles.content}>
        <div className={styles.badge}>
          <AutoAwesomeIcon fontSize="inherit" />
          <span>Complete Rate Card &amp; Academy</span>
        </div>

        <h1 className={styles.title}>
          {title} <span className={styles.titleEm}>&amp; Academy</span>
        </h1>

        <p className={styles.description}>{subtitle}</p>

        <div className={styles.actions}>
          <PrimaryButton href="/booking" variant="gold">
            <CalendarMonthIcon fontSize="small" />
            <span>Book Appointment</span>
          </PrimaryButton>

          <SecondaryButton
            onClick={() => {
              if (onExploreClick) {
                onExploreClick();
              } else {
                const nav = document.getElementById("services-category-nav");
                nav?.scrollIntoView({ behavior: "smooth" });
              }
            }}
            inverse
          >
            <span>Explore Services</span>
            <ArrowForwardIcon fontSize="small" />
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
};
