import { ServiceItem, StylistExpert, GalleryItem, Testimonial, OfferItem } from "@/types";

export const SALON_IMAGE_SET = {
  salonInterior: "/gallery/1.png",
  hairColor: "/gallery/1.png",
  bridal: "/gallery/2.png",
  facial: "/gallery/3.png",
  treatment: "/gallery/4.png",
  hydra: "/gallery/4.png",
  nailArt: "/gallery/1.png",
  waxing: "/gallery/2.png",
  spa: "/gallery/3.png",
  stylistHair: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=900&auto=format&fit=crop",
  stylistMakeup: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=900&auto=format&fit=crop",
  stylistSkin: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?q=80&w=900&auto=format&fit=crop",
  stylistPortrait: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=900&auto=format&fit=crop",
  bridalPortrait: "/gallery/2.png",
  menHair: "/gallery/1.png",
  academy: "/gallery/3.png",
};

export const CATEGORIES_LIST = [
  { id: "all", name: "All Services" },
  { id: "academy-courses", name: "Academy Courses" },
  { id: "makeup-hair-styling", name: "Makeup & Hair Styling" },
  { id: "hair-treatments", name: "Hair Treatments" },
  { id: "haircuts-basic", name: "Haircuts & Basic" },
  { id: "wax-body-care", name: "Wax & Body Care" },
  { id: "facial-cleanup", name: "Facial & Cleanup" },
  { id: "hair-colour", name: "Hair Colour" },
  { id: "hair-spa", name: "Hair Spa" },
];

