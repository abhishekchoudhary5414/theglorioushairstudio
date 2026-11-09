import React from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { formatINR } from "@/lib/utils/format";
import { OfferItem } from "@/types";
import styles from "./SpecialOffers.module.css";

interface SpecialOffersProps {
  offers: OfferItem[];
}

export const SpecialOffers: React.FC<SpecialOffersProps> = ({ offers }) => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Privilege Opportunities"
          title="Seasonal Beauty Invocations & Memberships"
          subtitle="Exclusive limited-engagement offers crafted for weddings, festive galas, and first-time guests."
        />

        <div className={styles.grid}>
          {offers.map((offer) => (
            <div key={offer.id} className={styles.card}>
              <span className={styles.badge}>{offer.badge}</span>
              <h3 className={styles.title}>{offer.title}</h3>
              <p className={styles.subtitle}>{offer.subtitle}</p>

              {offer.offerPriceINR && (
                <div className={styles.pricing}>
                  <span className={styles.offerPrice}>{formatINR(offer.offerPriceINR)}</span>
                  {offer.originalPriceINR && (
                    <span className={styles.originalPrice}>{formatINR(offer.originalPriceINR)}</span>
                  )}
                </div>
              )}

              <p className={styles.desc}>{offer.discountDescription}</p>

              <ul className={styles.includedList}>
                {offer.includedServices.map((inc, i) => (
                  <li key={i} className={styles.includedItem}>
                    <span className={styles.bullet} />
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.cardFooter}>
                <PrimaryButton href="/booking" variant="gold" fullWidth>
                  Claim Offer & Book
                </PrimaryButton>
                <span className={styles.validity}>{offer.validTill}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

