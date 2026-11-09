import React from "react";
import styles from "./PageHero.module.css";

interface PageHeroProps {
  eyebrow?: string;
  title: string;
  description?: string;
  backgroundImage?: string;
}

export const PageHero: React.FC<PageHeroProps> = ({
  eyebrow,
  title,
  description,
  backgroundImage = "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1600&auto=format&fit=crop",
}) => {
  return (
    <section className={styles.heroWrapper}>
      <div
        className={styles.heroBackground}
        style={{ backgroundImage: `url('${backgroundImage}')` }}
      />
      <div className={styles.glowOrb} />
      <div className={styles.overlay} />
      <div className={styles.content}>
        {eyebrow && <span className={styles.eyebrow}>{eyebrow}</span>}
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </section>
  );
};