export const SERVICES_DATA: ServiceItem[] = [
  // 1. Academy Courses
  {
    id: "serv-acad-skin",
    slug: "skin-course",
    name: "Professional Skin & Aesthetic Course",
    tagline: "Comprehensive dermatological aesthetics, cleanups and facials",
    category: "skin-care",
    categoryName: "Academy Courses",
    durationMinutes: 180,
    priceINR: 15000,
    priceDisplay: "₹15,000",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=900&auto=format&fit=crop",
    shortDescription: "Master deep skin analysis, electrical facial machines, HydraFacial protocols, chemical exfoliation, and targeted anti-acne care.",
    fullDescription: "Become a certified skin aesthetician with our structured training module. Learn proper diagnostic assessment of diverse Indian skin tones, treatment of acne and pigmentation, machine operation, and hygiene sanitation.",
    benefits: [
      "Hands-on machine training including HydraFacial and ultrasonic units",
      "Detailed understanding of active ingredients (AHAs, BHAs, Vitamin C)",
      "Certified aesthetic diploma from our academy",
      "Product kit guidance and salon business tips"
    ],
    process: [
      { step: 1, title: "Skin Histology & Typing", description: "Determining dry, oily, sensitive, and combination skin profiles." },
      { step: 2, title: "Cleanup & Massage Mastery", description: "Lymphatic drainage and facial marma pressure point techniques." },
      { step: 3, title: "Advanced Machine Operations", description: "Safe use of hydra-dermabrasion, high-frequency, and LED therapy." },
      { step: 4, title: "Client Consultation & Aftercare", description: "Prescribing homecare regimens and practical tests." }
    ],
    faqs: [
      { question: "Is prior beauty experience required?", answer: "No, this course is designed from beginner fundamentals up to advanced practical aesthetics." }
    ]
  },
  {
    id: "serv-acad-nail",
    slug: "nail-course",
    name: "Professional Nail Art & Extension Course",
    tagline: "Certified gel extensions, acrylic sculpting & 3D nail art",
    category: "nail-care",
    categoryName: "Academy Courses",
    durationMinutes: 150,
    priceINR: 15000,
    priceDisplay: "₹15,000",
    isPopular: false,
    image: "https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?q=80&w=900&auto=format&fit=crop",
    shortDescription: "Learn high-precision Russian dry manicures, acrylic building, builder gels, French ombre, chrome finishes, and crystal placement.",
    fullDescription: "Nail artistry is in massive demand across salons. This specialized academy course equips you with complete technical proficiency in e-file cuticle detailing, form extensions, apex architecture, and trending nail designs.",
    benefits: [
      "Certification as a professional nail technician",
      "Hands-on practice with UV-LED curing lamps and e-file drills",
      "Nail hygiene and natural nail health preservation protocols",
      "Guidance on sourcing quality nail products at wholesale rates"
    ],
    process: [
      { step: 1, title: "Nail Anatomy & E-File Prep", description: "Micro-dry Russian manicure and cuticle perimeter cleanup." },
      { step: 2, title: "Tip & Form Sculpting", description: "Square, almond, and coffin apex building with builder gel." },
      { step: 3, title: "Nail Art & Trending Finishes", description: "Chrome powders, cat-eye magnetic gel, French ombre, and rhinestones." },
      { step: 4, title: "Safe Refills & Removals", description: "Non-damaging removal and refill procedures." }
    ],
    faqs: [
      { question: "Can I start working as a nail artist after this course?", answer: "Yes, this course prepares you to work in any premium salon or start your own nail studio." }
    ]
  },

  // 2. Makeup & Hair Styling
  {
    id: "serv-hd-style",
    slug: "hair-styling-and-draping",
    name: "Hair Styling & Saree Draping",
    tagline: "Any trending hairstyle and designer saree/dupatta pleating",
    category: "makeup",
    categoryName: "Makeup & Hair Styling",
    durationMinutes: 45,
    priceINR: 500,
    priceDisplay: "Hairstyle ₹500 | Draping ₹300",
    isPopular: false,
    image: SALON_IMAGE_SET.hairColor,
    shortDescription: "Professional open curls, messy buns, bridal braids, and crisp saree draping for weddings and festive functions.",
    fullDescription: "Complete your traditional or western outfit with expertly pinned hairstyles and crease-free saree pleats. Our stylists handle heavy silk, Kanjeevaram, organza, and designer lehenga dupattas with precision.",
    benefits: ["Secure pin-setting that stays all day", "Thermal protection for hair styling", "Flattering hairstyles suited to your face cut", "Fast and stress-free service"],
    process: [
      { step: 1, title: "Hair Prep", description: "Thermal misting and volume blow-dry." },
      { step: 2, title: "Artisanal Styling", description: "Curling, braiding, or bun sculpting." },
      { step: 3, title: "Saree Pleating", description: "Crisp shoulder and waist pleat fixation." },
      { step: 4, title: "Finishing Spritz", description: "Gloss hold spray to lock the style in place." }
    ],
    faqs: [{ question: "Do I need to wash my hair before coming?", answer: "Yes, having dry, freshly washed hair helps curls and buns hold their shape better." }]
  },

  // 3. Hair Treatments

  // 4. Haircuts & Basic Services
  {
    id: "serv-hc-men",
    slug: "mens-haircut-and-grooming",
    name: "Men's Precision Haircut & Beard Grooming",
    tagline: "Hair cut, wash, blowdry & sharp beard trimming",
    category: "hair-care",
    categoryName: "Haircuts & Basic Services",
    durationMinutes: 30,
    priceINR: 100,
    priceDisplay: "Haircut ₹100 | Beard ₹70",
    isPopular: false,
    image: SALON_IMAGE_SET.menHair,
    shortDescription: "Sharp fades, textured crops, and clean scissor cuts tailored to your face shape. Includes refreshing wash and blowdry.",
    fullDescription: "Keep your look clean and sharp with our professional men's grooming services. Our certified barbers offer precision clipper fades, classic scissor cuts, beard line shaping, and cooling conditioner washes.",
    benefits: ["Customized to your facial structure", "Includes shampoo wash & styled blowdry", "Sharp beard contouring and splash", "Fast and convenient walk-in availability"],
    process: [
      { step: 1, title: "Consultation", description: "Deciding the best length and fade level." },
      { step: 2, title: "Precision Cut", description: "Scissor & clipper texturing." },
      { step: 3, title: "Beard Contouring", description: "Trimming and sharp edge detailing." },
      { step: 4, title: "Wash & Style", description: "Refreshing rinse and styling wax or matte paste." }
    ],
    faqs: [{ question: "Do you accept walk-ins for men's haircuts?", answer: "Yes, walk-ins are welcome, or you can book online to avoid waiting." }]
  },

  // 5. Wax & Body Care
  {
    id: "serv-wx-body",
    slug: "waxing-and-body-polishing",
    name: "Full Body Waxing & Body Polishing",
    tagline: "Silky smooth skin with minimal pain and glowing body scrub",
    category: "waxing",
    categoryName: "Wax & Body Care",
    durationMinutes: 60,
    priceINR: 400,
    priceDisplay: "Waxing from ₹200 | Polishing ₹2,000",
    isPopular: false,
    image: SALON_IMAGE_SET.waxing,
    shortDescription: "Gentle waxing for hands, legs, face, and full body. Luxurious full-body polishing scrub for bright, tan-free skin.",
    fullDescription: "Experience hygienic and smooth body care in our clean, private treatment suites. We offer gentle waxing that removes short stubborn hairs with minimal discomfort, as well as full-body polishing scrubs that eliminate dead skin and sun tanning.",
    benefits: ["Clean, sanitized, private rooms", "Gentle formulations reducing skin redness", "Deep exfoliating scrub removes sun tanning", "Leaves skin velvety soft for weeks"],
    process: [
      { step: 1, title: "Skin Prep", description: "Sanitizing and talc/gel prep." },
      { step: 2, title: "Warm Waxing", description: "Even application and swift strip removal." },
      { step: 3, title: "Soothing Oil", description: "Post-wax coconut / aloe vera calming oil." },
      { step: 4, title: "Polishing (Optional)", description: "Full body walnut scrub and glow cream pack." }
    ],
    faqs: [{ question: "Is full body waxing available for both males and females?", answer: "Yes, we provide professional waxing services for both men and women in separate private rooms." }]
  },

  // 6. Facial & Cleanup

  // 7. Hair Colour

  // 8. Hair Spa
];

