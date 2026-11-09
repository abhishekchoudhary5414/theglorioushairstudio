"use client";

import React from "react";
import SchoolIcon from "@mui/icons-material/School";
import FaceRetouchingNaturalIcon from "@mui/icons-material/FaceRetouchingNatural";
import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
import ContentCutIcon from "@mui/icons-material/ContentCut";
import SpaIcon from "@mui/icons-material/Spa";
import CleanHandsIcon from "@mui/icons-material/CleanHands";
import PaletteIcon from "@mui/icons-material/Palette";
import SelfImprovementIcon from "@mui/icons-material/SelfImprovement";
import { ServiceCategorySectionData } from "@/data/services";
import styles from "./ServiceCategoryNavigation.module.css";

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  School: <SchoolIcon fontSize="inherit" />,
  FaceRetouchingNatural: <FaceRetouchingNaturalIcon fontSize="inherit" />,
  AutoFixHigh: <AutoFixHighIcon fontSize="inherit" />,
  ContentCut: <ContentCutIcon fontSize="inherit" />,
  Spa: <SpaIcon fontSize="inherit" />,
  CleanHands: <CleanHandsIcon fontSize="inherit" />,
  Palette: <PaletteIcon fontSize="inherit" />,
  SelfImprovement: <SelfImprovementIcon fontSize="inherit" />,
};

interface ServiceCategoryNavigationProps {
  categories: ServiceCategorySectionData[];
  activeCategory: string;
  onSelectCategory: (categoryId: string) => void;
}

export const ServiceCategoryNavigation: React.FC<ServiceCategoryNavigationProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  return (
    <nav
      id="services-category-nav"
      className={styles.navWrapper}
      aria-label="Salon Service Categories"
    >
      <div className={styles.container}>
        {categories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className={`${styles.categoryPill} ${isActive ? styles.activePill : ""}`}
            >
              <span className={styles.pillIcon}>
                {CATEGORY_ICONS[cat.icon] || <SpaIcon fontSize="inherit" />}
              </span>
              <span>{cat.shortTitle}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
