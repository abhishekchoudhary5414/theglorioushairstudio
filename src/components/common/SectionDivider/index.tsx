import React from "react";
import styles from "./SectionDivider.module.css";

export const SectionDivider: React.FC = () => {
  return (
    <div className={styles.divider}>
      <span className={styles.line} />
      <span className={styles.gem} />
      <span className={styles.line} />
    </div>
  );
};

