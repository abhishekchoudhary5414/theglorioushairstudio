import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { ContactClient } from "./ContactClient";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `Contact Us & Locations in Indore | ${salonConfig.name}`,
  description: `Visit ${salonConfig.name} at 201, EC 8, RP Avenue, near Uttam bhog, opposite Bombay Hospital Service Road, Pushp Vihar Colony, Scheme 94 Sector EC, Indore. Phone: ${salonConfig.contact.phoneDisplay}. Open 7 days a week from 10 AM to 9 PM.`
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Visit Our Salon & Academy"
          title="Salon Location &amp; Contact in Indore"
          description={`We are located at ${salonConfig.address.fullAddress}. Walk in or call to book an appointment.`}
          backgroundImage="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1600&auto=format&fit=crop"
        />

        <ContactClient />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
