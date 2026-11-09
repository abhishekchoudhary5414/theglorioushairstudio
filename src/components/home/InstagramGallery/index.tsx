import React from "react";
import Image from "next/image";
import InstagramIcon from "@mui/icons-material/Instagram";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { salonConfig } from "@/config/salon.config";
import styles from "./InstagramGallery.module.css";

const INSTA_IMAGES = [
  "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1595475207225-428b62bda831?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=600&auto=format&fit=crop"
];

export const InstagramGallery: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.headerRow}>
          <div className={styles.titleArea}>
            <span className={styles.eyebrow}>Follow Our Atelier Journey</span>
            <span className={styles.handle}>@theglorioushairstudio</span>
          </div>

          <SecondaryButton href={salonConfig.socials.instagram}>
            <InstagramIcon fontSize="small" />
            <span>Follow on Instagram</span>
          </SecondaryButton>
        </div>

        <div className={styles.grid}>
          {INSTA_IMAGES.map((img, i) => (
            <div key={i} className={styles.item}>
              <Image
                src={img}
                alt="Salon beauty treatment and styling moment from our studio"
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className={styles.image}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

