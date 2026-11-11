import { notFound } from "next/navigation";
import Image from "next/image";
import { Suspense } from "react";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlineOutlined";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { SecondaryButton } from "@/components/common/SecondaryButton";
import { BookingCTA } from "@/components/home/BookingCTA";
import { ServiceDetailActions } from "./ServiceDetailActions";
import { SalonDataService } from "@/services/salon.service";
import { formatINR } from "@/lib/utils/format";
import { salonConfig } from "@/config/salon.config";
import { SERVICES_DATA } from "@/lib/constants/salon-data";
import { SALON_SERVICES_CATEGORIES } from "@/data/services";
import { CompleteServicesExperience } from "../CompleteServicesExperience";
import styles from "./service-details.module.css";

interface ServiceDetailsPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  const categoryItemSlugs = Array.from(
    new Set(
      SALON_SERVICES_CATEGORIES.flatMap((category) =>
        category.subGroups.flatMap((group) => group.items.map((item) => item.slug))
      )
    )
  );

  return [
    ...SERVICES_DATA.map((service) => ({ slug: service.slug })),
    ...SALON_SERVICES_CATEGORIES.map((category) => ({ slug: category.slug })),
    ...categoryItemSlugs.map((slug) => ({ slug })),
  ];
}

export async function generateMetadata({ params }: ServiceDetailsPageProps) {
  const { slug } = await params;
  const category = SALON_SERVICES_CATEGORIES.find(
    (item) => item.slug === slug || item.id === slug
  );

  if (category) {
    return {
      title: `${category.title} | ${salonConfig.name}`,
      description: category.description,
    };
  }

  const service = await SalonDataService.getServiceBySlug(slug);

  if (!service) {
    return { title: `Service Not Found | ${salonConfig.name}` };
  }

  return {
    title: `${service.name} in Indore | ${salonConfig.name}`,
    description: `${service.shortDescription} Starting at ${formatINR(service.priceINR)}. Duration: ${service.durationMinutes} mins.`,
    openGraph: {
      title: `${service.name} | ${salonConfig.name}`,
      description: service.shortDescription,
      images: [{ url: service.image }],
    },
  };
}

async function ServiceRouteContent({ params }: ServiceDetailsPageProps) {
  const { slug } = await params;
  const category = SALON_SERVICES_CATEGORIES.find(
    (item) => item.slug === slug || item.id === slug
  );

  if (category) {
    return (
      <>
        <Header />
        <main>
          <CompleteServicesExperience selectedCategorySlug={category.slug} />
        </main>
        <Footer />
        <FloatingWhatsApp />
      </>
    );
  }

  const service = await SalonDataService.getServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const whatsappUrl = `https://wa.me/${salonConfig.contact.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
    `Hello ${salonConfig.name}, I want to enquire about ${service.name} (${service.priceDisplay || formatINR(service.priceINR)}).`
  )}`;

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow={service.categoryName}
          title={service.name}
          description={service.tagline}
          backgroundImage={service.image}
        />

        <div className={styles.container}>
          <div className={styles.detailsGrid}>
            <div className={styles.mainInfo}>
              <span className={styles.categoryTag}>{service.categoryName}</span>
              <h1 className={styles.title}>{service.name}</h1>
              <p className={styles.tagline}>{service.tagline}</p>
              <p className={styles.fullDesc}>{service.fullDescription}</p>

              <div className={styles.sectionBlock}>
                <h2 className={styles.blockTitle}>Key Benefits & Transformation</h2>
                <ul className={styles.benefitsList}>
                  {service.benefits.map((benefit, i) => (
                    <li key={i} className={styles.benefitItem}>
                      <CheckCircleOutlineIcon className={styles.benefitIcon} fontSize="small" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className={styles.sectionBlock}>
                <h2 className={styles.blockTitle}>The Ritual Architecture & Process</h2>
                <div className={styles.processTimeline}>
                  {service.process.map((p) => (
                    <div key={p.step} className={styles.processStep}>
                      <span className={styles.stepNumber}>0{p.step}</span>
                      <div className={styles.stepDetails}>
                        <h3 className={styles.stepTitle}>{p.title}</h3>
                        <p className={styles.stepDesc}>{p.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.sectionBlock}>
                <h2 className={styles.blockTitle}>Frequently Asked Questions</h2>
                <div className={styles.faqBlock}>
                  {service.faqs.map((faq, i) => (
                    <div key={i} className={styles.faqItem}>
                      <h3 className={styles.faqQuestion}>{faq.question}</h3>
                      <p className={styles.faqAnswer}>{faq.answer}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <aside className={styles.sidebar}>
              <div className={styles.bookingCard}>
                <div className={styles.priceWrapper}>
                  <span className={styles.currentPrice}>{formatINR(service.priceINR)}</span>
                  {service.originalPriceINR && (
                    <span className={styles.originalPrice}>{formatINR(service.originalPriceINR)}</span>
                  )}
                </div>
                <span className={styles.taxesNote}>Transparent pricing. Inclusive of taxes.</span>

                <div className={styles.metaRow}>
                  <AccessTimeIcon className={styles.metaIcon} fontSize="small" />
                  <span>Duration: {service.durationMinutes} Minutes</span>
                </div>

                <div className={styles.metaRow} style={{ marginTop: "-1rem" }}>
                  <VerifiedUserIcon className={styles.metaIcon} fontSize="small" />
                  <span>Hospital-grade sterilization assured</span>
                </div>

                <ServiceDetailActions
                  whatsappUrl={whatsappUrl}
                  phone={salonConfig.contact.phone}
                  phoneDisplay={salonConfig.contact.phoneDisplay}
                  serviceId={service.id}
                  serviceName={service.name}
                />

                <div style={{ marginTop: "0.5rem" }}>
                  <SecondaryButton href="/services" fullWidth>
                    Back to All Services
                  </SecondaryButton>
                </div>
              </div>

              <div className={styles.cardImgWrapper}>
                <Image
                  src={service.image}
                  alt={service.name}
                  fill
                  sizes="(max-width: 960px) 100vw, 380px"
                  className={styles.sidebarImg}
                />
              </div>
            </aside>
          </div>
        </div>

        <BookingCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

export default function ServiceRoutePage(props: ServiceDetailsPageProps) {
  return (
    <Suspense fallback={<div style={{ minHeight: "60vh" }} />}>
      <ServiceRouteContent {...props} />
    </Suspense>
  );
}
