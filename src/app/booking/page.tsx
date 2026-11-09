import { Metadata } from "next";
import { Suspense } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { SimpleBookingForm } from "@/components/booking/SimpleBookingForm";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `Book Online Appointment | ${salonConfig.name} - Instant Slot`,
  description: `Book your haircut, styling, keratin botox treatment, facial or bridal makeup appointment at ${salonConfig.name} in Scheme 78, Vijay Nagar, Indore. Simple 1-minute booking.`
};

interface BookingPageProps {
  searchParams: Promise<{ serviceId?: string; stylistId?: string }>;
}

async function BookingContent({ searchParams }: BookingPageProps) {
  const { serviceId, stylistId } = await searchParams;

  return (
    <div style={{ padding: "4rem 1.5rem", backgroundColor: "var(--color-background)" }}>
      <SimpleBookingForm
        preselectedServiceId={serviceId}
        preselectedStylistId={stylistId}
      />
    </div>
  );
}

export default function BookingPage(props: BookingPageProps) {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Instant Slot Reservation"
          title="Book Your Salon Appointment"
          description="Select your service, choose your preferred date and time, and confirm your slot in under 1 minute. No advance payment required."
          backgroundImage="https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1600&auto=format&fit=crop"
        />

        <Suspense
          fallback={
            <div style={{ textAlign: "center", padding: "5rem 1rem", color: "var(--color-secondary)" }}>
              Loading Booking Suite...
            </div>
          }
        >
          <BookingContent searchParams={props.searchParams} />
        </Suspense>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
