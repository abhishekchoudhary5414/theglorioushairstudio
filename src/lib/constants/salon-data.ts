import { ServiceItem, StylistExpert, GalleryItem, Testimonial, OfferItem } from "@/types";

export const SALON_IMAGE_SET = {
  salonInterior: "https://images.unsplash.com/photo-1527799820374-dcf8d9d4a388?q=80&w=1200&auto=format&fit=crop",
  hairColor: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
  bridal: "https://images.unsplash.com/photo-1595475207225-428b62bda831?q=80&w=1200&auto=format&fit=crop",
  facial: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?q=80&w=1200&auto=format&fit=crop",
  treatment: "https://images.unsplash.com/photo-1560750588-73207b1ef5b8?q=80&w=1200&auto=format&fit=crop",
  hydra: "https://images.unsplash.com/photo-1512290900672-1f4a97491d90?q=80&w=1200&auto=format&fit=crop",
  nailArt: "https://images.unsplash.com/photo-1632345031435-8727f6897d53?q=80&w=1200&auto=format&fit=crop",
  waxing: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1200&auto=format&fit=crop",
  spa: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?q=80&w=1200&auto=format&fit=crop",
  stylistHair: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop",
  stylistMakeup: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=800&auto=format&fit=crop",
  stylistSkin: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=800&auto=format&fit=crop",
  stylistPortrait: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop",
  bridalPortrait: "https://images.unsplash.com/photo-1610030469983-98e550d6193c?q=80&w=1000&auto=format&fit=crop",
  menHair: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1000&auto=format&fit=crop",
  academy: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?q=80&w=1200&auto=format&fit=crop",
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
    id: "serv-acad-hair",
    slug: "hair-course",
    name: "Professional Hair Course",
    tagline: "Certified professional hair cutting, chemical treatments & styling",
    category: "hair-care",
    categoryName: "Academy Courses",
    durationMinutes: 180,
    priceINR: 15000,
    priceDisplay: "₹15,000",
    isPopular: true,
    image: SALON_IMAGE_SET.academy,
    shortDescription: "Complete hands-on professional hair training covering scissor work, chemical botox/keratin, coloring, and salon client management.",
    fullDescription: "Build your career in the beauty industry with our comprehensive Professional Hair Course in Indore. Learn Vidal Sassoon sectioning, advanced scissor texturing, balayage hair painting, keratin/nanoplastia chemistry, and client consultations with 100% live model training.",
    benefits: [
      "Authorized professional completion certification",
      "Hands-on practical training on live models",
      "In-depth knowledge of chemical bonds & formulations",
      "Placement assistance and salon setup guidance"
    ],
    process: [
      { step: 1, title: "Theory & Hair Anatomy", description: "Understanding hair porosity, texture analysis, and tool ergonomics." },
      { step: 2, title: "Precision Scissor & Clipper Cutting", description: "Mastering blunt bobs, layers, fades, and graduation techniques." },
      { step: 3, title: "Chemical Restructuring & Color", description: "Hands-on formulation for Keratin, Botox, Nanoplastia, and Balayage." },
      { step: 4, title: "Client Service & Final Assessment", description: "Full client consultation and practical evaluation." }
    ],
    faqs: [
      { question: "What is the duration of this hair course?", answer: "The course runs for 4 to 6 weeks with flexible weekday and weekend practical batches." },
      { question: "Do I get a certificate upon completion?", answer: "Yes, you receive an authorized certificate from The Glorious Hair Studio and Academy." }
    ]
  },
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
    image: SALON_IMAGE_SET.facial,
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
    id: "serv-acad-makeup",
    slug: "makeup-course",
    name: "Master Bridal & HD Makeup Course",
    tagline: "Hands-on training in HD, Airbrush, Bridal looks & Saree draping",
    category: "makeup",
    categoryName: "Academy Courses",
    durationMinutes: 180,
    priceINR: 15000,
    priceDisplay: "₹15,000",
    isPopular: true,
    image: SALON_IMAGE_SET.bridal,
    shortDescription: "Learn professional bridal makeup from senior artists. Covers color theory, skin prep, smokey eyes, contouring, and saree draping.",
    fullDescription: "Step into the lucrative bridal industry with our master makeup program. Work with premium international brands like MAC, Huda Beauty, NARS, and Kryolan. Perfect your bridal eye work, waterproof base building, matha patti fixing, and dupatta pin-ups.",
    benefits: [
      "100% practical live model sessions for every look",
      "Mastery of flash-proof, 4K camera-ready bases",
      "Complete dupatta, lehenga, and saree draping lessons",
      "Portfolio photography assistance for your social media"
    ],
    process: [
      { step: 1, title: "Color Theory & Undertone Mapping", description: "Warm, cool, olive undertones and flawless color correction." },
      { step: 2, title: "Base Architecture & Contouring", description: "Waterproof HD airbrush bases, powder baking, and strobing." },
      { step: 3, title: "Eye Artistry & Lashes", description: "Smokey eyes, cut-crease, glitter foil work, and 3D lash fixing." },
      { step: 4, title: "Bridal Draping & Trousseau", description: "Sabyasachi draping, traditional Kanjeevaram pleating, and jewelry setting." }
    ],
    faqs: [
      { question: "Do you provide makeup products during practice?", answer: "Yes, studio demo makeup vanity kits and brushes are provided during academy sessions." }
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
    image: SALON_IMAGE_SET.nailArt,
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
    id: "serv-mk-party",
    slug: "party-makeup",
    name: "Party & Occasion Makeup",
    tagline: "Flawless, radiant glam for cocktail events and celebrations",
    category: "makeup",
    categoryName: "Makeup & Hair Styling",
    durationMinutes: 60,
    priceINR: 1000,
    priceDisplay: "₹1,000",
    isPopular: true,
    image: SALON_IMAGE_SET.bridal,
    shortDescription: "Glow with photo-ready HD party makeup tailored to your outfit and face structure. Includes skin prep and soft eye detailing.",
    fullDescription: "Attending a family wedding, birthday, or cocktail reception in Indore? Our party makeup provides lightweight, radiant coverage that stays fresh for hours without looking overdone.",
    benefits: ["Dewy or matte skin finish", "Subtle customized eye makeup", "Sweat-resistant long-lasting base", "Includes pre-makeup skin priming"],
    process: [
      { step: 1, title: "Skin Prep", description: "Hydrating serum and pore-smoothing primer application." },
      { step: 2, title: "HD Base Blend", description: "Skin tone matched foundation and subtle cream contouring." },
      { step: 3, title: "Eye Detailing", description: "Soft shimmer, eyeliner, and volumizing mascara." },
      { step: 4, title: "Lip Color & Setting Mist", description: "Long-wear lipstick and fine setting spray." }
    ],
    faqs: [{ question: "Can I bring my own lipstick shade?", answer: "Yes, our artists are happy to work with your favorite lip shades." }]
  },
  {
    id: "serv-mk-bridal",
    slug: "bridal-makeup",
    name: "Royal HD Bridal Makeup",
    tagline: "Sweat-proof, 16-hour camera-ready wedding day makeup",
    category: "bridal-makeup",
    categoryName: "Makeup & Hair Styling",
    durationMinutes: 180,
    priceINR: 5000,
    priceDisplay: "Starting from ₹5,000",
    isPopular: true,
    image: SALON_IMAGE_SET.bridalPortrait,
    shortDescription: "Complete bridal package with 16-hour waterproof HD base, lashes, lenses, jewelry setting, and perfect lehenga/saree draping.",
    fullDescription: "Make your wedding day unforgettable. Our senior bridal artists specialize in natural-looking, radiant bridal makeup using MAC, Huda Beauty, NARS, and Kryolan that remains flawless under 4K lenses and varmala/phera warmth.",
    benefits: ["100% waterproof and flash-tested", "Includes 3D mink lashes and lenses", "Precision matha patti and jewelry fixing", "Expert double-dupatta or saree draping"],
    process: [
      { step: 1, title: "Hydration Mask", description: "Deep prep sheet mask to ensure smooth base." },
      { step: 2, title: "HD Base Sculpting", description: "Micro-fine foundation match for weightless coverage." },
      { step: 3, title: "Regal Eye Art", description: "Custom glitter or smokey eye with luxury lashes." },
      { step: 4, title: "Bridal Draping", description: "Saree or lehenga dupatta pinning and jewelry setup." }
    ],
    faqs: [{ question: "Do you offer makeup trials?", answer: "Yes, you can schedule a pre-wedding consultation and trial at our salon." }]
  },
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
  {
    id: "serv-ht-keratin",
    slug: "keratin-hair-treatment",
    name: "Keratin Hair Treatment",
    tagline: "Restores protein, removes frizz, and adds silky smooth shine",
    category: "hair-care",
    categoryName: "Hair Treatments",
    durationMinutes: 120,
    priceINR: 2000,
    priceDisplay: "₹2,000 – ₹6,000",
    isPopular: true,
    image: SALON_IMAGE_SET.treatment,
    shortDescription: "Our most popular hair restructuring therapy. Eliminates up to 90% frizz and gives naturally straight, shiny, manageable hair.",
    fullDescription: "Say goodbye to humidity frizz and rough tangled hair. Our gentle, formaldehyde-free keratin treatment infuses hydrolyzed proteins deep into the hair cortex, sealing open cuticles and leaving strands silky soft for 4 to 6 months.",
    benefits: ["Eliminates 90% humidity frizz", "Drastically cuts down daily blow-dry time", "Adds mirror-like gloss and softness", "Safe for color-treated hair"],
    process: [
      { step: 1, title: "Clarifying Wash", description: "Opens cuticles and removes mineral build-up." },
      { step: 2, title: "Keratin Infusion", description: "Section-by-section application of protein elixir." },
      { step: 3, title: "Ceramic Ironing", description: "Thermal sealing to lock proteins into the fiber." },
      { step: 4, title: "Nourishing Rinse", description: "Hydrating seal and smooth blowout." }
    ],
    faqs: [{ question: "How is the exact price determined?", answer: "Exact pricing (₹2,000 – ₹6,000) depends on your hair length and thickness. Share a photo on WhatsApp for an exact quote." }]
  },
  {
    id: "serv-ht-botox",
    slug: "hair-botox-treatment",
    name: "Hair Botox Deep Conditioning",
    tagline: "Anti-aging cellular repair for brittle, chemically damaged strands",
    category: "hair-care",
    categoryName: "Hair Treatments",
    durationMinutes: 120,
    priceINR: 2000,
    priceDisplay: "₹2,000 – ₹6,000",
    isPopular: true,
    image: SALON_IMAGE_SET.treatment,
    shortDescription: "Intense moisture and cuticle repair treatment for bleached, color-damaged, or heat-stressed hair without flattening natural volume.",
    fullDescription: "Hair Botox acts like a deep filler for damaged hair fibers. Packed with amino acids, caviar oil, and collagen, it repairs broken bonds, eliminates split-end roughness, and restores bounce and youthfulness.",
    benefits: ["Repairs extreme chemical damage", "Preserves natural volume and bounce", "Silky smooth feel with high shine", "Long-lasting results for up to 3–4 months"],
    process: [
      { step: 1, title: "Scalp & Hair Prep", description: "Gentle detoxifying wash." },
      { step: 2, title: "Botox Cocktail Blend", description: "Deeply massaged into every strand." },
      { step: 3, title: "Steam Activation", description: "Opens fibers to absorb the collagen cocktail." },
      { step: 4, title: "Cold Seal Blowout", description: "Locks hydration and enhances shine." }
    ],
    faqs: [{ question: "Is hair botox different from keratin?", answer: "Yes, botox focuses on deep cellular moisture repair without chemically flattening hair." }]
  },
  {
    id: "serv-ht-nano",
    slug: "nanoplastia-hair-treatment",
    name: "Nanoplastia Organic Straightening",
    tagline: "Formaldehyde-free organic straightening for glass-hair finish",
    category: "hair-care",
    categoryName: "Hair Treatments",
    durationMinutes: 150,
    priceINR: 2500,
    priceDisplay: "₹2,500 – ₹10,000",
    isPopular: true,
    image: SALON_IMAGE_SET.hairColor,
    shortDescription: "Revolutionary organic straightening using amino acids and natural oils that delivers sleek, straight, and glossy hair for up to 8 months.",
    fullDescription: "Nanoplastia is the modern alternative to harsh chemical rebonding. Using plant-based acids, it penetrates into the hair cuticle to restructure curls from within, leaving your hair poker straight, healthy, and ultra-glossy with zero unpleasant fumes.",
    benefits: ["100% formaldehyde-free and safe", "Delivers sleek straight mirror-glass shine", "Lasts 6 to 8 months with proper care", "Safe for bleached and highlighted hair"],
    process: [
      { step: 1, title: "Fiber Preparation", description: "Chelating wash to remove product build-up." },
      { step: 2, title: "Nanoplastia Elixir", description: "Organic amino acid solution applied evenly." },
      { step: 3, title: "Nano-Thermal Sealing", description: "Precision ceramic flat iron passes at optimal heat." },
      { step: 4, title: "Silk Rinse & Polish", description: "pH-neutralizing rinse and blow-dry." }
    ],
    faqs: [{ question: "Will my hair look unnaturally pin-straight?", answer: "Nanoplastia straightens hair while keeping natural fluidity and movement." }]
  },

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
  {
    id: "serv-hc-women",
    slug: "womens-haircut-and-blowdry",
    name: "Women's Basic & Advance Haircut",
    tagline: "Layered cuts, feather styling, butterfly bangs & bouncy blowout",
    category: "hair-care",
    categoryName: "Haircuts & Basic Services",
    durationMinutes: 45,
    priceINR: 300,
    priceDisplay: "Basic ₹300 | Advance ₹400",
    isPopular: true,
    image: SALON_IMAGE_SET.hairColor,
    shortDescription: "Revamp your style with clean split-end trims, trending layers, curtain bangs, or chic bobs followed by a bouncy blowdry.",
    fullDescription: "From simple U/V shape maintenance trims to trending face-framing layers and butterfly cuts, our senior hair stylists listen carefully to your length preferences and give you a haircut that grows out gracefully.",
    benefits: ["Removes split ends and dry damage", "Enhances natural bounce and face shape", "Includes consultation on daily styling", "Complete with volume blowout"],
    process: [
      { step: 1, title: "Hair Analysis", description: "Assessing face shape, cowlicks, and density." },
      { step: 2, title: "Precision Sectioning", description: "Clean structural parting." },
      { step: 3, title: "Scissor Craft", description: "Layering, sliding cut, and weight reduction." },
      { step: 4, title: "Volume Blowdry", description: "Styling with round ceramic brush." }
    ],
    faqs: [{ question: "What is the difference between basic and advance cut?", answer: "Basic covers straight/U/V trims; advance includes multi-layers, feathering, bobs, and bangs." }]
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
  {
    id: "serv-fc-o3",
    slug: "o3-and-hydra-facial",
    name: "O3+ Radiance & HydraFacial Treatment",
    tagline: "Instant tan removal, pore tightening & deep vacuum hydration",
    category: "facials",
    categoryName: "Facial & Cleanup",
    durationMinutes: 60,
    priceINR: 1200,
    priceDisplay: "Hydra ₹1,200 | O3+ Facial ₹2,500",
    isPopular: true,
    image: SALON_IMAGE_SET.facial,
    shortDescription: "Visible skin brightening and vacuum pore cleansing. Eliminates whiteheads, blackheads, and dullness for party-ready glow.",
    fullDescription: "Our range of cleanups (Lilium, Gold, Lotus, O3+) and advanced facials (Gold, Lotus, O3+, HydraFacial) give your skin intense hydration, active tan removal, and improved elasticity. Every facial includes relaxing face and neck massage.",
    benefits: ["Painless vacuum extraction of blackheads", "Fades stubborn sun tan and dullness", "Includes 20-minute acupressure face massage", "Cooling rubber/gold mask locks in glow"],
    process: [
      { step: 1, title: "Deep Cleansing", description: "Cleans makeup, dust, and excess sebum." },
      { step: 2, title: "D-Tan Pack & Steam", description: "Lightens tanning and loosens clogged pores." },
      { step: 3, title: "Acupressure Massage", description: "Nourishing cream massage to boost blood flow." },
      { step: 4, title: "Hydro-Rubber Mask", description: "Locks active glow ingredients into skin." }
    ],
    faqs: [{ question: "How long does the facial glow last?", answer: "With basic sun protection, the radiant glow lasts between 3 to 4 weeks." }]
  },

  // 7. Hair Colour
  {
    id: "serv-col-global",
    slug: "hair-colour-and-root-touchup",
    name: "Men & Women Hair Colour (L'Oreal / Matrix / Wella)",
    tagline: "Ammonia-free Inoa, global hair coloring & root touch-ups",
    category: "hair-colouring",
    categoryName: "Hair Colour",
    durationMinutes: 90,
    priceINR: 300,
    priceDisplay: "Men from ₹300 | Women ₹2,000 – ₹4,000",
    isPopular: true,
    image: SALON_IMAGE_SET.hairColor,
    shortDescription: "Original branded colors from Streax, Matrix, L'Oreal, and ammonia-free Inoa. Seamless grey coverage and rich multi-tone shades.",
    fullDescription: "Refresh your natural color or try a bold new shade. We work exclusively with certified salon brands that protect your hair cuticles while delivering long-lasting color brilliance, seamless grey coverage, and deep conditioning.",
    benefits: ["Sealed original color tubes opened in front of you", "Ammonia-free Inoa options for sensitive scalp", "No harsh brassy tones as hair grows out", "Includes color-lock gloss rinse"],
    process: [
      { step: 1, title: "Shade Selection", description: "Matching color to your natural skin tone." },
      { step: 2, title: "Precise Application", description: "Carefully applied to roots or hair lengths." },
      { step: 3, title: "Color Processing", description: "Timed development for rich pigment uptake." },
      { step: 4, title: "Color-Lock Wash", description: "Acidic rinse to seal cuticles and blow-dry." }
    ],
    faqs: [{ question: "Will coloring make my hair rough?", answer: "We use low-ammonia and ammonia-free formulations that include conditioning lipids to maintain hair softness." }]
  },

  // 8. Hair Spa
  {
    id: "serv-spa-deep",
    slug: "hair-spa-and-detox",
    name: "L'Oreal & Wella Deep Hair Spa & Detox",
    tagline: "Acupressure scalp massage, steam & targeted impulse boosters",
    category: "spa-wellness",
    categoryName: "Hair Spa",
    durationMinutes: 60,
    priceINR: 500,
    priceDisplay: "Men from ₹500 | Women from ₹600",
    isPopular: true,
    image: SALON_IMAGE_SET.spa,
    shortDescription: "Recharge stressed hair with hydrating cream baths, soothing head massage, hot steam, and anti-dandruff or hairfall boosters.",
    fullDescription: "A soothing 60-minute escape for dry, overworked hair and stressed scalps. Our hair spa combines rich nourishing cream baths from Matrix, L'Oreal, or Wella with targeted impulse boosters (+₹150 to +₹250) for dandruff, hairfall, and extreme dryness.",
    benefits: ["Deep scalp nourishment and stress relief", "Eliminates scalp itchiness and flaking", "Smoothens rough cuticles and split ends", "Detox hair spa options available for men and women"],
    process: [
      { step: 1, title: "Cleansing Shampoo", description: "Prepares hair cuticles for deep absorption." },
      { step: 2, title: "Cream Bath Massage", description: "20-minute therapeutic scalp acupressure." },
      { step: 3, title: "Aroma Steam", description: "Opens hair shafts for deep moisture penetration." },
      { step: 4, title: "Conditioning Rinse", description: "Detangling wash and soft blow-dry." }
    ],
    faqs: [{ question: "How often should I get a hair spa?", answer: "Once every 3 to 4 weeks is recommended for maintaining healthy hair and scalp." }]
  }
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
    title: "Caramel Balayage Hair Transformation",
    category: "hair-colouring",
    categoryLabel: "Hair Color",
    image: SALON_IMAGE_SET.hairColor,
    description: "Rich caramel and mocha highlights done on natural dark hair at our Vijay Nagar salon."
  },
  {
    id: "gal-2",
    title: "Indori Hindu Wedding Bride",
    category: "bridal-makeup",
    categoryLabel: "Bridal Makeup",
    image: SALON_IMAGE_SET.bridal,
    description: "Subtle golden eye makeup, glowing skin base, and red bridal lehenga draping."
  },
  {
    id: "gal-3",
    title: "Keratin Smooth & Shiny Hair Reveal",
    category: "hair-transformations",
    categoryLabel: "Hair Smoothing",
    image: SALON_IMAGE_SET.treatment,
    description: "Before and after Brazilian Keratin treatment. Frizz completely gone."
  },
  {
    id: "gal-4",
    title: "HydraFacial Glow Result",
    category: "skin-treatments",
    categoryLabel: "Skin Facial",
    image: SALON_IMAGE_SET.facial,
    description: "Fresh, hydrated, clean skin right after our 7-step HydraFacial."
  },
  {
    id: "gal-5",
    title: "Sangeet Evening Party Look",
    category: "party-makeup",
    categoryLabel: "Party Makeup",
    image: SALON_IMAGE_SET.bridalPortrait,
    description: "Glamorous party makeup with soft curls for a wedding reception in Indore."
  },
  {
    id: "gal-6",
    title: "Our Salon Interior in Vijay Nagar",
    category: "salon-interiors",
    categoryLabel: "Salon Interior",
    image: SALON_IMAGE_SET.salonInterior,
    description: "Modern styling chairs, clean private rooms, and comfortable waiting lounge."
  },
  {
    id: "gal-7",
    title: "Glitter & French Tip Nail Extensions",
    category: "hair-transformations",
    categoryLabel: "Nail Extensions",
    image: SALON_IMAGE_SET.nailArt,
    description: "Almond-shaped gel extensions with silver glitter accents."
  },
  {
    id: "gal-8",
    title: "Traditional Bridal Haldi Look",
    category: "bridal-makeup",
    categoryLabel: "Bridal Makeup",
    image: SALON_IMAGE_SET.bridalPortrait,
    description: "Light dewy makeup with fresh floral jewelry for morning Haldi function."
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
