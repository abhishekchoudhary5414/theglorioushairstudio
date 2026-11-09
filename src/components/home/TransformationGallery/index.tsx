import React from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { GalleryItem } from "@/types";
import styles from "./TransformationGallery.module.css";

interface TransformationGalleryProps {
  items: GalleryItem[];
}

export const TransformationGallery: React.FC<TransformationGalleryProps> = ({ items }) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Visual Metamorphosis"
          title="Curated Editorial Transformations"
          subtitle="Real artistry created in our styling chairs. From subtle dimensional balayage sweeps to royal heritage bridal trousseaus."
        />

        <div className={styles.grid}>
          {items.slice(0, 5).map((item) => (
            <div key={item.id} className={styles.item}>
              <Image
                src={item.image}
                alt={item.title}
                fill
                sizes="(max-width: 960px) 100vw, 600px"
                className={styles.image}
              />
              <div className={styles.overlay}>
                <span className={styles.tag}>{item.categoryLabel}</span>
                <h3 className={styles.title}>{item.title}</h3>
                <p className={styles.desc}>{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.action}>
          <SecondaryButton href="/gallery">
            Explore Full High-Definition Gallery
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
};

