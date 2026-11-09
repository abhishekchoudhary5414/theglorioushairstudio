import React from "react";
import DiamondIcon from "@mui/icons-material/Diamond";
import ShieldIcon from "@mui/icons-material/Shield";
import SpaIcon from "@mui/icons-material/Spa";
import FavoriteIcon from "@mui/icons-material/Favorite";
import { SectionHeading } from "@/components/common/SectionHeading";
import { salonConfig } from "@/config/salon.config";
import styles from "./WhyChooseUs.module.css";

const ICONS_MAP: Record<string, React.ReactNode> = {
  Diamond: <DiamondIcon fontSize="medium" />,
  Shield: <ShieldIcon fontSize="medium" />,
  Spa: <SpaIcon fontSize="medium" />,
  Favorite: <FavoriteIcon fontSize="medium" />
};

export const WhyChooseUs: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="The Atelier Distinction"
          title="Why Connoisseurs Choose Our Sanctum"
          subtitle="A harmonious symphony of medical-grade hygiene protocols, master artisan credentials, and private sanctuary comfort."
        />

        <div className={styles.grid}>
          {salonConfig.features.map((feature, i) => (
            <div key={i} className={styles.card}>
              <div className={styles.iconWrapper}>
                {ICONS_MAP[feature.icon] || <DiamondIcon fontSize="medium" />}
              </div>
              <h3 className={styles.title}>{feature.title}</h3>
              <p className={styles.desc}>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

