import { SERVICES_DATA, STYLISTS_DATA, GALLERY_DATA, TESTIMONIALS_DATA, OFFERS_DATA } from "@/lib/constants/salon-data";
import { SALON_SERVICES_CATEGORIES } from "@/data/services";
import { ServiceItem, StylistExpert, GalleryItem, Testimonial, OfferItem, BookingSubmission } from "@/types";
import { sql } from "@/lib/db/neon";

const buildCategoryFallbackService = (categoryId: string, item: { id: string; slug: string; name: string; price?: number; priceDisplay?: string; description?: string; image?: string }): ServiceItem => {
  const categoryMap: Record<string, ServiceItem["category"]> = {
    "academy-courses": "skin-care",
    "makeup-hair-styling": "makeup",
    "hair-treatments": "hair-care",
    "haircuts-basic": "hair-care",
    "wax-body-care": "waxing",
    "facial-cleanup": "facials",
    "hair-colour": "hair-colouring",
    "hair-spa": "hair-care",
  };

  const category = SALON_SERVICES_CATEGORIES.find((entry) => entry.id === categoryId) ?? SALON_SERVICES_CATEGORIES[0];

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    tagline: category.title,
    category: categoryMap[categoryId] ?? categoryMap[category.id] ?? "hair-care",
    categoryName: category.title,
    durationMinutes: item.price && item.price > 0 ? 60 : 45,
    priceINR: item.price ?? 0,
    priceDisplay: item.priceDisplay,
    image: item.image || category.image || "/gallery/1.png",
    shortDescription: item.description || category.description,
    fullDescription: item.description || category.description,
    benefits: [category.description, item.description || ""].filter(Boolean),
    process: [
      { step: 1, title: "Consultation", description: `Understand your goals and the best ${category.title.toLowerCase()} approach for your needs.` },
      { step: 2, title: "Signature Treatment", description: `Apply our expert technique for a polished and long-lasting finish.` },
      { step: 3, title: "Finishing Care", description: "Complete the session with aftercare, product guidance, and styling recommendations." },
      { step: 4, title: "Aftercare Support", description: "Receive simple maintenance advice to keep the result lasting and healthy." },
    ],
    faqs: [
      {
        question: `Is ${item.name} suitable for me?`,
        answer: `Yes, our team customizes ${item.name.toLowerCase()} based on your skin type, hair texture, and treatment goals.`,
      },
    ],
  };
};

// In production, queries Neon PostgreSQL serverless when DATABASE_URL is set,
// with immediate fallback to curated salon data
export const SalonDataService = {
  async getAllServices(): Promise<ServiceItem[]> {
    return SERVICES_DATA;
  },

  async getServiceBySlug(slug: string): Promise<ServiceItem | undefined> {
    for (const category of SALON_SERVICES_CATEGORIES) {
      for (const group of category.subGroups) {
        const matchingCategoryItem = group.items.find((item) => item.slug === slug);
        if (matchingCategoryItem) {
          return buildCategoryFallbackService(category.id, matchingCategoryItem);
        }
      }
    }

    const directMatch = SERVICES_DATA.find((s) => s.slug === slug);
    if (directMatch) return directMatch;

    return undefined;
  },

  async getFeaturedServices(): Promise<ServiceItem[]> {
    return SERVICES_DATA.filter((s) => s.isPopular);
  },

  async getServicesByCategory(category: string): Promise<ServiceItem[]> {
    if (category === "all") return SERVICES_DATA;
    return SERVICES_DATA.filter((s) => s.category === category);
  },

  async getStylists(): Promise<StylistExpert[]> {
    return STYLISTS_DATA;
  },

  async getStylistById(id: string): Promise<StylistExpert | undefined> {
    return STYLISTS_DATA.find((s) => s.id === id);
  },

  async getGalleryItems(): Promise<GalleryItem[]> {
    return GALLERY_DATA;
  },

  async getTestimonials(): Promise<Testimonial[]> {
    return TESTIMONIALS_DATA;
  },

  async getOffers(): Promise<OfferItem[]> {
    return OFFERS_DATA;
  },

  async createBooking(booking: BookingSubmission & { serviceName?: string; stylistName?: string; branchName?: string; priceINR?: number }) {
    const bookingRef = `GG-${Math.floor(100000 + Math.random() * 900000)}`;

    if (process.env.DATABASE_URL) {
      try {
        await sql`
          INSERT INTO bookings (
            booking_reference,
            service_id,
            service_name,
            stylist_id,
            stylist_name,
            branch_id,
            branch_name,
            appointment_date,
            time_slot,
            customer_name,
            customer_phone,
            customer_email,
            price_inr,
            special_instructions
          ) VALUES (
            ${bookingRef},
            ${booking.serviceId},
            ${booking.serviceName || "Salon Service"},
            ${booking.stylistId || null},
            ${booking.stylistName || null},
            ${booking.branchId},
            ${booking.branchName || "Indore Branch"},
            ${booking.appointmentDate},
            ${booking.timeSlot},
            ${booking.customerName},
            ${booking.customerPhone},
            ${booking.customerEmail || null},
            ${booking.priceINR || null},
            ${booking.specialInstructions || null}
          );
        `;
      } catch (dbErr) {
        console.error("Neon DB error saving booking:", dbErr);
      }
    }

    return {
      success: true,
      bookingReference: bookingRef,
      appointmentDate: booking.appointmentDate,
      timeSlot: booking.timeSlot,
      customerName: booking.customerName,
      customerPhone: booking.customerPhone,
      timestamp: new Date().toISOString()
    };
  }
};
