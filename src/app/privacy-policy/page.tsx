import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { PageHero } from "@/components/common/PageHero";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `Privacy Policy | ${salonConfig.name}`,
  description: `Read the privacy policy for ${salonConfig.name}, including how personal information is collected, used, and protected.`
};

export default function PrivacyPolicyPage() {
  return (
    <>
      <Header />
      <main>
        <PageHero
          eyebrow="Your privacy matters"
          title="Privacy Policy"
          description="We respect your privacy and handle your personal information with care, transparency, and security."
          backgroundImage="https://images.unsplash.com/photo-1521590832167-7b6d5f9fede9?q=80&w=1600&auto=format&fit=crop"
        />

        <section style={{ maxWidth: "1100px", margin: "0 auto", padding: "4rem 1.5rem 6rem" }}>
          <div style={{ display: "grid", gap: "1.5rem", lineHeight: 1.8, color: "#f5f1ea", background: "rgba(20,18,15,0.75)", border: "1px solid rgba(206,170,93,0.35)", borderRadius: "24px", padding: "2rem" }}>
            <p>
              At {salonConfig.name}, we value your trust and are committed to protecting the personal information
              you share with us when you book an appointment, contact our team, or visit our salon.
            </p>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>1. Information we collect</h2>
              <p>
                We may collect your name, phone number, email address, appointment preferences, service history,
                and any special notes relevant to your beauty requirements. We may also retain information submitted
                through contact forms, WhatsApp messages, or face-to-face consultations.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>2. How we use your information</h2>
              <p>
                Your information helps us confirm bookings, provide personalized recommendations, respond to inquiries,
                improve service quality, and send operational updates related to your appointment or salon experience.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>3. Sharing of information</h2>
              <p>
                We do not sell your personal data. We may share limited information with trusted service providers who
                help us manage bookings, communications, or cloud infrastructure, as required to operate our business
                efficiently and securely.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>4. Security</h2>
              <p>
                We use reasonable technical and organizational safeguards to protect the personal information we hold,
                including secure storage and access control measures. However, no internet transmission or electronic
                storage is completely risk-free, and we cannot guarantee absolute security.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>5. Cookies and analytics</h2>
              <p>
                Our website may use cookies or analytics tools to understand user activity and improve website performance.
                You can disable cookies in your browser settings if you prefer, although some site features may not work as intended.
              </p>
            </div>

            <div>
              <h2 style={{ fontSize: "1.4rem", marginBottom: "0.75rem", color: "#d8b66e" }}>6. Your rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data, subject to applicable legal
                requirements and legitimate business needs. If you want to contact us about privacy, please use the contact
                details available on our website.
              </p>
            </div>

            <p>
              This privacy policy may be updated from time to time to reflect changes in our practices or legal requirements.
              Continued use of our website or salon services after updates indicates your acceptance of the revised policy.
            </p>
          </div>
        </section>
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
