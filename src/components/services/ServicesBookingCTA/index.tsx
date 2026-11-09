import React from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneIcon from "@mui/icons-material/Phone";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { salonConfig } from "@/config/salon.config";
import styles from "./ServicesBookingCTA.module.css";

export const ServicesBookingCTA: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.glow} />
      <div className={styles.container}>
        <span className={styles.eyebrow}>Experience The Difference</span>
        <h2 className={styles.title}>Book Your Appointment or Academy Admission</h2>
        <p className={styles.desc}>
          Visit {salonConfig.name} at Scheme 78, Vijay Nagar, Indore for unmatched hair treatments,
          relaxing spa therapy, flawless bridal glam, and certified beauty academy courses.
        </p>

        <div className={styles.actions}>
          <PrimaryButton href="/booking" variant="gold">
            <span>Book Appointment Online</span>
            <ArrowForwardIcon fontSize="small" />
          </PrimaryButton>
          <SecondaryButton href={`tel:${salonConfig.contact.phone}`} inverse>
            <PhoneIcon fontSize="small" />
            <span>Call Concierge: {salonConfig.contact.phoneDisplay}</span>
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
};
