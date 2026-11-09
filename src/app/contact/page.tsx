import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { ContactClient } from "./ContactClient";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `Contact Us & Locations in Indore | ${salonConfig.name}`,
  description: `Visit ${salonConfig.name} in Scheme 78, Vijay Nagar, Indore. Phone number: ${salonConfig.contact.phoneDisplay}. Open 7 days a week from 10 AM to 9 PM.`
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Visit Our Salons"
          title="Salon Locations &amp; Contact in Indore"
          description="We are located at Scheme No 78, Yashraj Complex, Sector C, Vijay Nagar, Indore. Walk in or call to book an appointment."
          backgroundImage="https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1600&auto=format&fit=crop"
        />

        <ContactClient />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
