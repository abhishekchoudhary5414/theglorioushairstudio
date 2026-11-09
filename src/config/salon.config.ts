import salonInfoJson from "@/data/salon-info.json";

export interface SalonConfig {
  name: string;
  logo: string;
  tagline: string;
  subTagline: string;
  established: number;
  description: string;
  contact: {
    phone: string;
    phoneDisplay: string;
    whatsapp: string;
    whatsappDisplay: string;
    email: string;
    bookingEmail: string;
  };
  address: {
    line1: string;
    line2: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
    fullAddress?: string;
    googleMapsEmbedUrl: string;
    directionsUrl: string;
  };
  hours: {
    days: string;
    time: string;
    note?: string;
  }[];
  socials: {
    instagram: string;
    facebook: string;
    youtube?: string;
    pinterest?: string;
  };
  branches: {
    id: string;
    name: string;
    area: string;
    address: string;
    phone: string;
    timing: string;
  }[];
  features: {
    title: string;
    description: string;
    icon: string;
  }[];
}

// Load and export directly from salon-info.json
export const salonConfig: SalonConfig = salonInfoJson as SalonConfig;
