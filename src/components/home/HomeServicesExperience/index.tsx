"use client";

import React, { useState } from "react";
import Link from "next/link";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SchoolIcon from "@mui/icons-material/School";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import SpaIcon from "@mui/icons-material/Spa";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import BrushIcon from "@mui/icons-material/Brush";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import HotTubIcon from "@mui/icons-material/HotTub";
import { SALON_SERVICES_CATEGORIES } from "@/data/services";
import { ServicePricingCard } from "@/components/services/ServicePricingCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import styles from "./HomeServicesExperience.module.css";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "academy-courses": <SchoolIcon fontSize="inherit" />,
  "makeup-and-hair-styling": <BrushIcon fontSize="inherit" />,
  "hair-treatments": <AutoAwesomeIcon fontSize="inherit" />,
  "haircuts-and-basic": <ContentCutIcon fontSize="inherit" />,
  "wax-and-body-care": <SpaIcon fontSize="inherit" />,
  "facial-and-cleanup": <FaceRetouchingNaturalIcon fontSize="inherit" />,
  "hair-colour": <ColorLensIcon fontSize="inherit" />,
  "hair-spa": <HotTubIcon fontSize="inherit" />,
};

export const HomeServicesExperience: React.FC = () => {
  const [selectedCatId, setSelectedCatId] = useState<string>(
    SALON_SERVICES_CATEGORIES[0].id
  );

  const currentCategory =
    SALON_SERVICES_CATEGORIES.find((c) => c.id === selectedCatId) ||
    SALON_SERVICES_CATEGORIES[0];

  return (
    <section className={styles.section} id="salon-services">
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Our Complete Rate Card"
          title="Professional Salon Services &amp; Transparent Pricing"
          subtitle="All services in card view with instant WhatsApp, Call, and Online Booking. No hidden costs."
        />

        {/* Tab Navigation for All 8 Categories */}
        <div className={styles.tabsContainer}>
          <div className={styles.tabsScroller}>
            {SALON_SERVICES_CATEGORIES.map((cat) => {
              const isActive = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
                >
                  <span className={styles.tabIcon}>
                    {CATEGORY_ICONS[cat.id] || <AutoAwesomeIcon fontSize="inherit" />}
                  </span>
                  <span className={styles.tabLabel}>{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Category Display */}
        <div className={styles.activeCategoryBox}>
          <div className={styles.categoryInfo}>
            <div className={styles.categoryBadge}>
              {CATEGORY_ICONS[currentCategory.id]}
              <span>{currentCategory.eyebrow}</span>
            </div>
            <h3 className={styles.categoryTitle}>{currentCategory.title}</h3>
            <p className={styles.categoryDesc}>{currentCategory.description}</p>
          </div>

          {/* Service Cards Grid for the Active Category */}
          <div className={styles.cardGrid}>
            {currentCategory.subGroups.flatMap((g) =>
              g.items.map((item, idx) => (
                <ServicePricingCard
                  key={`${item.id}-${idx}`}
                  item={item}
                  featured={item.badge !== undefined}
                />
              ))
            )}
          </div>

          {/* Highlight note if present */}
          {currentCategory.highlightedNote && (
            <div className={styles.highlightBanner}>
              <AutoAwesomeIcon fontSize="small" className={styles.bannerIcon} />
              <p className={styles.bannerText}>
                <strong>Important Note:</strong> {currentCategory.highlightedNote}
              </p>
            </div>
          )}

          {/* CTA Box */}
          {currentCategory.ctaText && currentCategory.ctaHref && (
            <div className={styles.categoryCtaWrapper}>
              <a
                href={currentCategory.ctaHref}
                target={currentCategory.ctaHref.startsWith("http") ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={styles.categoryActionLink}
              >
                <span>{currentCategory.ctaText}</span>
                <ArrowForwardIcon fontSize="small" />
              </a>
            </div>
          )}
        </div>

        {/* Bottom Link to Full Services Dedicated Page */}
        <div className={styles.bottomLinkWrapper}>
          <SecondaryButton href="/services">
            Open Full Rate Card Page &amp; Detailed Breakdown
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
};
