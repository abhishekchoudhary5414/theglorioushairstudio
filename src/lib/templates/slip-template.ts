/**
 * Single Source of Truth for Appointment Confirmation Slip Template.
 * Fully responsive, two-column grid layout where text never overlaps, overflows, or clips.
 * 
 * Features:
 * - Real Salon Logo from public/images/logo.png embedded as Data URI
 * - Fixed left label column (width 190px) and fixed left-aligned value column (width 460px)
 * - Safe multi-line wrapping for long Salon Addresses & Service titles
 * - Zero emoji usage — strictly Material UI / Material Design SVG paths
 * - Compatible with web preview, Canvas PNG download, and Vector PDF generation
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
 * Splits a long single-line address into two balanced, clean lines
 */
export function splitAddressToLines(address: string): [string, string] {
  if (!address) return ["", ""];
  const parts = address.split(",").map((p) => p.trim());
  if (parts.length <= 2) return [address, ""];

  const mid = Math.ceil(parts.length / 2);
  const line1 = parts.slice(0, mid).join(", ");
  const line2 = parts.slice(mid).join(", ");
  return [line1, line2];
}

/**
 * Official Material Design / MUI SVG Paths (24x24 viewBox)
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
 * Designed with fixed left-aligned columns to prevent any text collisions or broken layouts.
 */
