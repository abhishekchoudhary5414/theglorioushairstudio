"use client";

import React, { useState, useEffect } from "react";
import { SALON_SERVICES_CATEGORIES } from "@/data/services";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServiceCategoryNavigation } from "@/components/services/ServiceCategoryNavigation";
import { ServiceCategorySection } from "@/components/services/ServiceCategorySection";
import { ServicesFAQ } from "@/components/services/ServicesFAQ";
import { ServicesBookingCTA } from "@/components/services/ServicesBookingCTA";

export const CompleteServicesExperience: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>(
    SALON_SERVICES_CATEGORIES[0].id
  );

  const handleSelectCategory = (categoryId: string) => {
    setActiveCategory(categoryId);
    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Update active category on user scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = SALON_SERVICES_CATEGORIES.length - 1; i >= 0; i--) {
        const cat = SALON_SERVICES_CATEGORIES[i];
        const el = document.getElementById(cat.id);
        if (el && el.offsetTop <= scrollPosition) {
          setActiveCategory(cat.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* 1. Hero */}
      <ServicesHero
        title="Our Services"
        subtitle="Discover professional beauty, hair, makeup and academy services at The Glorious Hair Studio and Academy."
        onExploreClick={() => handleSelectCategory(SALON_SERVICES_CATEGORIES[0].id)}
      />

      {/* 2. Category Navigation */}
      <ServiceCategoryNavigation
        categories={SALON_SERVICES_CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 3. All 8 Service Categories */}
      {SALON_SERVICES_CATEGORIES.map((cat, index) => (
        <ServiceCategorySection
          key={cat.id}
          category={cat}
          isAlt={index % 2 === 1}
        />
      ))}

      {/* 4. Common FAQs */}
      <ServicesFAQ />

      {/* 5. Booking CTA */}
      <ServicesBookingCTA />
    </>
  );
};
