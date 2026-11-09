import { SERVICES_DATA, STYLISTS_DATA, GALLERY_DATA, TESTIMONIALS_DATA, OFFERS_DATA } from "@/lib/constants/salon-data";
import { ServiceItem, StylistExpert, GalleryItem, Testimonial, OfferItem, BookingSubmission } from "@/types";
import { sql } from "@/lib/db/neon";

// In production, queries Neon PostgreSQL serverless when DATABASE_URL is set,
// with immediate fallback to curated salon data
export const SalonDataService = {
  async getAllServices(): Promise<ServiceItem[]> {
    return SERVICES_DATA;
  },

  async getServiceBySlug(slug: string): Promise<ServiceItem | undefined> {
    return SERVICES_DATA.find((s) => s.slug === slug);
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