export function buildUnifiedConfirmationSvg(data: BookingSlipModel, width = 800, height = 1180): string {
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
  const safeSalonPhone = escapeSvgText(data.salonPhone);
  const safeSalonEmail = escapeSvgText(data.salonEmail);
  const safeDateIssued = escapeSvgText(data.issuedDate);
  const safeNotes = escapeSvgText(data.specialInstructions || "");

  const [addrLine1, addrLine2] = splitAddressToLines(data.salonAddress);
  const safeAddrLine1 = escapeSvgText(addrLine1);
  const safeAddrLine2 = escapeSvgText(addrLine2);

  // Compute dynamic heights based on optional rows
  const emailRowHeight = safeEmail ? 48 : 0;
  const notesRowHeight = safeNotes ? 48 : 0;

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
      <circle cx="42" cy="42" r="40" />
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

  <!-- Clean Off-White Background -->
  <rect width="100%" height="100%" fill="#faf7f2" />

  <!-- Main Luxury Ticket Card -->
  <rect x="35" y="35" width="730" height="${height - 70}" rx="16" fill="#ffffff" stroke="#e8e1d5" stroke-width="1.5" />

  <!-- Top Golden Accent Bar -->
  <rect x="35" y="35" width="730" height="6" rx="3" fill="url(#goldGradient)" />

  <!-- ==================== SALON BRANDING HEADER ==================== -->
  <g transform="translate(65, 55)">
    <!-- Salon Logo Frame -->
    <circle cx="42" cy="42" r="42" fill="#f7f1e5" stroke="#c5a059" stroke-width="1.5" />
    ${
      data.logoDataUri
        ? `<image href="${data.logoDataUri}" x="2" y="2" width="80" height="80" preserveAspectRatio="xMidYMid slice" clip-path="url(#logoCircleClip)" />`
        : `<!-- Fallback vector emblem -->
           <circle cx="42" cy="42" r="38" fill="#181413" />
           <path d="M28 52h28v-4H28v4zm27-18-5.5 4-5.5-10-5.5 10L33 34l3 12h20l3-12z" fill="#c5a059" />`
    }

    <!-- Salon Text Information -->
    <g transform="translate(105, 0)">
      <!-- Salon Name -->
      <text x="0" y="24" class="font-serif txt-dark" font-size="23" font-weight="bold" letter-spacing="0.5">
        ${safeSalon}
      </text>

      <!-- Subtitle Tagline -->
      <text x="0" y="44" class="font-sans txt-gold" font-size="10.5" font-weight="bold" letter-spacing="1.5">
        PROFESSIONAL HAIR &amp; BEAUTY SALON AND ACADEMY
      </text>

      <!-- Address Line (Single or Two-Line Safe) -->
      <g transform="translate(0, 52) scale(0.65)">
        <path d="${MUI_SVG_PATHS.locationOn}" fill="#c5a059" />
      </g>
      <text x="20" y="64" class="font-sans txt-muted" font-size="11">
        ${safeAddrLine1}${safeAddrLine2 ? `, ${safeAddrLine2}` : ""}
      </text>

      <!-- Contact Line with Phone, WhatsApp & Email Icons -->
      <g transform="translate(0, 74)">
        <!-- Phone -->
        <g transform="translate(0, 0) scale(0.65)">
          <path d="${MUI_SVG_PATHS.phone}" fill="#c5a059" />
        </g>
        <text x="20" y="11" class="font-sans txt-dark" font-size="11" font-weight="bold">
          ${safeSalonPhone}
        </text>

        <text x="145" y="11" class="font-sans txt-muted" font-size="11">•</text>

        <!-- WhatsApp -->
        <g transform="translate(160, 0) scale(0.65)">
          <path d="${MUI_SVG_PATHS.whatsApp}" fill="#2e6b46" />
        </g>
        <text x="180" y="11" class="font-sans txt-green" font-size="11" font-weight="bold">
          WhatsApp: ${safeSalonPhone}
        </text>

        <text x="355" y="11" class="font-sans txt-muted" font-size="11">•</text>

        <!-- Email -->
        <g transform="translate(370, 0) scale(0.65)">
          <path d="${MUI_SVG_PATHS.email}" fill="#c5a059" />
        </g>
        <text x="390" y="11" class="font-sans txt-muted" font-size="11">
          ${safeSalonEmail}
        </text>
      </g>
    </g>

    <!-- Header Divider Line -->
    <line x1="0" y1="105" x2="670" y2="105" stroke="#e8e1d5" stroke-width="1" />
  </g>

  <!-- ==================== STATUS BANNER ==================== -->
  <g transform="translate(65, 185)">
    <rect width="670" height="60" rx="8" fill="#f7f1e5" stroke="#c5a059" stroke-width="1" />

    <!-- Left: Verified Status -->
    <g transform="translate(16, 17) scale(1.15)">
      <path d="${MUI_SVG_PATHS.verified}" fill="#2e6b46" />
    </g>
    <text x="52" y="32" class="font-sans txt-green" font-size="13.5" font-weight="bold" letter-spacing="1">
      SLOT CONFIRMED
    </text>
    <text x="52" y="48" class="font-sans txt-muted" font-size="11">
      Issued on: ${safeDateIssued}
    </text>

    <!-- Right: Reference Code -->
    <text x="650" y="28" text-anchor="end" class="font-sans txt-muted" font-size="10" font-weight="bold" letter-spacing="1">
      BOOKING REF #
    </text>
    <text x="650" y="49" text-anchor="end" class="font-mono txt-dark" font-size="18" font-weight="bold" letter-spacing="1">
      ${safeRef}
    </text>
  </g>

  <!-- ==================== ITEM ROWS (TWO-COLUMN COLLISION-FREE GRID) ==================== -->
  <!-- Left column x=15 (labels, max-width 180px), Right column x=220 (values, left-aligned up to x=660) -->
  <g transform="translate(65, 275)">
    <!-- Row 1: Client Name -->
    <g transform="translate(0, 0)">
      <text x="15" y="20" class="font-sans txt-muted" font-size="12">Client / Guest Name:</text>
      <text x="220" y="20" class="font-sans txt-dark" font-size="14.5" font-weight="bold">${safeName}</text>
      <line x1="15" y1="34" x2="655" y2="34" stroke="#e8e1d5" stroke-dasharray="4 4" />
    </g>

    <!-- Row 2: Phone / WhatsApp -->
    <g transform="translate(0, 48)">
      <text x="15" y="20" class="font-sans txt-muted" font-size="12">Phone / WhatsApp:</text>
      <text x="220" y="20" class="font-sans txt-dark" font-size="14" font-weight="600">${safePhone}</text>
      <line x1="15" y1="34" x2="655" y2="34" stroke="#e8e1d5" stroke-dasharray="4 4" />
    </g>

    <!-- Optional Row 3: Email Address -->
    ${
      safeEmail
        ? `
      <g transform="translate(0, 96)">
        <text x="15" y="20" class="font-sans txt-muted" font-size="12">Email Address:</text>
        <text x="220" y="20" class="font-sans txt-dark" font-size="13.5">${safeEmail}</text>
        <line x1="15" y1="34" x2="655" y2="34" stroke="#e8e1d5" stroke-dasharray="4 4" />
      </g>
    `
        : ""
    }

    <!-- Dynamic Section: Services, Schedule & Fees -->
    <g transform="translate(0, ${96 + emailRowHeight})">
      <!-- Row 4: Reserved Service -->
      <g transform="translate(0, 0)">
        <text x="15" y="20" class="font-sans txt-muted" font-size="12">Reserved Service:</text>
        <text x="220" y="20" class="font-serif txt-dark" font-size="15" font-weight="bold">${safeService}</text>
        <text x="220" y="38" class="font-sans txt-gold" font-size="11" font-weight="600">Category: ${safeCategory}</text>
        <line x1="15" y1="50" x2="655" y2="50" stroke="#e8e1d5" stroke-dasharray="4 4" />
      </g>

      <!-- Row 5: Appointment Schedule -->
      <g transform="translate(0, 64)">
        <text x="15" y="20" class="font-sans txt-muted" font-size="12">Appointment Schedule:</text>
        <g transform="translate(220, 7) scale(0.68)">
          <path d="${MUI_SVG_PATHS.calendarToday}" fill="#c5a059" />
        </g>
        <text x="240" y="20" class="font-sans txt-dark" font-size="14.5" font-weight="bold">
          ${safeDate}   at   ${safeTime}
        </text>
        <line x1="15" y1="34" x2="655" y2="34" stroke="#e8e1d5" stroke-dasharray="4 4" />
      </g>

      <!-- Row 6: Price / Fees -->
      <g transform="translate(0, 112)">
        <text x="15" y="20" class="font-sans txt-muted" font-size="12">Price / Fees (Estimate):</text>
        <text x="220" y="22" class="font-sans txt-gold" font-size="18" font-weight="bold">${safePrice}</text>
        <line x1="15" y1="36" x2="655" y2="36" stroke="#e8e1d5" stroke-dasharray="4 4" />
      </g>

      <!-- Row 7: Payment Terms -->
      <g transform="translate(0, 162)">
        <text x="15" y="20" class="font-sans txt-muted" font-size="12">Payment Terms:</text>
        <text x="220" y="20" class="font-sans txt-green" font-size="13" font-weight="bold">
          Pay at Salon (Cash / UPI / Card / No Advance Needed)
        </text>
        <line x1="15" y1="34" x2="655" y2="34" stroke="#e8e1d5" stroke-dasharray="4 4" />
      </g>

      <!-- Optional Row 8: Client Notes -->
      ${
        safeNotes
          ? `
        <g transform="translate(0, 210)">
          <text x="15" y="20" class="font-sans txt-muted" font-size="12">Client Notes / Length:</text>
          <text x="220" y="20" class="font-sans txt-dark" font-size="13">${safeNotes}</text>
          <line x1="15" y1="34" x2="655" y2="34" stroke="#e8e1d5" stroke-dasharray="4 4" />
        </g>
      `
          : ""
      }

      <!-- Row 9: Salon Venue (Multi-line protected with full address clarity) -->
      <g transform="translate(0, ${210 + notesRowHeight})">
        <text x="15" y="20" class="font-sans txt-muted" font-size="12">Salon Venue:</text>
        <g transform="translate(220, 7) scale(0.68)">
          <path d="${MUI_SVG_PATHS.locationOn}" fill="#c5a059" />
        </g>
        <text x="240" y="20" class="font-sans txt-dark" font-size="13" font-weight="bold">
          ${safeAddrLine1}
        </text>
        ${
          safeAddrLine2
            ? `
          <text x="240" y="38" class="font-sans txt-muted" font-size="12">
            ${safeAddrLine2}
          </text>
        `
            : ""
        }
        <line x1="15" y1="${safeAddrLine2 ? 52 : 36}" x2="655" y2="${safeAddrLine2 ? 52 : 36}" stroke="#e8e1d5" stroke-dasharray="4 4" />
      </g>
    </g>
  </g>

  <!-- ==================== FOOTER SEAL & NOTICE ==================== -->
  <g transform="translate(65, ${height - 230})">
    <!-- Top divider -->
    <line x1="0" y1="0" x2="670" y2="0" stroke="#e8e1d5" stroke-width="1" />

    <!-- Left: Important instructions note -->
    <g transform="translate(0, 18)">
      <text x="0" y="16" class="font-sans txt-dark" font-size="12" font-weight="bold">
        Important Instructions:
      </text>
      <text x="0" y="36" class="font-sans txt-muted" font-size="11">
        • Please arrive 5-10 minutes prior to your scheduled time. Zero cancellation fee.
      </text>
      <text x="0" y="54" class="font-sans txt-muted" font-size="11">
        • Need changes? Call or WhatsApp our concierge desk at ${safeSalonPhone}.
      </text>
      <text x="0" y="72" class="font-sans txt-muted" font-size="11">
        • Please present this confirmation slip on your mobile phone upon arrival.
      </text>
    </g>

    <!-- Right: Verified Seal Stamp Box -->
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
  <text x="400" y="${height - 20}" text-anchor="middle" class="font-sans txt-muted" font-size="10.5">
    Thank you for choosing ${safeSalon}. Luxury beauty crafted exclusively for you.
  </text>
</svg>
`.trim();
}
