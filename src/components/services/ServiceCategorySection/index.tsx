"use client";

import React from "react";
import { motion } from "framer-motion";
import { ServiceCategorySectionData } from "@/data/services";
import { ServicePricingCard } from "@/components/services/ServicePricingCard";
import { ServiceNote } from "@/components/services/ServiceNote";
import { ServiceCTA } from "@/components/services/ServiceCTA";
import styles from "./ServiceCategorySection.module.css";

interface ServiceCategorySectionProps {
  category: ServiceCategorySectionData;
  isAlt?: boolean;
}

export const ServiceCategorySection: React.FC<ServiceCategorySectionProps> = ({
  category,
  isAlt = false,
}) => {
  return (
    <section
      id={category.id}
      className={`${styles.section} ${isAlt ? styles.sectionAlt : ""}`}
    >
      <div className={styles.container}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className={styles.categoryHeader}
        >
          <div className={styles.eyebrowWrapper}>
            <span className={styles.eyebrowLine} />
            <span className={styles.eyebrow}>{category.eyebrow}</span>
          </div>
          <h2 className={styles.title}>{category.title}</h2>
          <p className={styles.description}>{category.description}</p>
        </motion.div>

        {category.highlightedNote && (
          <ServiceNote note={category.highlightedNote} />
        )}

        {/* Display all subgroups as rich cards */}
        {category.subGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: "2.5rem" }}>
            {group.groupTitle && (
              <h3
                style={{
                  fontFamily: "var(--font-heading)",
                  fontSize: "1.35rem",
                  color: "var(--color-primary)",
                  marginBottom: "1.25rem",
                  paddingBottom: "0.5rem",
                  borderBottom: "1px solid var(--color-border-subtle)",
                }}
              >
                {group.groupTitle}
              </h3>
            )}

            <div className={styles.cardGrid}>
              {group.items.map((item) => (
                <ServicePricingCard
                  key={item.id}
                  item={item}
                  featured={item.badge !== undefined}
                />
              ))}
            </div>

            {group.additionalOptions && (
              <div
                style={{
                  backgroundColor: "var(--color-surface-subtle)",
                  border: "1px solid var(--color-border)",
                  borderRadius: "var(--radius-xs)",
                  padding: "1.25rem 1.5rem",
                  marginTop: "1rem",
                }}
              >
                <h4
                  style={{
                    fontSize: "0.85rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--color-secondary)",
                    marginBottom: "0.75rem",
                  }}
                >
                  {group.additionalOptions.title}
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: "0.75rem",
                  }}
                >
                  {group.additionalOptions.items.map((addon, aIdx) => (
                    <div
                      key={aIdx}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        backgroundColor: "var(--color-surface)",
                        border: "1px solid var(--color-border-subtle)",
                        padding: "0.6rem 0.85rem",
                        borderRadius: "var(--radius-xs)",
                        fontSize: "0.8125rem",
                        color: "var(--color-text-primary)",
                      }}
                    >
                      <span>{addon.label}</span>
                      <span style={{ fontWeight: 600, color: "var(--color-secondary)" }}>
                        {addon.price}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        <ServiceCTA
          ctaText={category.ctaText || "Book This Service"}
          ctaHref={category.ctaHref || "/booking"}
          ctaType={category.ctaType || "booking"}
          heading={
            category.id === "academy-courses"
              ? "Ready to join our next training batch?"
              : "Experience this service with our experts"
          }
          subtext={
            category.id === "academy-courses"
              ? "Call or visit our academy at Vijay Nagar, Indore for syllabus, fees & registration."
              : "Reserve your appointment online, call our desk, or message on WhatsApp."
          }
        />
      </div>
    </section>
  );
};
