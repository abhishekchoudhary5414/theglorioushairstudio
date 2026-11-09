import React from "react";
import Image from "next/image";
import StarIcon from "@mui/icons-material/Star";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { StylistExpert } from "@/types";
import styles from "./FeaturedExperts.module.css";

interface FeaturedExpertsProps {
  stylists: StylistExpert[];
  limit?: number;
}

export const FeaturedExperts: React.FC<FeaturedExpertsProps> = ({ stylists, limit = 3 }) => {
  const displayedStylists = limit ? stylists.slice(0, limit) : stylists;
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="The Master Craftspeople"
          title="Meet Our Internationally Certified Stylists"
          subtitle="Trained in Paris, London, and Mumbai, bringing visionary editorial techniques directly to your styling chair."
        />

        <div className={styles.grid}>
          {displayedStylists.map((expert) => (
            <div key={expert.id} className={styles.card}>
              <div className={styles.imageWrapper}>
                <Image
                  src={expert.image}
                  alt={expert.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 360px"
                  className={styles.stylistImg}
                />
                <span className={styles.experienceBadge}>
                  {expert.experienceYears}+ Years Craft
                </span>
              </div>

              <div className={styles.cardBody}>
                <h3 className={styles.name}>{expert.name}</h3>
                <span className={styles.designation}>{expert.designation}</span>
                <p className={styles.bio}>{expert.bio}</p>

                <div className={styles.specs}>
                  {expert.specialization.slice(0, 3).map((s, idx) => (
                    <span key={idx} className={styles.specTag}>
                      {s}
                    </span>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <div className={styles.rating}>
                    <StarIcon className={styles.ratingIcon} />
                    <span>{expert.rating}</span>
                    <span className={styles.reviewCount}>({expert.reviewCount})</span>
                  </div>

                  <PrimaryButton href={`/booking?stylistId=${expert.id}`} variant="gold">
                    Book Session
                  </PrimaryButton>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

