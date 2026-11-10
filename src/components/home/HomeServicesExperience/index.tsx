"use client";

import React, { useState } from "react";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import SchoolIcon from "@mui/icons-material/School";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import SpaIcon from "@mui/icons-material/Spa";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import BrushIcon from "@mui/icons-material/Brush";
import ColorLensIcon from "@mui/icons-material/ColorLens";
import HotTubIcon from "@mui/icons-material/HotTub";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { SALON_SERVICES_CATEGORIES } from "@/data/services";
import { ServicePricingCard } from "@/components/services/ServicePricingCard";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import styles from "./HomeServicesExperience.module.css";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  "academy-courses": <SchoolIcon fontSize="inherit" />,
  "makeup-hair-styling": <BrushIcon fontSize="inherit" />,
  "hair-treatments": <AutoAwesomeIcon fontSize="inherit" />,
  "haircuts-basic": <ContentCutIcon fontSize="inherit" />,
  "wax-body-care": <SpaIcon fontSize="inherit" />,
  "facial-cleanup": <FaceRetouchingNaturalIcon fontSize="inherit" />,
  "hair-colour": <ColorLensIcon fontSize="inherit" />,
  "hair-spa": <HotTubIcon fontSize="inherit" />,
};

const tabs = [{ id: "all", title: "All" }, ...SALON_SERVICES_CATEGORIES];

export const HomeServicesExperience: React.FC = () => {
  const [selectedCatId, setSelectedCatId] = useState<string>("all");

  const visibleCategories =
    selectedCatId === "all"
      ? SALON_SERVICES_CATEGORIES
      : SALON_SERVICES_CATEGORIES.filter((category) => category.id === selectedCatId);

  return (
    <section className={styles.section} id="salon-services">
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Our Complete Rate Card"
          title="Professional Salon Services &amp; Transparent Pricing"
          subtitle="All services in separate sections with instant WhatsApp, Call, and Online Booking. No hidden costs."
        />

        <div className={styles.tabsContainer}>
          <div className={styles.tabsScroller}>
            {tabs.map((cat) => {
              const isActive = cat.id === selectedCatId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCatId(cat.id)}
                  className={`${styles.tabBtn} ${isActive ? styles.tabBtnActive : ""}`}
                >
                  <span className={styles.tabIcon}>
                    {cat.id === "all" ? <AutoAwesomeIcon fontSize="inherit" /> : CATEGORY_ICONS[cat.id] || <AutoAwesomeIcon fontSize="inherit" />}
                  </span>
                  <span className={styles.tabLabel}>{cat.title}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.categorySections}>
          {visibleCategories.map((category) => (
            <div key={category.id} className={styles.activeCategoryBox}>
              <div className={styles.categoryInfo}>
                <div className={styles.categoryBadge}>
                  {CATEGORY_ICONS[category.id] || <AutoAwesomeIcon fontSize="inherit" />}
                  <span>{category.eyebrow}</span>
                </div>
                <h3 className={styles.categoryTitle}>{category.title}</h3>
                <p className={styles.categoryDesc}>{category.description}</p>
              </div>

              <div className={styles.cardGrid}>
                {category.subGroups.flatMap((group) =>
                  group.items.map((item, idx) => (
                    <ServicePricingCard
                      key={`${item.id}-${idx}`}
                      item={item}
                      featured={Boolean(item.badge)}
                    />
                  ))
                )}
              </div>

              {category.highlightedNote && (
                <div className={styles.highlightBanner}>
                  <AutoAwesomeIcon fontSize="small" className={styles.bannerIcon} />
                  <p className={styles.bannerText}>
                    <strong>Important Note:</strong> {category.highlightedNote}
                  </p>
                </div>
              )}

              {category.ctaText && category.ctaHref && (
                <div className={styles.categoryCtaWrapper}>
                  <a
                    href={category.ctaHref}
                    target={category.ctaHref.startsWith("http") ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className={styles.categoryActionLink}
                  >
                    <span>{category.ctaText}</span>
                    <ArrowForwardIcon fontSize="small" />
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles.bottomLinkWrapper}>
          <SecondaryButton href="/services">
            Open Full Rate Card Page &amp; Detailed Breakdown
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
};
