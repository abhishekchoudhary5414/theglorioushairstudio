import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { SpecialOffers } from "@/components/home/SpecialOffers";
import { BookingCTA } from "@/components/home/BookingCTA";
import { SalonDataService } from "@/services/salon.service";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `Special Offers & Privileges | ${salonConfig.name}`,
  description: `Enjoy seasonal privileges, first-visit salon discounts, festive packages, and bridal trousseau benefits at ${salonConfig.name}.`
};

export default async function OffersPage() {
  const offers = await SalonDataService.getOffers();

  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Privilege Invitations"
          title="Seasonal Offers & Bespoke Packages"
          description="Enjoy curated privileges for first-time guests, festive celebrations, and comprehensive bridal packages."
          backgroundImage="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1600&auto=format&fit=crop"
        />

        <SpecialOffers offers={offers} />

        <BookingCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}

