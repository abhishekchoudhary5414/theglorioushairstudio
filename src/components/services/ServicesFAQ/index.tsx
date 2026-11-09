import React from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import styles from "./ServicesFAQ.module.css";

const FAQS = [
  {
    q: "How is pricing calculated for chemical hair treatments like Keratin, Botox & Nanoplastia?",
    a: "Hair treatment pricing ranges between ₹2,000 to ₹10,000 based on your exact hair length (short, medium, waist-length) and volume/density. You can WhatsApp us a clear photo of your hair for an exact instant quotation."
  },
  {
    q: "Are the academy courses certified?",
    a: "Yes! Every student completing our Hair, Skin, Makeup or Nail Course (₹15,000 per course) receives an authorized professional training certificate along with hands-on live model practical experience."
  },
  {
    q: "Do you use original branded products for Hair Spa & Hair Colour?",
    a: "100% yes. We strictly work with original sealed products from Matrix, L'Oreal, L'Oreal Inoa (Ammonia Free), and Wella. All mixing and application is done transparently right before you."
  },
  {
    q: "Can I book wedding bridal and sangeet makeup appointments in advance?",
    a: "Yes. Bridal makeup starts at ₹5,000, and party/sangeet/haldi makeup is priced at ₹1,000. We recommend booking at least 2–4 weeks in advance to secure your preferred date and time slot."
  }
];

export const ServicesFAQ: React.FC = () => {
  return (
    <section className={styles.section}>
      <div className={styles.container}>
        <SectionHeading
          eyebrow="Common Questions"
          title="Frequently Asked Questions"
          subtitle="Clear answers on appointments, hair length estimates, academy enrollments and branded products."
        />

        <div className={styles.faqList}>
          {FAQS.map((faq, index) => (
            <div key={index} className={styles.faqItem}>
              <h3 className={styles.question}>{faq.q}</h3>
              <p className={styles.answer}>{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
