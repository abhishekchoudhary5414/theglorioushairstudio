import { Metadata } from "next";
import Image from "next/image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { BookingCTA } from "@/components/home/BookingCTA";
import { salonConfig } from "@/config/salon.config";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: `About Us | ${salonConfig.name} - Best Salon in Vijay Nagar Indore`,
  description: `Learn about ${salonConfig.name}, Indore's favorite unisex salon and beauty studio. Operating in Scheme 78, Vijay Nagar, Indore since 2018.`
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className={styles.page}>
        <PageHero
          eyebrow="About Our Salon"
          title={`Welcome to ${salonConfig.name} Indore`}
          description="A friendly, modern unisex salon and bridal studio dedicated to honest advice, genuine brands, and great customer care."
          backgroundImage="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1600&auto=format&fit=crop"
        />

        <div className={styles.contentSection}>
          {/* Story Grid */}
          <div className={styles.storyGrid}>
            <div className={styles.storyText}>
              <SectionHeading
                align="left"
                eyebrow="Our Story"
                title="Serving Indore with Passion Since 2018"
              />
              <p className={styles.paragraph}>
                We opened our salon in Scheme 78, Vijay Nagar, Indore with one clear goal:
                to give local residents international salon quality with genuine branded products at reasonable prices.
              </p>
              <p className={styles.paragraph}>
                Over the last 8+ years, we have served more than 15,000 happy clients across Indore, Dewas,
                and Ujjain. Our stylists are regularly trained with top brands like L&apos;Oreal, Schwarzkopf, and MAC.
              </p>
              <p className={styles.paragraph}>
                We never compromise on hygiene or product quality. Every hair color tube is opened right in front
                of you, and all equipment is sanitized between clients.
              </p>
            </div>

            <div className={styles.storyImgWrapper}>
              <Image
                src="https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=900&auto=format&fit=crop"
                alt="Hair Styling at Salon in Indore"
                fill
                sizes="(max-width: 960px) 100vw, 500px"
                className={styles.storyImg}
              />
            </div>
          </div>

          {/* Pillars */}
          <div className={styles.valuesSection}>
            <SectionHeading
              eyebrow="Why Clients Trust Us"
              title="Our 4 Commitments to Every Guest"
              subtitle="What makes our salon in Indore special."
            />

            <div className={styles.valuesGrid}>
              <div className={styles.valueCard}>
                <h3 className={styles.valueTitle}>Free Honest Consultation</h3>
                <p className={styles.valueDesc}>
                  We check your hair texture and skin type before suggesting any service. We never push unnecessary expensive treatments.
                </p>
              </div>

              <div className={styles.valueCard}>
                <h3 className={styles.valueTitle}>100% Genuine Products</h3>
                <p className={styles.valueDesc}>
                  We only use sealed, original products from Olaplex, L&apos;Oreal, O3+, Cheryl&apos;s, and Kryolan. No cheap duplicates.
                </p>
              </div>

              <div className={styles.valueCard}>
                <h3 className={styles.valueTitle}>Clean &amp; Private Rooms</h3>
                <p className={styles.valueDesc}>
                  Separate air-conditioned treatment rooms for facials, waxing, and bridal makeup so you feel comfortable and relaxed.
                </p>
              </div>

              <div className={styles.valueCard}>
                <h3 className={styles.valueTitle}>Experienced Friendly Staff</h3>
                <p className={styles.valueDesc}>
                  Polite, certified hair dressers and makeup artists who listen carefully to what you want and give you their full attention.
                </p>
              </div>
            </div>
          </div>

          {/* Hygiene and Safety Standards */}
          <div className={styles.standardsSection}>
            <div className={styles.standardsImgWrapper}>
              <Image
                src="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop"
                alt="Clean Tools and Equipment in Salon"
                fill
                sizes="(max-width: 960px) 100vw, 500px"
                className={styles.storyImg}
              />
            </div>

            <div>
              <SectionHeading
                align="left"
                eyebrow="Hygiene &amp; Safety"
                title="Strict Cleanliness for Your Peace of Mind"
              />
              <p className={styles.paragraph}>
                We maintain high cleanliness standards so you can relax without any worry:
              </p>

              <ul className={styles.checklist}>
                <li className={styles.checkItem}>
                  <CheckCircleIcon className={styles.checkIcon} fontSize="small" />
                  <span>UV and heat sterilization for all metal scissors, combs, and cuticle tools after every single use.</span>
                </li>
                <li className={styles.checkItem}>
                  <CheckCircleIcon className={styles.checkIcon} fontSize="small" />
                  <span>Fresh disposable sheets, towels, and aprons for skin facials and waxing services.</span>
                </li>
                <li className={styles.checkItem}>
                  <CheckCircleIcon className={styles.checkIcon} fontSize="small" />
                  <span>Filtered soft water wash stations that protect your hair from harsh borewell mineral deposits.</span>
                </li>
                <li className={styles.checkItem}>
                  <CheckCircleIcon className={styles.checkIcon} fontSize="small" />
                  <span>Clean, air-conditioned salon floors and sanitized seating chairs after every client.</span>
                </li>
              </ul>

              <div style={{ marginTop: "2.5rem" }}>
                <PrimaryButton href="/booking" variant="gold">
                  Book an Appointment
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>

        <BookingCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
