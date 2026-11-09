export type ServiceCategory =
  | "hair-care"
  | "hair-colouring"
  | "skin-care"
  | "facials"
  | "makeup"
  | "bridal-makeup"
  | "nail-care"
  | "waxing"
  | "spa-wellness";

export interface ServiceItem {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  category: ServiceCategory;
  categoryName: string;
  durationMinutes: number;
  priceINR: number;
  priceDisplay?: string;
  originalPriceINR?: number;
  image: string;
  isPopular?: boolean;
  shortDescription: string;
  fullDescription: string;
  benefits: string[];
  process: {
    step: number;
    title: string;
    description: string;
  }[];
  faqs: {
    question: string;
    answer: string;
  }[];
}

export interface StylistExpert {
  id: string;
  name: string;
  designation: string;
  experienceYears: number;
  specialization: string[];
  bio: string;
  image: string;
  instagram?: string;
  rating: number;
  reviewCount: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  category: "hair-transformations" | "hair-colouring" | "bridal-makeup" | "party-makeup" | "skin-treatments" | "salon-interiors";
  categoryLabel: string;
  image: string;
  description: string;
}

export interface Testimonial {
  id: string;
  clientName: string;
  serviceReceived: string;
  rating: number;
  review: string;
  date: string;
  avatar?: string;
  location: string;
}

export interface OfferItem {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  discountDescription: string;
  originalPriceINR?: number;
  offerPriceINR?: number;
  validTill: string;
  terms: string[];
  includedServices: string[];
}

export interface BookingSubmission {
  categoryId: string;
  serviceId: string;
  stylistId?: string;
  branchId: string;
  appointmentDate: string;
  timeSlot: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  specialInstructions?: string;
}

