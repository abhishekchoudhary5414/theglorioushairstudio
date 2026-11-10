import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { FloatingWhatsApp } from "@/components/layout/FloatingWhatsApp";
import { Hero } from "@/components/home/Hero";
import { BrandIntroduction } from "@/components/home/BrandIntroduction";
import { ServicesOverview } from "@/components/home/ServicesOverview";
import { HomeServicesExperience } from "@/components/home/HomeServicesExperience";
import { WhyChooseUs } from "@/components/home/WhyChooseUs";
import { FeaturedExperts } from "@/components/home/FeaturedExperts";
import { TransformationGallery } from "@/components/home/TransformationGallery";
import { BridalPromotion } from "@/components/home/BridalPromotion";
import { Testimonials } from "@/components/home/Testimonials";
import { SpecialOffers } from "@/components/home/SpecialOffers";
import { InstagramGallery } from "@/components/home/InstagramGallery";
import { BookingCTA } from "@/components/home/BookingCTA";
import { SectionDivider } from "@/components/common/SectionDivider";
import { SalonDataService } from "@/services/salon.service";
import { salonConfig } from "@/config/salon.config";

export const metadata: Metadata = {
  title: `${salonConfig.name} | Professional Hair & Beauty Salon in Indore`,
  description: `${salonConfig.description} Located at Scheme 78, Yashraj Complex, Sector C, Vijay Nagar, Indore. Book appointments for haircut, styling, keratin, facials, and bridal makeup.`,
  keywords: [
    "best salon in Indore",
    "unisex salon Vijay Nagar Indore",
    "hair studio Scheme 78 Indore",
    "bridal makeup artist in Indore",
    "haircut and styling Indore",
    "keratin treatment price Indore",
    "O3+ facial in Indore",
    salonConfig.name
  ],
  openGraph: {
    title: `${salonConfig.name} | Best Unisex Salon in Indore`,
    description: salonConfig.description,
    images: [{ url: "/images/og-image.png", width: 1200, height: 630 }],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: `${salonConfig.name} | Best Unisex Salon in Indore`,
    description: salonConfig.description,
    images: ["/images/og-image.png"]
  }
};

export default async function HomePage() {
  const [featuredServices, stylists, galleryItems, testimonials, offers] = await Promise.all([
    SalonDataService.getFeaturedServices(),
    SalonDataService.getStylists(),
    SalonDataService.getGalleryItems(),
    SalonDataService.getTestimonials(),
    SalonDataService.getOffers()
  ]);

  return (
    <>
      <Header />
      <main>
        {/* 1. Hero */}
        <Hero />

        {/* 2. Brand Introduction */}
        <BrandIntroduction />

        {/* 3. Complete Services & Pricing Rate Card Experience */}
        <HomeServicesExperience />

        <SectionDivider />

        {/* 4. Featured Spotlight Services */}
        <ServicesOverview services={featuredServices} />

        <SectionDivider />

        {/* 5. Why Choose Us */}
        <WhyChooseUs />

        {/* 5. Meet Our Beauty Experts */}
        <FeaturedExperts stylists={stylists} />

        {/* 6. Before-and-After Transformations */}
        <TransformationGallery items={galleryItems} />

        {/* 7. Bridal Beauty Promotion */}
        <BridalPromotion />

        {/* 8. Customer Testimonials */}
        <Testimonials testimonials={testimonials} />

        {/* 9. Special Offers */}
        <SpecialOffers offers={offers} />

        {/* 10. Instagram Gallery */}
        <InstagramGallery />

        {/* 11. Final Booking CTA */}
        <BookingCTA />
      </main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
