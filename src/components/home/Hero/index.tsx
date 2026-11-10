"use client";

import React from "react";
import Image from "next/image";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import StarIcon from "@mui/icons-material/Star";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneIcon from "@mui/icons-material/Phone";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import Face3Icon from "@mui/icons-material/Face3";
import BrushIcon from "@mui/icons-material/Brush";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { salonConfig } from "@/config/salon.config";
import { trackInteraction } from "@/lib/utils/analytics";
import styles from "./Hero.module.css";
import HeroImage from "../../../../public/hero/hero-girl.png"

export const Hero: React.FC = () => {
  const whatsappUrl = `https://wa.me/${salonConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${salonConfig.name}, I would like to book a salon appointment.`
  )}`;

  return (
    <section className={styles.hero}>
      <div className={styles.bgContainer}>
        <div className={styles.bgImage} />
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.gradientOverlay} />
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <div className={styles.badge}>
            <AutoAwesomeIcon fontSize="inherit" />
            <span>{salonConfig.tagline}</span>
          </div>

          <h1 className={styles.title}>
            Look Your Best With <span className={styles.titleEm}>Expert Hair, Styling &amp; Makeup</span>
          </h1>

          <div className={styles.serviceHighlights}>
            <div className={styles.highlightPill}>
              <ContentCutIcon fontSize="small" />
              <span>Haircut</span>
            </div>
            <div className={styles.highlightPill}>
              <Face3Icon fontSize="small" />
              <span>Styling</span>
            </div>
            <div className={styles.highlightPill}>
              <BrushIcon fontSize="small" />
              <span>Makeup</span>
            </div>
            <div className={styles.highlightPill}>
              <AutoAwesomeIcon fontSize="small" />
              <span>Quality Service at Best Price</span>
            </div>
          </div>

          <p className={styles.description}>
            Welcome to {salonConfig.name}. We provide professional haircuts, hair styling, hair treatments,
            rejuvenating facials, and wedding bridal makeup in Indore with 100% genuine products and top-quality care.
          </p>

          <div className={styles.locationBar}>
            <LocationOnIcon className={styles.locationIcon} fontSize="small" />
            <span className={styles.locationText}>
              <strong>Visit Us Today:</strong> {salonConfig.address.fullAddress || "Scheme No 78, Yashraj Complex, Sector C, Vijay Nagar, Indore"}
            </span>
          </div>

          <div className={styles.actions}>
            <PrimaryButton href="/booking" variant="gold">
              <span>Book Appointment Now</span>
              <ArrowForwardIcon fontSize="small" />
            </PrimaryButton>

          

        

            <SecondaryButton href="/services" inverse>
              View Services &amp; Prices
            </SecondaryButton>
          </div>

          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>8+</span>
              <span className={styles.statLabel}>Years in Indore</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>1,000+</span>
              <span className={styles.statLabel}>Happy Clients</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>4.9★</span>
              <span className={styles.statLabel}>Google Rating</span>
            </div>
          </div>
        </div>

        <div className={styles.imageShowcase}>
          <div className={styles.mainCard}>
            <Image
              src={HeroImage}
              alt="Professional Hair Styling and Makeup Session at The Glorious Hair Studio Indore"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 420px"
              className={styles.showcaseImg}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
