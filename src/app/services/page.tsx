import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { CompleteServicesExperience } from "./CompleteServicesExperience";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `Our Services & Pricing Rate Card | ${salonConfig.name} and Academy`,
  description: `Discover professional hair styling, keratin botox treatments, bridal makeup, skin cleanups, hair spa, and certified academy courses at ${salonConfig.name} in Indore. Transparent INR pricing.`,
  keywords: [
    "salon services Indore",
    "hair course Indore",
    "makeup course Indore",
    "keratin treatment price Indore",
    "botox hair treatment Indore",
    "bridal makeup price Indore",
    "hair spa rate card",
    salonConfig.name
  ],
  openGraph: {
    title: `Services & Pricing | ${salonConfig.name} and Academy`,
    description: `Discover professional beauty, hair, makeup and academy services at ${salonConfig.name} and Academy.`,
    images: [{ url: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop" }],
    type: "website"
  }
};

export default function ServicesPage() {
  return (
    <>
      <Header />
      <main>
        <CompleteServicesExperience />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
