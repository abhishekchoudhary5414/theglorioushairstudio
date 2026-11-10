import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `Terms of Service | ${salonConfig.name}`,
  description: `Read the terms of service for ${salonConfig.name}, including booking, cancellations, pricing, and salon policies.`
};

export default function TermsPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Salon policies"
          title="Terms of Service"
          description="Please read these salon terms carefully before booking your appointment or using our services."
          backgroundImage="https://images.unsplash.com/photo-1521590832167-7b6d5f9fede9?q=80&w=1600&auto=format&fit=crop"
        />

        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>
          <div style={{ display: "grid", gap: "1.5rem", lineHeight: 1.8, color: "#f5f1ea", background: "rgba(20,18,15,0.75)", border: "1px solid rgba(206,170,93,0.35)", borderRadius: "24px", padding: "2rem" }}>
            <p>
              By booking or receiving services from {salonConfig.name}, you agree to the terms below. These policies are
              intended to maintain a smooth, professional, and safe experience for all clients and staff.
            </p>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>1. Appointments &amp; arrival</h2>
              <p>
                Appointments are recommended to avoid waiting times and to ensure the stylist or artist assigned to your
                service is available. Please arrive on time. Late arrivals may result in reduced appointment duration or rescheduling.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>2. Cancellations and rescheduling</h2>
              <p>
                We request a prior notice for cancellations or reschedules. Repeat cancellations without notice may lead to
                a fee or a requirement to prepay for future bookings. For bridal and special occasion bookings, stricter policies may apply.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>3. Pricing and service changes</h2>
              <p>
                Service prices are subject to change based on hair length, product usage, styling complexity, and treatment
                requirements. We will inform you before starting additional or extended work when applicable.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>4. Product and skin sensitivity</h2>
              <p>
                We use branded, professional beauty products. If you have allergies, sensitive skin, scalp concerns, or a
                recent chemical treatment, please inform our stylist or beautician before service begins so we can select the safest approach.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>5. Client responsibility</h2>
              <p>
                Clients are responsible for sharing accurate service history, hair goals, and any medical or sensitivity details that may affect treatment outcomes.
                Our team will do its best to recommend suitable services, but final results may vary based on hair texture, condition, and individual factors.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>6. Personal property</h2>
              <p>
                We take reasonable care of personal belongings brought to the salon. We are not responsible for lost, damaged,
                or unattended items. Please keep valuables with you during your appointment.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>7. Website and content</h2>
              <p>
                All website text, visuals, branding, and written material are the property of {salonConfig.name} unless otherwise stated.
                Reproduction or use without written permission is prohibited.
              </p>
            </div>

            <p>
              We may update these terms occasionally. Continued use of our services after any revision means you accept the updated conditions.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
