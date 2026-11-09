import { Metadata } from "next";
import Image from "next/image";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WhatsAppIcon from "@mui/icons-material/WhatsApp";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PrimaryButton } from "@/components/common/PrimaryButton";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { BookingCTA } from "@/components/home/BookingCTA";
import { formatINR } from "@/lib/utils/format";
import { salonConfig } from "@/config/salon.config";
import styles from "./bridal.module.css";

export const metadata: Metadata = {
  title: `Best Bridal Makeup in Indore | ${salonConfig.name} - Vijay Nagar`,
  description: `Looking for top bridal makeup artists in Indore? Book 16-hour waterproof HD and Airbrush bridal makeup, saree draping, and pre-bridal packages in Vijay Nagar.`
};

const BRIDAL_PACKAGES = [
  {
    name: "Engagement & Sangeet Makeup",
    subtitle: "Modern Dewy Glow, Hair Curls & Dupatta Setting",
    priceINR: 5999,
    badge: "Sangeet Special",
    isPopular: false,
    features: [
      "HD Glow Makeup with long-lasting primer",
      "Smokey or glitter eye makeup with premium 3D lashes",
      "Trendy open waves, messy buns, or half-braid hairstyling",
      "Designer lehenga dupatta or saree pin-up setting",
      "Private dressing room with proper lighting"
    ]
  },
  {
    name: "Royal HD Bridal Makeup (Wedding Day)",
    subtitle: "Our Most Booked Wedding Bridal Package in Indore",
    priceINR: 12999,
    badge: "Most Popular",
    isPopular: true,
    features: [
      "16-Hour Sweat-proof & Waterproof HD Base (MAC & Huda Beauty)",
      "Matha patti, maang tikka, and heavy jewelry setting",
      "Traditional or modern double-dupatta draping",
      "Bridal floral hair bun with fresh roses or artificial flower accessories",
      "Free touch-up kit with lipstick mini and powder puff",
      "Private bridal dressing suite in Vijay Nagar"
    ]
  },
  {
    name: "Complete 3-Function Bridal Trousseau",
    subtitle: "All-in-One Package for Haldi, Engagement & Wedding Day",
    priceINR: 24999,
    badge: "Complete Package",
    isPopular: false,
    features: [
      "3 Full Makeup Looks (Haldi/Mehendi, Sangeet & Main Wedding)",
      "Pre-Bridal Full Body Rica Waxing, D-Tan Polish & O3+ Facial",
      "Gel Nail Extensions with customized glitter nail art",
      "Free makeup styling for the Mother of the Bride",
      "Senior makeup artist and hair assistant throughout the events"
    ]
  }
];

export default function BridalPage() {
  const bridalWhatsAppUrl = `https://wa.me/${salonConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${salonConfig.name}, I want to book a bridal makeup consultation and check date availability.`
  )}`;

  return (
    <>
      <Header />
      <main className={styles.page}>
        <PageHero
          eyebrow="Bridal Studio Indore"
          title="Bridal Makeup & Wedding Packages in Indore"
          description="Experienced bridal makeup artists in Vijay Nagar. 100% waterproof HD makeup, modern hairstyling, and traditional saree draping."
          backgroundImage="https://images.unsplash.com/photo-1595475207225-428b62bda831?q=80&w=1600&auto=format&fit=crop"
        />

        <div className={styles.contentWrapper}>
          {/* Introduction */}
          <div className={styles.introSection}>
            <div>
              <SectionHeading
                align="left"
                eyebrow="The Bridal Promise"
                title="Your Wedding Day Makeup Made Stress-Free"
              />
              <p className={styles.leadText}>
                We understand how important your wedding day is. Our artists work patiently to give you the
                exact look you have always dreamed of.
              </p>
              <p className={styles.bodyText}>
                With long ceremonies, warm lighting, and emotional moments, your makeup needs to stay fresh
                all night. We use waterproof foundations from MAC, Huda Beauty, Kryolan, and NARS that look natural,
                radiant, and photograph beautifully without turning oily or cakey.
              </p>
              <p className={styles.bodyText}>
                Our Vijay Nagar salon features a dedicated, private bridal room where you can relax, change
                comfortably, and get ready without any rush or crowd.
              </p>
            </div>

            <div className={styles.introImgWrapper}>
              <Image
                src="https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=900&auto=format&fit=crop"
                alt="Beautiful Indian Bride Makeup in Indore"
                fill
                sizes="(max-width: 960px) 100vw, 500px"
                className={styles.introImg}
              />
            </div>
          </div>

          {/* Bridal Packages */}
          <SectionHeading
            eyebrow="Transparent Prices"
            title="Our Bridal Makeup Packages"
            subtitle="Clear, honest pricing with no last-minute hidden charges."
          />

          <div className={styles.packageGrid}>
            {BRIDAL_PACKAGES.map((pkg, i) => (
              <div
                key={i}
                className={`${styles.packageCard} ${pkg.isPopular ? styles.highlightCard : ""}`}
              >
                <span className={styles.packageBadge}>{pkg.badge}</span>
                <h3 className={styles.packageName}>{pkg.name}</h3>
                <p className={styles.packageSubtitle}>{pkg.subtitle}</p>

                <div className={styles.priceBlock}>
                  <span className={styles.packagePrice}>{formatINR(pkg.priceINR)}</span>
                  <span style={{ fontSize: "0.875rem", color: "var(--color-text-muted)" }}>all inclusive</span>
                </div>

                <ul className={styles.packageFeatureList}>
                  {pkg.features.map((feat, fIdx) => (
                    <li key={fIdx} className={styles.packageFeatureItem}>
                      <CheckCircleIcon className={styles.packageCheck} fontSize="small" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>

                <PrimaryButton href="/booking" variant="gold" fullWidth>
                  Book Bridal Slot
                </PrimaryButton>
              </div>
            ))}
          </div>

          {/* Bridal Consultation Banner */}
          <div className={styles.consultationBanner}>
            <div>
              <h3 className={styles.bannerTitle}>Visit Us for a Free Bridal Consultation</h3>
              <p className={styles.bannerDesc}>
                Not sure which makeup look will suit your lehenga? Visit our Vijay Nagar studio, meet our senior
                makeup artist Pooja Verma, and discuss your wedding outfits over a warm cup of coffee.
              </p>
            </div>

            <div className={styles.bannerActions}>
              <a
                href={bridalWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappAction}
              >
                <WhatsAppIcon fontSize="small" />
                <span>Enquire on WhatsApp</span>
              </a>

              <SecondaryButton href="/booking" inverse>
                Book Consultation
              </SecondaryButton>
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
