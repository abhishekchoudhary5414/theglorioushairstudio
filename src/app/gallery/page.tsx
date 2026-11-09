import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { BookingCTA } from "@/components/home/BookingCTA";
import { GalleryClient } from "./GalleryClient";
import { SalonDataService } from "@/services/salon.service";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `Transformation Gallery | ${salonConfig.name} - Hair & Bridal Portfolio`,
  description: `Browse our high-definition portfolio of bridal transformations, caramel balayage sweeps, Russian nail art, and luxury salon interior architecture.`
};

export default async function GalleryPage() {
  const galleryItems = await SalonDataService.getGalleryItems();

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Visual Portfolio"
          title="The Metamorphosis Gallery"
          description="Explore our living archive of bridal artistry, color alchemy, and bespoke styling captured inside our private atelier suites."
          backgroundImage="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1600&auto=format&fit=crop"
        />

        <GalleryClient initialItems={galleryItems} />

        <BookingCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

