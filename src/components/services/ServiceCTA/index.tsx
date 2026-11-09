import React from "react";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import styles from "./ServiceCTA.module.css";

interface ServiceCTAProps {
  heading?: string;
  subtext?: string;
  ctaText: string;
  ctaHref: string;
  ctaType?: "booking" | "whatsapp" | "contact";
}

export const ServiceCTA: React.FC<ServiceCTAProps> = ({
  heading = "Ready to experience this service?",
  subtext = "Book your slot in advance or speak directly with our consultation desk.",
  ctaText,
  ctaHref,
  ctaType = "booking",
}) => {
  return (
    <div className={styles.ctaWrapper}>
      <div className={styles.textGroup}>
        <h4 className={styles.heading}>{heading}</h4>
        <p className={styles.subtext}>{subtext}</p>
      </div>

      <div className={styles.buttonGroup}>
        {ctaType === "whatsapp" ? (
          <a
            href={ctaHref}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.whatsappLink}
          >
            <WhatsAppIcon fontSize="small" />
            <span>{ctaText}</span>
          </a>
        ) : (
          <PrimaryButton href={ctaHref} variant="gold">
            <span>{ctaText}</span>
            <ArrowForwardIcon fontSize="small" />
          </PrimaryButton>
        )}
      </div>
    </div>
  );
};