export const STYLISTS_DATA: StylistExpert[] = [
  {
    id: "stylist-1",
    name: "Rohit Sharma",
    designation: "Senior Hair Stylist & Colorist",
    experienceYears: 11,
    specialization: ["Balayage & Hair Color", "Keratin & Botox", "Men & Women Haircuts"],
    bio: "With over 11 years of salon experience across Mumbai and Indore, Rohit is known for giving the most flattering haircuts and trendy caramel highlights in Vijay Nagar.",
    image: SALON_IMAGE_SET.stylistHair,
    instagram: "@rohit_hair_indore",
    rating: 4.9,
    reviewCount: 380
  },
  {
    id: "stylist-2",
    name: "Pooja Verma",
    designation: "Head Bridal Makeup Artist",
    experienceYears: 9,
    specialization: ["HD Bridal Makeup", "Airbrush Makeup", "Saree & Dupatta Draping"],
    bio: "Pooja has done bridal makeup for over 500 brides across Indore, Ujjain, and Bhopal. Her brides love her for her calm nature and natural, glowing makeup look.",
    image: SALON_IMAGE_SET.stylistMakeup,
    instagram: "@pooja_bridal_indore",
    rating: 5.0,
    reviewCount: 420
  },
  {
    id: "stylist-3",
    name: "Sunita Joshi",
    designation: "Skin & Facial Specialist",
    experienceYears: 8,
    specialization: ["O3+ Whitening Facials", "HydraFacials", "Anti-Tan Treatments"],
    bio: "Certified skin aesthetician specializing in treating acne, dark circles, and sun tan. She provides honest skincare advice suited for Indore weather.",
    image: SALON_IMAGE_SET.stylistSkin,
    instagram: "@sunita_skin_care",
    rating: 4.9,
    reviewCount: 290
  },
  {
    id: "stylist-4",
    name: "Aman Khan",
    designation: "Hair Texture & Styling Expert",
    experienceYears: 7,
    specialization: ["Nanoplastia", "Hair Botox", "Party Blow Dry"],
    bio: "Expert in transforming frizzy, curly hair into silky smooth locks. Certified by L'Oreal Professionnel and Schwarzkopf Professional.",
    image: SALON_IMAGE_SET.stylistPortrait,
    instagram: "@aman_hair_expert",
    rating: 4.8,
    reviewCount: 215
  }
];

export const GALLERY_DATA: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Signature Hair Sculpting",
    category: "hair-colouring",
    categoryLabel: "Hair Color",
    image: "/gallery/1.png",
    description: "Dimensional styling and refined finishing tailored for a polished editorial look."
  },
  {
    id: "gal-2",
    title: "Bridal Glow Finish",
    category: "bridal-makeup",
    categoryLabel: "Bridal Makeup",
    image: "/gallery/2.png",
    description: "Luxury bridal grooming designed to photograph beautifully from morning rituals to night celebrations."
  },
  {
    id: "gal-3",
    title: "Silk-Smooth Hair Reveal",
    category: "hair-transformations",
    categoryLabel: "Hair Smoothing",
    image: "/gallery/3.png",
    description: "Smooth, glossy results with a healthy finish and easy styling maintenance."
  },
  {
    id: "gal-4",
    title: "Radiant Skin Refresh",
    category: "skin-treatments",
    categoryLabel: "Skin Facial",
    image: "/gallery/4.png",
    description: "Hydrated, luminous skin finished with a fresh salon-grade glow."
  },
  {
    id: "gal-5",
    title: "Editorial Hair Styling",
    category: "party-makeup",
    categoryLabel: "Party Makeup",
    image: "/gallery/1.png",
    description: "Soft movement, premium texture, and a polished finish for special moments."
  },
  {
    id: "gal-6",
    title: "Salon Experience",
    category: "salon-interiors",
    categoryLabel: "Salon Interior",
    image: "/gallery/2.png",
    description: "A premium, hygienic space designed for comfort, confidence, and beauty rituals."
  },
  {
    id: "gal-7",
    title: "Precision Styling Detail",
    category: "hair-transformations",
    categoryLabel: "Nail Extensions",
    image: "/gallery/3.png",
    description: "Clean lines and carefully styled finishes that bring out a high-fashion silhouette."
  },
  {
    id: "gal-8",
    title: "Signature Bridal Beauty",
    category: "bridal-makeup",
    categoryLabel: "Bridal Makeup",
    image: "/gallery/4.png",
    description: "An elegant bridal look with a fresh, camera-ready finish that lasts all day."
  }
];

