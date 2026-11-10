import type { Metadata } from "next";
import "./globals.css";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  metadataBase: new URL("https://theglorioushairstudio.vercel.app"),
  title: {
    default: `${salonConfig.name} | Best Salon in Indore | Hair Studio & Academy`,
    template: `%s | ${salonConfig.name}`
  },
  description: "Luxury salon in Vijay Nagar, Indore for haircuts, facials, keratin, bridal makeup, and hair spa rituals.",
  openGraph: {
    siteName: salonConfig.name,
    locale: "en_IN",
    type: "website",
    url: "https://theglorioushairstudio.vercel.app",
    title: `${salonConfig.name} | Best Salon in Indore | Hair Studio & Academy`,
    description: "Luxury salon in Vijay Nagar, Indore for haircuts, facials, keratin, bridal makeup, and hair spa rituals.",
    images: [
      {
        url: "https://theglorioushairstudio.vercel.app/images/og-image.png",
        width: 1200,
        height: 630,
        alt: `${salonConfig.name} | Hair Studio & Academy`
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: `${salonConfig.name} | Best Salon in Indore | Hair Studio & Academy`,
    description: "Luxury salon in Vijay Nagar, Indore for haircuts, facials, keratin, bridal makeup, and hair spa rituals.",
    images: ["https://theglorioushairstudio.vercel.app/images/og-image.png"]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["BeautySalon", "HairSalon"],
    "name": salonConfig.name,
    "image": "https://theglorioushairstudio.vercel.app/images/og-image.png",
    "description": salonConfig.description,
    "url": "https://theglorioushairstudio.vercel.app",
    "telephone": salonConfig.contact.phone,
    "address": {
      "@type": "PostalAddress",
      "streetAddress": `${salonConfig.address.line1}, ${salonConfig.address.line2}`,
      "addressLocality": salonConfig.address.city,
      "addressRegion": salonConfig.address.state,
      "postalCode": salonConfig.address.pincode,
      "addressCountry": "IN"
    },
    "priceRange": "₹₹₹",
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
        "opens": "10:00",
        "closes": "20:30"
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400..900;1,400..900&family=Plus+Jakarta+Sans:ital,wght@0,300..800;1,300..800&display=swap"
          rel="stylesheet"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
