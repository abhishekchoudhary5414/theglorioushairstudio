import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { FeaturedExperts } from "@/components/home/FeaturedExperts";
import { BookingCTA } from "@/components/home/BookingCTA";
import { SalonDataService } from "@/services/salon.service";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `Master Stylists & Beauty Artisans | ${salonConfig.name}`,
  description: `Meet our celebrity bridal makeup artists, creative hair directors, and ayurvedic dermatologists with over 10+ years of international runway and salon experience.`
};

export default async function ExpertsPage() {
  const stylists = await SalonDataService.getStylists();

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="The Master Craftspeople"
          title="Artisans of Sovereign Beauty"
          description="Every member of our team has undergone rigorous international training across London, Paris, and Mumbai, bringing true editorial precision to your chair."
          backgroundImage="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1600&auto=format&fit=crop"
        />

        <FeaturedExperts stylists={stylists} />

        <BookingCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

