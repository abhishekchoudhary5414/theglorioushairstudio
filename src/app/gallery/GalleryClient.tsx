"use client";

import React, { useState } from "react";
import Image from "next/image";
import CloseIcon from "@mui/icons-material/Close";
import { GalleryItem } from "@/types";
import styles from "./gallery.module.css";

const GALLERY_CATEGORIES = [
  { id: "all", label: "All Works" },
  { id: "hair-transformations", label: "Hair Transformations" },
  { id: "hair-colouring", label: "Hair Colouring" },
  { id: "bridal-makeup", label: "Bridal Makeup" },
  { id: "party-makeup", label: "Party Makeup" },
  { id: "skin-treatments", label: "Skin Treatments" },
  { id: "salon-interiors", label: "Salon Interiors" }
];

interface GalleryClientProps {
  initialItems: GalleryItem[];
}

export const GalleryClient: React.FC<GalleryClientProps> = ({ initialItems }) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [activeItem, setActiveItem] = useState<GalleryItem | null>(null);

  const filteredItems = activeCategory === "all"
    ? initialItems
    : initialItems.filter((i) => i.category === activeCategory);

  return (
    <div className={styles.container}>
      {/* Category Filter */}
      <div className={styles.filters}>
        {GALLERY_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`${styles.filterBtn} ${activeCategory === cat.id ? styles.filterBtnActive : ""}`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className={styles.grid}>
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className={styles.item}
            onClick={() => setActiveItem(item)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") setActiveItem(item);
            }}
          >
            <Image
              src={item.image}
              alt={item.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 340px"
              className={styles.image}
            />
            <div className={styles.overlay}>
              <span className={styles.categoryTag}>{item.categoryLabel}</span>
              <h3 className={styles.itemTitle}>{item.title}</h3>
              <p className={styles.itemDesc}>{item.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {activeItem && (
        <div
          className={styles.modalBackdrop}
          onClick={() => setActiveItem(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeModalBtn}
              onClick={() => setActiveItem(null)}
              aria-label="Close Lightbox"
            >
              <CloseIcon fontSize="large" />
            </button>

            <div className={styles.modalImageWrapper}>
              <Image
                src={activeItem.image}
                alt={activeItem.title}
                fill
                priority
                className={styles.modalImg}
              />
            </div>

            <div className={styles.modalCaption}>
              <h3 className={styles.modalTitle}>{activeItem.title}</h3>
              <p>{activeItem.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

