import React from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/common/SectionHeading";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { salonConfig } from "@/config/salon.config";
import styles from "./BrandIntroduction.module.css";
import AboutImage from "../../../../public/about/about.png"

export const BrandIntroduction: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <div className={styles.imageGrid}>
          <div className={styles.primaryImgWrapper}>
            <Image
              src={AboutImage}
              alt="Modern salon interior and styling chair in Indore"
              fill
              sizes="(max-width: 960px) 100vw, 520px"
              className={styles.img}
            />
          </div>
        </div>

        <div className={styles.content}>
          <SectionHeading
            align="left"
            eyebrow="About Our Salon"
            title="Indore's Trusted Salon for Men, Women &amp; Brides"
          />

          <p className={styles.lead}>
            &ldquo;We believe good grooming should be relaxing, friendly, and honest with fair prices.&rdquo;
          </p>

          <p className={styles.bodyText}>
            Started in 2018 in Scheme No 78, Vijay Nagar, {salonConfig.name} has grown to become one of
            the most recommended unisex salons in Indore. Our mission is simple: provide top-notch hair and
            skin care using 100% genuine products in a clean, hygienic environment.
          </p>

          <p className={styles.bodyText}>
            Whether you need a quick haircut, a relaxing hair spa after a long week, glowing facials for a family
            function, or complete bridal makeup for your wedding, our friendly team is always ready to take care of you.
          </p>

          <div className={styles.pillarList}>
            <div className={styles.pillarItem}>
              <span className={styles.pillarNumber}>01</span>
              <h3 className={styles.pillarTitle}>100% Genuine Brands</h3>
              <p className={styles.pillarText}>We only use trusted products like L&apos;Oreal, Olaplex, O3+, and MAC.</p>
            </div>
            <div className={styles.pillarItem}>
              <span className={styles.pillarNumber}>02</span>
              <h3 className={styles.pillarTitle}>Clean &amp; Sanitized</h3>
              <p className={styles.pillarText}>Sanitized scissors, fresh disposable towels, and clean air-conditioned private rooms.</p>
            </div>
          </div>

          <div>
            <SecondaryButton href="/about">
              Read More About Us
            </SecondaryButton>
          </div>
        </div>
      </div>
    </section>
  );
};
