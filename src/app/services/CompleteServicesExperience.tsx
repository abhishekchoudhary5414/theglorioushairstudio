"use client";

import React, { useState, useEffect } from "react";
import { SALON_SERVICES_CATEGORIES } from "@/data/services";
import { ServicesHero } from "@/components/services/ServicesHero";
import { ServiceCategoryNavigation } from "@/components/services/ServiceCategoryNavigation";
import { ServiceCategorySection } from "@/components/services/ServiceCategorySection";
import { ServicesFAQ } from "@/components/services/ServicesFAQ";
import { ServicesBookingCTA } from "@/components/services/ServicesBookingCTA";

interface CompleteServicesExperienceProps {
  selectedCategorySlug?: string | null;
}

export const CompleteServicesExperience: React.FC<CompleteServicesExperienceProps> = ({
  selectedCategorySlug,
}) => {
  const selectedCategory =
    typeof selectedCategorySlug === "string" && selectedCategorySlug
      ? SALON_SERVICES_CATEGORIES.find(
          (category) =>
            category.slug === selectedCategorySlug || category.id === selectedCategorySlug
        )
      : undefined;

  const categoriesToRender = selectedCategory
    ? [selectedCategory]
    : SALON_SERVICES_CATEGORIES;

  const [scrollActiveCategory, setScrollActiveCategory] = useState<string>(
    selectedCategory?.id || SALON_SERVICES_CATEGORIES[0].id
  );

  const activeCategory = selectedCategory?.id || scrollActiveCategory;

  const handleSelectCategory = (categoryId: string) => {
    const category = SALON_SERVICES_CATEGORIES.find((item) => item.id === categoryId);
    const nextUrl = category ? `/services/${category.slug}` : "/services";

    setScrollActiveCategory(categoryId);
    window.history.pushState({}, "", nextUrl);

    const element = document.getElementById(categoryId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    if (!selectedCategory) return;

    const element = document.getElementById(selectedCategory.id);
    if (element) {
      requestAnimationFrame(() => {
        element.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [selectedCategory]);

  useEffect(() => {
    if (selectedCategory) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;

      for (let i = SALON_SERVICES_CATEGORIES.length - 1; i >= 0; i--) {
        const cat = SALON_SERVICES_CATEGORIES[i];
        const el = document.getElementById(cat.id);
        if (el && el.offsetTop <= scrollPosition) {
          setScrollActiveCategory(cat.id);
          break;
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [selectedCategory]);

  return (
    <>
      <ServicesHero
        title={selectedCategory ? selectedCategory.title : "Our Services"}
        subtitle={
          selectedCategory
            ? selectedCategory.description
            : "All services in separate sections with instant WhatsApp, Call, and Online Booking. No hidden costs."
        }
        onExploreClick={() => handleSelectCategory(selectedCategory?.id || SALON_SERVICES_CATEGORIES[0].id)}
      />

      <ServiceCategoryNavigation
        categories={SALON_SERVICES_CATEGORIES}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {categoriesToRender.map((cat, index) => (
        <ServiceCategorySection
          key={cat.id}
          category={cat}
          isAlt={index % 2 === 1}
        />
      ))}

      <ServicesFAQ />
      <ServicesBookingCTA />
    </>
  );
};
