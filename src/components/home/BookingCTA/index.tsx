import React from "react";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import PhoneIcon from "@mui/icons-material/Phone";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { salonConfig } from "@/config/salon.config";
import styles from "./BookingCTA.module.css";

export const BookingCTA: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.glow} />
      <div className={styles.container}>
        <span className={styles.eyebrow}>Ready to Look Your Best?</span>
        <h2 className={styles.title}>Book Your Salon Appointment in Indore Today</h2>
        <p className={styles.desc}>
          Visit our modern salon at Scheme 78, Vijay Nagar, Indore. Enjoy relaxing hair, skin, and nail treatments
          done by certified professionals with 100% genuine products.
        </p>

        <div className={styles.actions}>
          <PrimaryButton href="/booking" variant="gold">
            <span>Book Appointment Online</span>
            <ArrowForwardIcon fontSize="small" />
          </PrimaryButton>
          <SecondaryButton href={`tel:${salonConfig.contact.phone}`} inverse>
            <PhoneIcon fontSize="small" />
            <span>Call {salonConfig.contact.phoneDisplay}</span>
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
};
