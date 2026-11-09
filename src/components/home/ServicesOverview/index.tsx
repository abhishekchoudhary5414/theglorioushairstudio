import React from "react";
import Image from "next/image";
import Link from "next/link";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { formatINR } from "@/lib/utils/format";
import { ServiceItem } from "@/types";
import styles from "./ServicesOverview.module.css";

interface ServicesOverviewProps {
  services: ServiceItem[];
}

export const ServicesOverview: React.FC<ServicesOverviewProps> = ({ services }) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Popular Services"
          title="Top Hair &amp; Skin Services in Indore"
          subtitle="Honest pricing, original products, and visible results every single time."
        />

        <div className={styles.grid}>
          {services.map((service) => (
            <div key={service.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 640px) 100vw, 360px"
                  className={styles.cardImg}
                />
                <span className={styles.categoryTag}>{service.categoryName}</span>
              </div>

              <div className={styles.cardContent}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.serviceTitle}>{service.name}</h3>
                  <span className={styles.price}>{formatINR(service.priceINR)}</span>
                </div>

                <div className={styles.duration}>
                  <AccessTimeIcon fontSize="inherit" />
                  <span>{service.durationMinutes} Minutes Session</span>
                </div>

                <p className={styles.description}>{service.shortDescription}</p>

                <div className={styles.cardFooter}>
                  <Link href={`/services/${service.slug}`} className={styles.detailsLink}>
                    <span>View Details</span>
                    <ArrowForwardIcon fontSize="inherit" />
                  </Link>

                  <PrimaryButton href={`/booking?serviceId=${service.id}`} variant="gold">
                    Book Now
                  </PrimaryButton>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.actionWrapper}>
          <SecondaryButton href="/services">
            See All Services &amp; Rate Card
          </SecondaryButton>
        </div>
      </div>
    </section>
  );
};
