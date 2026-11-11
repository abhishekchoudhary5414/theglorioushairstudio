export interface SubServiceItem {
  id: string;
  slug: string; // Dynamic slug linking to /services/[slug]
  name: string;
  price?: number;
  priceDisplay?: string; // e.g. "₹15,000", "₹2,000 – ₹6,000", "Starting from ₹5,000"
  description?: string;
  badge?: string;
  image?: string;
}

export interface ServiceSubGroup {
  groupTitle?: string;
  groupDescription?: string;
  items: SubServiceItem[];
  additionalOptions?: {
    title: string;
    items: { label: string; price: string }[];
  };
}

export interface ServiceCategorySectionData {
  id: string; // for anchor navigation
  slug: string; // route path, e.g. /services/academic-courses
  title: string;
  shortTitle: string; // for category navbar
  eyebrow: string;
  description: string;
  icon: string; // MUI Icon identifier name
  image?: string;
  highlightedNote?: string;
  ctaText?: string;
  ctaHref?: string;
  ctaType?: "booking" | "whatsapp" | "contact";
  subGroups: ServiceSubGroup[];
}

export const SALON_SERVICES_CATEGORIES: ServiceCategorySectionData[] = [
  {
    id: "academy-courses",
    slug: "academic-courses",
    title: "Academy Courses",
    shortTitle: "Academy Courses",
    eyebrow: "Professional Career Training",
    description: "Build your professional career in the beauty industry with our practical and professional training courses.",
    icon: "School",
    image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
    highlightedNote: "Per Course Fees – ₹15,000",
    ctaText: "Contact Us for Course Details & Admission",
    ctaHref: "/contact",
    ctaType: "contact",
    subGroups: [
      {
        items: [
          {
            id: "acad-skin",
            slug: "skin-course",
            name: "Skin Course",
            price: 15000,
            priceDisplay: "₹15,000",
            description: "Dermatological aesthetics, cleanups, facials, skin analysis & machine treatments.",
            badge: "Certified",
            image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop"
          },
          {
            id: "acad-nail",
            slug: "nail-course",
            name: "Nail Course",
            price: 15000,
            priceDisplay: "₹15,000",
            description: "Gel & acrylic extensions, Russian dry manicure, 3D nail art & UV sculpting.",
            badge: "Hands-on Practical",
            image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=900&auto=format&fit=crop"
          }
        ]
      }
    ]
  },
  {
    id: "makeup-hair-styling",
    slug: "makeup-hair-styling",
    title: "Makeup & Hair Styling",
    shortTitle: "Makeup & Hair Styling",
    eyebrow: "Flawless Occasion Artistry",
    description: "Get photo-ready with high-definition makeup, trendsetting hairstyles, and precision saree draping.",
    icon: "FaceRetouchingNatural",
    image: "https://images.unsplash.com/photo-1595475207225-428b62bda831?q=80&w=1200&auto=format&fit=crop",
    highlightedNote: "Prices may vary as per requirement.",
    ctaText: "Book Makeup or Styling Session",
    ctaHref: "/booking",
    ctaType: "booking",
    subGroups: [
      {
        groupTitle: "Makeup Services",
        items: [
          { id: "mk-sider", slug: "party-makeup-sider", name: "Sider Makeup", price: 1000, priceDisplay: "₹1,000", description: "Complementary soft glam for bridesmaids, sisters and wedding guests.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop" },
          { id: "mk-sangeet", slug: "party-makeup-sangeet", name: "Sangeet Makeup", price: 1000, priceDisplay: "₹1,000", description: "Vibrant eye makeup with sweat-resistant dewy foundation for dancing all night.", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=900&auto=format&fit=crop" },
          { id: "mk-haldi", slug: "party-makeup-haldi", name: "Haldi Makeup", price: 1000, priceDisplay: "₹1,000", description: "Lightweight, fresh waterproof makeup perfect for daytime Haldi ceremonies.", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop" },
        ]
      },
      {
        groupTitle: "Hair & Draping",
        items: [
          { id: "hd-hair", slug: "hair-styling-any-style", name: "Any Hair Style", price: 500, priceDisplay: "₹500", description: "Hollywood waves, messy braids, textured bridal buns or trendy half-up styles.", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop" },
          { id: "hd-saree", slug: "hair-styling-saree-draping", name: "Saree Draping", price: 300, priceDisplay: "₹300", description: "Expert draping for traditional Kanjeevaram, Silk, Organza or modern designer lehenga dupattas.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop" }
        ]
      }
    ]
  },
  {
    id: "hair-treatments",
    slug: "hair-treatments",
    title: "Professional Hair Treatments",
    shortTitle: "Hair Treatments",
    eyebrow: "Transformative Hair Architecture",
    description: "Give your hair the care and transformation it deserves with our basic to advanced hair treatments.",
    icon: "AutoFixHigh",
    image: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop",
    highlightedNote: "Exact pricing depends on hair length and volume. Please share your hair length and a hair photograph for an accurate quotation.",
    ctaText: "Get Your Hair Treatment Quote",
    ctaHref: "https://wa.me/917987583445?text=Hello%20The%20Glorious%20Hair%20Studio,%20I%20would%20like%20to%20get%20a%20quotation%20for%20Hair%20Treatments.%20Sharing%20my%20hair%20length%20details.",
    ctaType: "whatsapp",
    subGroups: [
      {
        items: [
          { id: "ht-smoothing", slug: "hair-treatment-smoothing", name: "Smoothing", priceDisplay: "₹2,500 – ₹10,000", description: "Natural straight feel with manageable bounce and silky soft texture.", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=900&auto=format&fit=crop" },
          { id: "ht-straight", slug: "hair-treatment-straightening", name: "Straightening", priceDisplay: "₹2,500 – ₹10,000", description: "Permanent sleek poker-straight finish with high structural shine.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop" },
          { id: "ht-protein", slug: "hair-treatment-protein", name: "Protein", priceDisplay: "₹2,500 – ₹10,000", description: "Bio-active amino restorative treatment rebuilding broken disulphide hair bonds.", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop" }
        ]
      }
    ]
  },
  {
    id: "haircuts-basic",
    slug: "haircuts-basic",
    title: "Haircuts & Basic Services",
    shortTitle: "Haircuts & Basic",
    eyebrow: "Precision Cuts & Everyday Grooming",
    description: "Expert styling, scissor handcraft, and refreshing grooming tailored for both men and women.",
    icon: "ContentCut",
    subGroups: [
      {
        groupTitle: "Men's Services",
        items: [
          { id: "hc-m-cut", slug: "mens-haircut", name: "Male Hair Cut (Wash + Blowdry)", price: 100, priceDisplay: "₹100", description: "Precision scissor & clipper cut tailored to face contour with shampoo wash & blowdry.", image: "https://images.unsplash.com/photo-1517832606299-7ae9b720a186?q=80&w=900&auto=format&fit=crop" },
          { id: "hc-m-beard", slug: "mens-beard-trim", name: "Beard Trim", price: 70, priceDisplay: "₹70", description: "Detailed beard contouring, sharp line trimming, and conditioning splash.", image: "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?q=80&w=900&auto=format&fit=crop" },
          { id: "hc-m-wash", slug: "mens-hair-wash", name: "Hair Wash with Conditioner", price: 50, priceDisplay: "₹50", description: "Cleansing wash followed by restorative conditioning and detangling.", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop" }
        ]
      },
      {
        groupTitle: "Women's Services",
        items: [
        ]
      }
    ]
  },
  {
    id: "wax-body-care",
    slug: "wax-body-care",
    title: "Wax & Body Care",
    shortTitle: "Wax & Body Care",
    eyebrow: "Silky Smooth & Polished Skin",
    description: "Gentle waxing and luxurious body polishing to leave your skin soft, refreshed, and radiant.",
    icon: "Spa",
    subGroups: [
      {
        groupTitle: "Wax Services",
        items: [
          { id: "wx-hand-under", slug: "wax-full-hand-underarms", name: "Full Hand + Underarms", price: 400, priceDisplay: "₹400", description: "Complete arms and underarms waxing for clean, smooth skin.", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
          { id: "wx-leg", slug: "wax-full-leg", name: "Full Leg", price: 800, priceDisplay: "₹800", description: "Gentle waxing from thighs to ankles with post-wax soothing oil.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop" },
          { id: "wx-face", slug: "wax-face", name: "Face Wax", price: 200, priceDisplay: "₹200", description: "Delicate facial waxing removing peach fuzz cleanly with minimal redness.", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=900&auto=format&fit=crop" },
          { id: "wx-body", slug: "wax-full-body", name: "Full Body Wax (Male & Female)", price: 2500, priceDisplay: "₹2,500", description: "Comprehensive full body waxing performed in private, sanitized rooms.", badge: "Unisex", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=900&auto=format&fit=crop" }
        ]
      },
      {
        groupTitle: "Body Polishing",
        items: [
          { id: "bp-body", slug: "body-polishing", name: "Body Polishing (Male & Female)", price: 2000, priceDisplay: "₹2,000", description: "Full body exfoliation scrub, tan removal pack, and nourishing body glow butter.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop" }
        ]
      }
    ]
  },
  {
    id: "facial-cleanup",
    slug: "facial-cleanup",
    title: "Facial & Cleanup Services",
    shortTitle: "Facial & Cleanup",
    eyebrow: "Dermatological Radiance & Detox",
    description: "Revitalize your skin with targeted cleansers, D-tan therapies, and medical-grade hydra infusions.",
    icon: "CleanHands",
    image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop",
    subGroups: [
      {
        groupTitle: "Cleanup Services",
        items: [
          { id: "cu-lilium", slug: "cleanup-lilium", name: "Lilium Cleanup", price: 700, priceDisplay: "₹700", description: "Essential herbal cleanup for daily dust and oil extraction.", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=900&auto=format&fit=crop" },
          { id: "cu-gold", slug: "cleanup-gold", name: "Gold Cleanup", price: 900, priceDisplay: "₹900", description: "Instant golden luster polish for quick party and evening glow.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop" },
          { id: "cu-anti-acne", slug: "cleanup-anti-acne", name: "Nature Anti-Acne Cleanup", price: 1000, priceDisplay: "₹1,000", description: "Purifying neem and tea-tree formula targeting active breakouts and excess sebum.", image: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=900&auto=format&fit=crop" },
          { id: "cu-rose", slug: "cleanup-rose-radiance", name: "Nature Rose Radiance Cleanup", price: 1200, priceDisplay: "₹1,200", description: "Damascus rose water infusion providing calm hydration for sensitive skin.", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop" },
          { id: "cu-lotus", slug: "cleanup-lotus", name: "Lotus Cleanup", price: 1300, priceDisplay: "₹1,300", description: "Botanical lotus extracts balancing pigmentation and refining facial texture.", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=900&auto=format&fit=crop" },
          { id: "cu-shehnaaz", slug: "cleanup-shehnaaz", name: "Shehnaaz Cleanup", price: 1400, priceDisplay: "₹1,400", description: "Herbal luxury ayurvedic cleanup known for deep organic nourishment.", image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?q=80&w=900&auto=format&fit=crop" },
          { id: "cu-o3", slug: "cleanup-o3", name: "O3 Cleanup", price: 1500, priceDisplay: "₹1,500", description: "Oxygenating D-tan and micro-exfoliation for visible clear brightness.", badge: "D-Tan", image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?q=80&w=900&auto=format&fit=crop" }
        ]
      },
      {
        groupTitle: "Facial Services",
        items: [
          { id: "fc-gold", slug: "facial-gold", name: "Gold Facial", price: 1500, priceDisplay: "₹1,500", description: "Classic 24K gold foil and radiant cream massage with revitalizing peel-off pack.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop" },
          { id: "fc-lotus", slug: "facial-lotus", name: "Lotus Facial", price: 2000, priceDisplay: "₹2,000", description: "Pure bio-extract botanical facial targeting dullness and uneven sun tanning.", image: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?q=80&w=900&auto=format&fit=crop" },
        ]
      }
    ]
  },
  {
    id: "hair-colour",
    slug: "hair-colour",
    title: "Hair Colour Services",
    shortTitle: "Hair Colour",
    eyebrow: "Artisanal Shades & Low-Ammonia Gloss",
    description: "From global root touch-ups to rich multi-dimensional hues using top international formulations.",
    icon: "Palette",
    highlightedNote: "Female Hair Colour pricing (₹2,000 – ₹4,000) depends on hair length and volume. Female Root Touch Up starts from ₹800.",
    subGroups: [
      {
        groupTitle: "Male Hair Colour",
        items: [
          { id: "col-m-streax", slug: "hair-colour-streax", name: "Streax", price: 300, priceDisplay: "₹300", description: "Quick grey coverage with natural black or brown shade.", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop" },
          { id: "col-m-matrix", slug: "hair-colour-matrix", name: "Matrix", price: 400, priceDisplay: "₹400", description: "Rich conditioning pigment providing long-lasting natural tone.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop" },
          { id: "col-m-loreal", slug: "hair-colour-loreal", name: "Loreal", price: 500, priceDisplay: "₹500", description: "Classic European formulation with high fiber softness and luster.", image: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=900&auto=format&fit=crop" },
          { id: "col-m-loreal-inoa", slug: "hair-colour-loreal-inoa", name: "Loreal Inoa", price: 600, priceDisplay: "₹600", description: "100% ammonia-free oil-delivery system for ultimate scalp comfort and shine.", badge: "Ammonia Free", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=900&auto=format&fit=crop" },
          { id: "col-m-matrix-inoa", slug: "hair-colour-matrix-inoa", name: "Matrix Inoa (Ammonia Free)", price: 500, priceDisplay: "₹500", description: "Gentle ammonia-free grey coverage that preserves hair softness.", badge: "Ammonia Free", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=900&auto=format&fit=crop" }
        ]
      },
      {
        groupTitle: "Female Hair Colour & Touch Up",
        items: [
          {
            id: "col-w-root",
            slug: "female-root-touch-up",
            name: "Female Root Touch Up",
            priceDisplay: "Starting from ₹800",
            description: "Seamless grey coverage matching your existing hair shade perfectly.",
            image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop"
          }
        ]
      }
    ]
  },
  {
    id: "hair-spa",
    slug: "hair-spa",
    title: "Hair Spa Services",
    shortTitle: "Hair Spa",
    eyebrow: "Deep Nourishment & Scalp Therapy",
    description: "Recharge stressed tresses with soothing head massages, steam therapy, and targeted impulse treatments.",
    icon: "SelfImprovement",
    subGroups: [
      {
        groupTitle: "Male Hair Spa",
        items: [
          { id: "spa-m-matrix", slug: "hair-spa-male-matrix", name: "Matrix Spa", price: 500, priceDisplay: "₹500", description: "Hydrating cream bath that softens dry hair cuticles.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop" },
          { id: "spa-m-loreal", slug: "hair-spa-male-loreal", name: "Loreal Spa", price: 600, priceDisplay: "₹600", description: "Enriched with water lily and purified water for fiber strength.", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=900&auto=format&fit=crop" },
          { id: "spa-m-wella", slug: "hair-spa-male-wella", name: "Wella Spa", price: 700, priceDisplay: "₹700", description: "Salon-grade luxury conditioning with long-lasting moisture balance.", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop" }
        ],
        additionalOptions: {
          title: "Male Additional Scalp Boosters",
          items: [
            { label: "Anti-dandruff Booster", price: "+₹150" },
            { label: "Hairfall Control Booster", price: "+₹150" },
            { label: "Deep Dryness Relief", price: "+₹150" }
          ]
        }
      },
      {
        groupTitle: "Female Hair Spa",
        items: [
          { id: "spa-w-basic", slug: "hair-spa-female-basic", name: "Basic Spa", price: 600, priceDisplay: "₹600", description: "Essential moisture conditioning wash and warm towel wrap.", image: "https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?q=80&w=900&auto=format&fit=crop" },
          { id: "spa-w-matrix", slug: "hair-spa-female-matrix", name: "Matrix Spa", price: 800, priceDisplay: "₹800", description: "Deep smoothening treatment with acupressure head massage.", image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop" },
          { id: "spa-w-loreal", slug: "hair-spa-female-loreal", name: "Loreal Spa", price: 900, priceDisplay: "₹900", description: "Infused with pure essential oils to restore bounce and shine.", image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=900&auto=format&fit=crop" },
          { id: "spa-w-wella", slug: "hair-spa-female-wella", name: "Wella Spa", price: 1000, priceDisplay: "₹1,000", description: "Premium restorative mask designed for colored and stressed hair.", image: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop" }
        ],
        additionalOptions: {
          title: "Impulse Treatment Add-on (+₹250)",
          items: [
            { label: "Anti-dandruff Impulse", price: "+₹250" },
            { label: "Hairfall Defense Impulse", price: "+₹250" },
            { label: "Frizzy Hair Taming", price: "+₹250" },
            { label: "Intense Dryness Nourishment", price: "+₹250" }
          ]
        }
      },
      {
        groupTitle: "Advanced Detox Hair Spa",
        items: [
        ]
      }
    ]
  }
];
