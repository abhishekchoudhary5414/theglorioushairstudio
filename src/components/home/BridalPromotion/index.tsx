import React from "react";
import Image from "next/image";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { salonConfig } from "@/config/salon.config";
import styles from "./BridalPromotion.module.css";

export const BridalPromotion: React.FC = () => {
  const bridalWhatsAppUrl = `https://wa.me/${salonConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${salonConfig.name}, I want to inquire about bridal makeup packages and check wedding date availability.`
  )}`;

  return (
    <section className={styles.section}>
      <div className={styles.bgWrapper}>
        <div className={styles.bgImg} />
        <div className={styles.gradient} />
      </div>

      <div className={styles.container}>
        <div className={styles.content}>
          <span className={styles.eyebrow}>Bridal Studio Indore</span>
          <h2 className={styles.title}>Look Stunning on Your Wedding Day</h2>
          <p className={styles.desc}>
            Getting married in Indore or nearby cities like Ujjain and Dewas? Our senior bridal artists
            ensure your makeup looks flawless, natural, and stays 100% waterproof through varmala,
            pheras, and photography.
          </p>

          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <CheckCircleOutlineIcon className={styles.featureIcon} />
              <span>Sweat-proof, 16-hour long-lasting HD and Airbrush makeup</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircleOutlineIcon className={styles.featureIcon} />
              <span>Expert lehenga and saree draping with jewelry fixing</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircleOutlineIcon className={styles.featureIcon} />
              <span>Private air-conditioned bridal dressing suite in Vijay Nagar</span>
            </div>
            <div className={styles.featureItem}>
              <CheckCircleOutlineIcon className={styles.featureIcon} />
              <span>Venue service available at hotels and marriage gardens across Indore</span>
            </div>
          </div>

          <div className={styles.actions}>
            <PrimaryButton href="/bridal" variant="gold">
              View Bridal Packages
            </PrimaryButton>
            <a
              href={bridalWhatsAppUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappButton}
            >
              <WhatsAppIcon fontSize="small" />
              <span>Chat on WhatsApp</span>
            </a>
          </div>
        </div>

        <div className={styles.imageShowcase}>
          <div className={styles.portraitWrapper}>
            <Image
              src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=800&auto=format&fit=crop"
              alt="Bridal makeover in our salon dressing room in Indore"
              fill
              sizes="(max-width: 960px) 100vw, 440px"
              className={styles.portraitImg}
            />
          </div>
        </div>
      </div>
    </section>
  );
};
