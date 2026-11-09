import React from "react";
import StarIcon from "@mui/icons-material/Star";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Testimonial } from "@/types";
import styles from "./Testimonials.module.css";

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export const Testimonials: React.FC<TestimonialsProps> = ({ testimonials }) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Words of Adoration"
          title="Echoes From Our Cherished Patrons"
          subtitle="Read genuine impressions shared by brides, professionals, and tastemakers who call our atelier their beauty sanctuary."
        />

        <div className={styles.grid}>
          {testimonials.map((t) => (
            <div key={t.id} className={styles.card}>
              <div className={styles.stars}>
                {[...Array(t.rating)].map((_, i) => (
                  <StarIcon key={i} fontSize="small" />
                ))}
              </div>

              <p className={styles.review}>&ldquo;{t.review}&rdquo;</p>

              <div className={styles.authorBlock}>
                <div>
                  <h4 className={styles.name}>{t.clientName}</h4>
                  <p className={styles.service}>{t.serviceReceived}</p>
                </div>
                <span className={styles.location}>{t.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