export const TESTIMONIALS_DATA: Testimonial[] = [
  {
    id: "test-1",
    clientName: "Sakshi Agrawal",
    serviceReceived: "Bridal HD Makeup Package",
    rating: 5,
    review: "I booked Pooja for my wedding at Sayaji Hotel Indore. Everyone loved my makeup! It looked so natural in photos and stayed intact till next morning. The best salon in Vijay Nagar without any doubt.",
    date: "November 2024",
    location: "Vijay Nagar, Indore"
  },
  {
    id: "test-2",
    clientName: "Nitin Patidar",
    serviceReceived: "Haircut & Keratin Treatment",
    rating: 5,
    review: "Rohit bhai gave me the best haircut and keratin treatment. My hair used to be very rough from Indore borewell water, but now it's super soft. Very reasonable prices and very polite staff.",
    date: "October 2024",
    location: "Vijay Nagar, Indore"
  },
  {
    id: "test-3",
    clientName: "Priyanka Tiwari",
    serviceReceived: "O3+ Facial & Rica Waxing",
    rating: 5,
    review: "Super clean salon and very hygienic. Sunita did my facial and my skin was glowing for Diwali. Also the Rica wax was completely painless. Highly recommend to all Indore ladies!",
    date: "September 2024",
    location: "Scheme 78, Indore"
  }
];

export const OFFERS_DATA: OfferItem[] = [
  {
    id: "off-1",
    badge: "First Visit Discount",
    title: "Welcome Offer – Flat 20% OFF",
    subtitle: "Valid on Any Haircut, Hair Spa, or Facial on Your First Visit",
    discountDescription: "New in Indore or visiting us for the first time? Get 20% discount on any hair or skin service when you book online or via WhatsApp.",
    originalPriceINR: 2500,
    offerPriceINR: 1999,
    validTill: "Valid through this month",
    terms: [
      "Applicable for new customers only",
      "Cannot be combined with bridal packages",
      "Prior booking recommended to avoid waiting"
    ],
    includedServices: ["Haircut or Facial", "Relaxing Head or Hand Massage", "Free Skin/Hair Consultation"]
  },
  {
    id: "off-2",
    badge: "Indore Wedding Special",
    title: "Complete Bridal Trousseau Package",
    subtitle: "3-Day Beauty Care: Haldi + Engagement + Wedding Bridal Makeup",
    discountDescription: "All-in-one bridal package covering Haldi makeup, Engagement party look, and the Grand Wedding Day HD Bridal Makeup with free makeup for the bride's mother.",
    originalPriceINR: 35000,
    offerPriceINR: 24999,
    validTill: "Limited wedding bookings per month",
    terms: [
      "Booking confirmed with 20% advance token",
      "Includes private bridal room at our Vijay Nagar salon",
      "Free mother-of-the-bride makeup included"
    ],
    includedServices: [
      "HD Bridal Waterproof Makeup (2 Functions)",
      "Full Body Rica Waxing & D-Tan Polish",
      "O3+ Bridal Whitening Facial",
      "Gel Nail Extensions with Art",
      "Dupatta and Jewelry Setting"
    ]
  },
  {
    id: "off-3",
    badge: "Weekday Combo",
    title: "Tuesday – Thursday Pamper Combo",
    subtitle: "Hair Spa + O3+ Cleanup + Pedicure Combo",
    discountDescription: "Take care of your hair, skin, and feet in one relaxing salon visit at a special combo price during weekdays.",
    originalPriceINR: 4200,
    offerPriceINR: 2499,
    validTill: "Tuesdays to Thursdays only (11 AM to 6 PM)",
    terms: [
      "Available on weekdays only",
      "Both male and female guests can avail"
    ],
    includedServices: ["L'Oreal Deep Hair Spa", "O3+ Face Cleanup & D-Tan", "Classic Relaxing Pedicure"]
  }
];
