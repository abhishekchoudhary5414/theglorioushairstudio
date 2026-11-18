"use client";

import React from "react";
import Image from "next/image";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CardGiftcardIcon from "@mui/icons-material/CardGiftcard";
import VerifiedIcon from "@mui/icons-material/Verified";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { salonConfig } from "@/config/salon.config";
import styles from "./Hero.module.css";
import HeroImage from "../../../../public/hero/hero-girl.png";

export const Hero: React.FC = () => {
  return (
    <section className={styles.hero}>
      {/* Background Atmosphere */}
      <div className={styles.bgContainer}>
        <div className={styles.bgImage} />
        <div className={styles.glowOrb1} />
        <div className={styles.glowOrb2} />
        <div className={styles.gradientOverlay} />
      </div>

      <div className={styles.container}>
        {/* Left Editorial Content */}
        <div className={styles.content}>
          <div className={styles.badge}>
            <AutoAwesomeIcon fontSize="inherit" />
            <span>Indore's Premier Unisex Salon &amp; Academy</span>
          </div>

          <h1 className={styles.title}>
            Master Your Look With <br />
            <span className={styles.titleItalic}>Couture Hair,</span>{" "}
            <span className={styles.titleGold}>Flawless Skin</span> <br />
            &amp; Bridal Artistry
          </h1>

          {/* Action CTAs */}
          <div className={styles.actions} style={{ marginTop: "1rem" }}>
            <PrimaryButton href="/booking" variant="gold">
              <span>Book Instant Appointment</span>
              <ArrowForwardIcon fontSize="small" />
            </PrimaryButton>

            <SecondaryButton href="/services" inverse>
              Explore Full Menu &amp; Rates
            </SecondaryButton>
          </div>

          {/* Key Authority Statistics */}
          <div className={styles.statsBar}>
            <div className={styles.statItem}>
              <span className={styles.statValue}>8+</span>
              <span className={styles.statLabel}>Years in Indore</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>1,000+</span>
              <span className={styles.statLabel}>Loyal Clients</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>4.9★</span>
              <span className={styles.statLabel}>Google Rating</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statValue}>10%</span>
              <span className={styles.statLabel}>Points Back</span>
            </div>
          </div>
        </div>

        {/* Right Interactive Image Frame with Floating Cards */}
        <div className={styles.imageShowcase}>
          {/* Floating Privilege Badge 1 */}
          <div className={styles.floatingFloatingBadge1}>
            <div className={styles.badgeIconCircle}>
              <CardGiftcardIcon fontSize="small" />
            </div>
            <div>
              <span className={styles.badgeTitle}>Loyalty Rewards</span>
              <span className={styles.badgeSubtitle}>₹100 Spent = 10 Pts</span>
            </div>
          </div>

          {/* Central Main Portrait Card */}
          <div className={styles.mainCard}>
            <Image
              src={HeroImage}
              alt={`Haute Couture Salon Styling and Bridal Makeup at ${salonConfig.name} Indore`}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 440px"
              className={styles.showcaseImg}
            />
          </div>

          {/* Floating Privilege Badge 2 */}
          <div className={styles.floatingFloatingBadge2}>
            <div className={styles.badgeIconCircle}>
              <VerifiedIcon fontSize="small" />
            </div>
            <div>
              <span className={styles.badgeTitle}>Master Stylists</span>
              <span className={styles.badgeSubtitle}>100% Satisfaction</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
