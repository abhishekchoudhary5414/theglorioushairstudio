import React from "react";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import { salonConfig } from "@/config/salon.config";
import styles from "./AnnouncementBar.module.css";

export const AnnouncementBar: React.FC = () => {
  const marqueeText =
    "Professional Hair & Beauty Salon • Quality service at best price • +91 79875 83445 • Scheme 78, Vijay Nagar, Indore";

  return (
    <aside className={styles.bar}>
      <div className={styles.inner}>
        <div className={styles.message}>
          <AutoAwesomeIcon className={styles.sparkleIcon} fontSize="inherit" />
          <span>Professional Hair &amp; Beauty Salon</span>
          <span className={styles.bullet}>•</span>
          <span className={styles.highlight}>Quality service at best price</span>
        </div>
        <div className={styles.contactLinks}>
          <a href={`tel:${salonConfig.contact.phone}`} className={styles.link}>
            <PhoneIcon className={styles.icon} />
            <span>{salonConfig.contact.phoneDisplay}</span>
          </a>
          <span className={styles.link}>
            <LocationOnIcon className={styles.icon} />
            <span>Scheme 78, Vijay Nagar, Indore</span>
          </span>
        </div>
      </div>

      <div className={styles.mobileMarquee} aria-label="Salon announcement">
        <div className={styles.mobileMarqueeTrack}>
          <span>{marqueeText}</span>
          <span aria-hidden="true">{marqueeText}</span>
        </div>
      </div>
    </aside>
  );
};

