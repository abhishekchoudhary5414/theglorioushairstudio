/**
 * Single Source of Truth for Appointment Confirmation Slip Template.
 * Faithfully mirrors SimpleBookingForm index.tsx:
 * - Real Salon Logo from /public/images/logo.png (or logo.jpg) embedded as base64 Data URI
 * - Exact same salon brand info (address, phone, WhatsApp, email)
 * - Exact same Verified Slot status ribbon with Ref # & date
 * - Exact same itemized bill rows with dashed borders
 * - Exact same client instructions & verified seal box
 * - ONLY standard Material Design / MUI SVG icons (Zero emojis, zero non-MUI icons)
 */

export interface BookingSlipModel {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  categoryTitle?: string;
  appointmentDate: string;
  timeSlot: string;
  priceDisplay: string;
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  salonEmail: string;
  specialInstructions?: string;
  issuedDate: string;
  logoDataUri?: string;
}

export function escapeSvgText(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Official Material Design / MUI Icons SVG path definitions
 */
export const MUI_SVG_PATHS = {
  checkCircle:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z",
  locationOn:
    "M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z",
  phone:
    "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
  email:
    "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  calendarToday:
    "M20 3h-1V1h-2v2H7V1H5v2H4c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 18H4V8h16v13z",
  accessTime:
    "M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z",
  verified:
    "m23 12-2.44-2.79.34-3.69-3.61-.82-1.89-3.2L12 2.96 8.6 1.5 6.71 4.69 3.1 5.5l.34 3.7L1 12l2.44 2.79-.34 3.7 3.61.82L8.6 22.5l3.4-1.47 3.4 1.46 1.89-3.19 3.61-.82-.34-3.69L23 12zm-12.91 4.72-3.8-3.81 1.48-1.48 2.32 2.33 5.85-5.87 1.48 1.48-7.33 7.35z",
  whatsApp:
    "M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.41a8.17 8.17 0 0 1 2.4 5.83c0 4.54-3.7 8.24-8.24 8.24-1.44 0-2.85-.38-4.09-1.1l-.29-.17-3.05.8 1.25-3.02-.19-.31a8.165 8.165 0 0 1-1.27-4.44c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.19.53-1.09 1.04-1.54 1.09-.43.05-.98.07-1.58-.12-.37-.12-.84-.28-1.46-.55-2.58-1.12-4.26-3.73-4.39-3.9-.13-.17-1.04-1.38-1.04-2.64 0-1.25.66-1.87.9-2.12.23-.25.51-.31.68-.31.17 0 .34 0 .49.01.16.01.37-.06.58.44.21.51.73 1.78.79 1.91.07.13.11.28.02.45-.09.18-.14.28-.27.44-.14.15-.29.34-.41.46-.14.14-.28.29-.12.57.16.27.72 1.19 1.55 1.93 1.07.95 1.97 1.24 2.25 1.38.28.14.44.12.61-.07.17-.19.73-.85.92-1.14.2-.29.39-.24.66-.14.27.1.73.82 2.02 1.46.22.11.37.17.43.26.06.09.06.54-.13 1.07z"
};

/**
 * Builds the unified Confirmation Slip SVG template.
 * Matches index.tsx pixel-for-pixel with official styling.
 */
export function buildUnifiedConfirmationSvg(data: BookingSlipModel, width = 800, height = 1100): string {
  const safeRef = escapeSvgText(data.bookingRef);
  const safeName = escapeSvgText(data.customerName);
  const safePhone = escapeSvgText(data.customerPhone);
  const safeEmail = escapeSvgText(data.customerEmail || "");
  const safeService = escapeSvgText(data.serviceName);
  const safeCategory = escapeSvgText(data.categoryTitle || "Beauty & Hair Care");
  const safeDate = escapeSvgText(data.appointmentDate);
  const safeTime = escapeSvgText(data.timeSlot);
  const safePrice = escapeSvgText(data.priceDisplay);
  const safeSalon = escapeSvgText(data.salonName);
  const safeAddress = escapeSvgText(data.salonAddress);
  const safeSalonPhone = escapeSvgText(data.salonPhone);
  const safeSalonEmail = escapeSvgText(data.salonEmail);
  const safeDateIssued = escapeSvgText(data.issuedDate);
  const safeNotes = escapeSvgText(data.specialInstructions || "");

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Top Gold Accent Gradient -->
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c5a059" />
      <stop offset="50%" stop-color="#e8cf96" />
      <stop offset="100%" stop-color="#c5a059" />
    </linearGradient>

    <!-- Circular clip path for Salon Logo -->
    <clipPath id="logoCircleClip">
      <circle cx="40" cy="40" r="38" />
    </clipPath>

    <style>
      .txt-gold { fill: #c5a059; }
      .txt-dark { fill: #181413; }
      .txt-muted { fill: #69605b; }
      .txt-light { fill: #f7f1e5; }
      .txt-green { fill: #2e6b46; }
      .font-sans { font-family: "DejaVu Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; }
      .font-serif { font-family: "DejaVu Serif", Georgia, "Times New Roman", serif; }
      .font-mono { font-family: "DejaVu Sans Mono", Courier, monospace; }
    </style>
  </defs>

  <!-- Clean Off-White Alabaster Background -->
  <rect width="100%" height="100%" fill="#faf7f2" />

  <!-- Main Luxury Ticket Card -->
  <rect x="35" y="35" width="730" height="1030" rx="16" fill="#ffffff" stroke="#e8e1d5" stroke-width="1.5" />

  <!-- Top Golden Accent Bar (Matches index.tsx ticketCard::before) -->
  <rect x="35" y="35" width="730" height="6" rx="3" fill="url(#goldGradient)" />

  <!-- ==================== SALON BRANDING HEADER ==================== -->
  <g transform="translate(65, 60)">
    <!-- Salon Logo Frame -->
    <g transform="translate(0, 0)">
      <circle cx="40" cy="40" r="40" fill="#f7f1e5" stroke="#c5a059" stroke-width="1.5" />
      ${
        data.logoDataUri
          ? `<image href="${data.logoDataUri}" x="2" y="2" width="76" height="76" preserveAspectRatio="xMidYMid slice" clip-path="url(#logoCircleClip)" />`
          : `<!-- Fallback vector emblem -->
             <circle cx="40" cy="40" r="36" fill="#181413" />
             <path d="M26 50h28v-4H26v4zm27-18-5.5 4-5.5-10-5.5 10L31 32l3 12h20l3-12z" fill="#c5a059" />`
      }
    </g>

    <!-- Salon Text Information -->
    <g transform="translate(100, 5)">
      <!-- Salon Name -->
      <text x="0" y="22" class="font-serif txt-dark" font-size="22" font-weight="bold" letter-spacing="0.5">
        ${safeSalon}
      </text>

      <!-- Subtitle Tagline -->
      <text x="0" y="40" class="font-sans txt-gold" font-size="10" font-weight="600" letter-spacing="1.5">
        PROFESSIONAL HAIR &amp; BEAUTY SALON AND ACADEMY
      </text>

      <!-- Address with LocationOn MUI Icon -->
      <g transform="translate(0, 48) scale(0.62)">
        <path d="${MUI_SVG_PATHS.locationOn}" fill="#c5a059" />
      </g>
      <text x="18" y="58" class="font-sans txt-muted" font-size="10.5">
        ${safeAddress}
      </text>

      <!-- Contact Line with Phone, WhatsApp & Email MUI Icons -->
      <g transform="translate(0, 68)">
        <!-- Phone -->
        <g transform="translate(0, 0) scale(0.62)">
          <path d="${MUI_SVG_PATHS.phone}" fill="#c5a059" />
        </g>
        <text x="18" y="10" class="font-sans txt-dark" font-size="10.5" font-weight="600">
          ${safeSalonPhone}
        </text>

        <text x="120" y="10" class="font-sans txt-muted" font-size="10">•</text>

        <!-- WhatsApp -->
        <g transform="translate(135, 0) scale(0.62)">
          <path d="${MUI_SVG_PATHS.whatsApp}" fill="#2e6b46" />
        </g>
        <text x="153" y="10" class="font-sans txt-green" font-size="10.5" font-weight="600">
          WhatsApp: ${safeSalonPhone}
        </text>

        <text x="315" y="10" class="font-sans txt-muted" font-size="10">•</text>

        <!-- Email -->
        <g transform="translate(330, 0) scale(0.62)">
          <path d="${MUI_SVG_PATHS.email}" fill="#c5a059" />
        </g>
        <text x="348" y="10" class="font-sans txt-muted" font-size="10.5">
          ${safeSalonEmail}
        </text>
      </g>
    </g>

    <!-- Header Divider Line -->
    <line x1="0" y1="102" x2="670" y2="102" stroke="#e8e1d5" stroke-width="1" />
  </g>

  <!-- ==================== STATUS BANNER (billStatusBanner) ==================== -->
  <g transform="translate(65, 185)">
    <rect width="670" height="60" rx="8" fill="#f7f1e5" stroke="#c5a059" stroke-width="1" />

    <!-- Left: Verified Status Badge -->
    <g transform="translate(16, 17) scale(1.15)">
      <path d="${MUI_SVG_PATHS.verified}" fill="#2e6b46" />
    </g>
    <text x="50" y="32" class="font-sans txt-green" font-size="13.5" font-weight="bold" letter-spacing="1">
      SLOT CONFIRMED
    </text>
    <text x="50" y="48" class="font-sans txt-muted" font-size="11">
      Issued on: ${safeDateIssued}
    </text>

    <!-- Right: Booking Reference -->
    <text x="650" y="28" text-anchor="end" class="font-sans txt-muted" font-size="10" font-weight="bold" letter-spacing="1">
      BOOKING REF #
    </text>
    <text x="650" y="49" text-anchor="end" class="font-mono txt-dark" font-size="18" font-weight="bold" letter-spacing="1">
      ${safeRef}
    </text>
  </g>

  <!-- ==================== ITEM ROWS (billDetailsTable) ==================== -->
  <g transform="translate(65, 275)">
    <!-- Row 1: Client Name -->
    <text x="15" y="24" class="font-sans txt-muted" font-size="12.5">Client / Guest Name:</text>
    <text x="655" y="24" text-anchor="end" class="font-sans txt-dark" font-size="14.5" font-weight="bold">${safeName}</text>
    <line x1="15" y1="38" x2="655" y2="38" stroke="#e8e1d5" stroke-dasharray="4 4" />

    <!-- Row 2: Phone / WhatsApp -->
    <text x="15" y="66" class="font-sans txt-muted" font-size="12.5">Phone / WhatsApp:</text>
    <text x="655" y="66" text-anchor="end" class="font-sans txt-dark" font-size="14" font-weight="600">${safePhone}</text>
    <line x1="15" y1="80" x2="655" y2="80" stroke="#e8e1d5" stroke-dasharray="4 4" />

    <!-- Row 3: Email Address (if present) -->
    ${
      safeEmail
        ? `
      <text x="15" y="108" class="font-sans txt-muted" font-size="12.5">Email Address:</text>
      <text x="655" y="108" text-anchor="end" class="font-sans txt-dark" font-size="13.5">${safeEmail}</text>
      <line x1="15" y1="122" x2="655" y2="122" stroke="#e8e1d5" stroke-dasharray="4 4" />
    `
        : ""
    }

    <!-- Dynamic Y-offset based on email presence -->
    <g transform="translate(0, ${safeEmail ? 42 : 0})">
      <!-- Row 4: Reserved Service -->
      <text x="15" y="108" class="font-sans txt-muted" font-size="12.5">Reserved Service:</text>
      <text x="655" y="108" text-anchor="end" class="font-sans txt-dark" font-size="14.5" font-weight="bold">
        ${safeService} <tspan class="txt-muted" font-size="11.5" font-weight="normal">(${safeCategory})</tspan>
      </text>
      <line x1="15" y1="122" x2="655" y2="122" stroke="#e8e1d5" stroke-dasharray="4 4" />

      <!-- Row 5: Appointment Schedule -->
      <text x="15" y="150" class="font-sans txt-muted" font-size="12.5">Appointment Schedule:</text>
      <text x="655" y="150" text-anchor="end" class="font-sans txt-dark" font-size="15" font-weight="bold">
        ${safeDate} at ${safeTime}
      </text>
      <line x1="15" y1="164" x2="655" y2="164" stroke="#e8e1d5" stroke-dasharray="4 4" />

      <!-- Row 6: Price / Fees -->
      <text x="15" y="192" class="font-sans txt-muted" font-size="12.5">Price / Fees (Estimate):</text>
      <text x="655" y="192" text-anchor="end" class="font-sans txt-gold" font-size="18" font-weight="bold">
        ${safePrice}
      </text>
      <line x1="15" y1="206" x2="655" y2="206" stroke="#e8e1d5" stroke-dasharray="4 4" />

      <!-- Row 7: Payment Terms -->
      <text x="15" y="234" class="font-sans txt-muted" font-size="12.5">Payment Terms:</text>
      <text x="655" y="234" text-anchor="end" class="font-sans txt-green" font-size="13" font-weight="600">
        Pay at Salon (Cash / UPI / Card / No Advance Needed)
      </text>
      <line x1="15" y1="248" x2="655" y2="248" stroke="#e8e1d5" stroke-dasharray="4 4" />

      <!-- Row 8: Client Notes (if present) -->
      ${
        safeNotes
          ? `
        <text x="15" y="276" class="font-sans txt-muted" font-size="12.5">Client Notes / Length:</text>
        <text x="655" y="276" text-anchor="end" class="font-sans txt-dark" font-size="13">${safeNotes}</text>
        <line x1="15" y1="290" x2="655" y2="290" stroke="#e8e1d5" stroke-dasharray="4 4" />
      `
          : ""
      }

      <!-- Row 9: Salon Venue -->
      <g transform="translate(0, ${safeNotes ? 42 : 0})">
        <text x="15" y="276" class="font-sans txt-muted" font-size="12.5">Salon Venue:</text>
        <text x="655" y="276" text-anchor="end" class="font-sans txt-dark" font-size="13" font-weight="600">
          ${safeAddress}
        </text>
      </g>
    </g>
  </g>

  <!-- ==================== FOOTER SEAL & NOTICE (billFooterNotice) ==================== -->
  <g transform="translate(65, 870)">
    <!-- Top separator line -->
    <line x1="0" y1="0" x2="670" y2="0" stroke="#e8e1d5" stroke-width="1" />

    <!-- Left: Important instructions note -->
    <g transform="translate(0, 18)">
      <text x="0" y="16" class="font-sans txt-dark" font-size="12" font-weight="bold">
        Important Instructions:
      </text>
      <text x="0" y="36" class="font-sans txt-muted" font-size="11">
        Please arrive 5-10 minutes prior to your scheduled time. Zero cancellation fee.
      </text>
      <text x="0" y="54" class="font-sans txt-muted" font-size="11">
        Contact concierge at ${safeSalonPhone} for any special requirements or assistance.
      </text>
      <text x="0" y="72" class="font-sans txt-muted" font-size="11">
        Present this confirmation slip on your mobile phone on arrival.
      </text>
    </g>

    <!-- Right: Verified Seal Stamp Box (billSealBox) -->
    <g transform="translate(520, 15)">
      <rect width="150" height="70" rx="6" fill="#f7f1e5" stroke="#c5a059" stroke-width="1.5" stroke-dasharray="4 4" />
      <g transform="translate(65, 12) scale(0.9)">
        <path d="${MUI_SVG_PATHS.verified}" fill="#c5a059" />
      </g>
      <text x="75" y="44" text-anchor="middle" class="font-sans txt-dark" font-size="9" font-weight="bold" letter-spacing="1">
        OFFICIALLY VERIFIED
      </text>
      <text x="75" y="58" text-anchor="middle" class="font-sans txt-gold" font-size="8.5" font-weight="bold">
        ${safeSalon.toUpperCase()}
      </text>
    </g>
  </g>

  <!-- Legal & Hospitality Bottom Line -->
  <text x="400" y="1015" text-anchor="middle" class="font-sans txt-muted" font-size="10.5">
    Thank you for choosing ${safeSalon}. Luxury beauty crafted exclusively for you.
  </text>
</svg>
`.trim();
}
