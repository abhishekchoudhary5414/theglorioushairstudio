"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { formatINR } from "@/lib/utils/format";
import { CATEGORIES_LIST } from "@/lib/constants/salon-data";
import { ServiceItem } from "@/types";
import styles from "./services.module.css";

interface ServicesDirectoryClientProps {
  initialServices: ServiceItem[];
}

export const ServicesDirectoryClient: React.FC<ServicesDirectoryClientProps> = ({ initialServices }) => {
  const [selectedCategory, setSelectedCategory] = useState("all");

  const filteredServices = selectedCategory === "all"
    ? initialServices
    : initialServices.filter((s) => s.category === selectedCategory);

  return (
    <div className={styles.contentWrapper}>
      {/* Category Filter Pills */}
      <nav className={styles.categoryNav} aria-label="Filter Services">
        {CATEGORIES_LIST.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`${styles.categoryBtn} ${selectedCategory === cat.id ? styles.categoryBtnActive : ""}`}
          >
            {cat.name}
          </button>
        ))}
      </nav>

      {/* Services Grid */}
      <div className={styles.grid}>
        {filteredServices.map((service) => (
          <article key={service.id} className={styles.card}>
            <div className={styles.imgWrapper}>
              <Image
                src={service.image}
                alt={service.name}
                fill
                sizes="(max-width: 640px) 100vw, 360px"
                className={styles.serviceImg}
              />
              <span className={styles.badge}>{service.categoryName}</span>
            </div>

            <div className={styles.cardBody}>
              <div className={styles.titleRow}>
                <h2 className={styles.name}>{service.name}</h2>
                <span className={styles.price}>{formatINR(service.priceINR)}</span>
              </div>

              <div className={styles.meta}>
                <AccessTimeIcon fontSize="inherit" />
                <span>{service.durationMinutes} Minutes Experience</span>
              </div>

              <p className={styles.description}>{service.shortDescription}</p>

              <div className={styles.cardFooter}>
                <Link href={`/services/${service.slug}`} className={styles.viewDetails}>
                  <span>Details</span>
                  <ArrowForwardIcon fontSize="inherit" />
                </Link>

                <PrimaryButton href={`/booking?serviceId=${service.id}`} variant="gold">
                  Reserve
                </PrimaryButton>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

