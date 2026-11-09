import React from "react";
import styles from "./SectionHeading.module.css";

interface SectionHeadingProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  titleColor?: string;
}

export const SectionHeading: React.FC<SectionHeadingProps> = ({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
}) => {
  return (
    <div className={`${styles.headingContainer} ${styles[align]} ${className}`}>
      {eyebrow && (
        <div className={styles.eyebrowWrapper}>
          <span className={styles.eyebrowLine} />
          <span className={styles.eyebrow}>{eyebrow}</span>
          {align === "center" && <span className={styles.eyebrowLine} />}
        </div>
      )}
      <h2 className={styles.title}>{title}</h2>
      {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
    </div>
  );
};

