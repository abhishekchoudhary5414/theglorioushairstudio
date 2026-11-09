/**
 * Client-side direct PDF & Image generator for appointment confirmation slips.
 * - Format "pdf": Generates a valid standard single-page PDF binary file and downloads it immediately.
 * - Format "image": Generates a crisp 2x retina PNG image file and downloads it immediately.
 * Zero popups, zero print dialogs, instant download.
 */

export interface ConfirmationSlipData {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  categoryTitle: string;
  appointmentDate: string;
  timeSlot: string;
  priceDisplay: string;
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  salonEmail: string;
  specialInstructions?: string;
  issuedDate: string;
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Builds the official SVG vector markup for the confirmation ticket
 */
export function buildSlipSvg(data: ConfirmationSlipData, width = 800, height = 1050): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#181413" />
      <stop offset="50%" stop-color="#2c2523" />
      <stop offset="100%" stop-color="#181413" />
    </linearGradient>
    <linearGradient id="goldBar" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#c5a059" />
      <stop offset="50%" stop-color="#f7f1e5" />
      <stop offset="100%" stop-color="#c5a059" />
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#000000" flood-opacity="0.08" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="100%" height="100%" fill="#faf7f2" />

  <!-- Main Luxury Ticket Card -->
  <rect x="40" y="40" width="720" height="970" rx="16" fill="#ffffff" stroke="#e8e1d5" stroke-width="1.5" filter="url(#shadow)" />

  <!-- Top Golden Accent Bar -->
  <rect x="40" y="40" width="720" height="8" rx="4" fill="url(#goldBar)" />

  <!-- Header Banner -->
  <rect x="40" y="48" width="720" height="150" fill="url(#headerGrad)" />

  <!-- Header Text -->
  <text x="75" y="105" font-family="'Playfair Display', Georgia, serif" font-size="28" font-weight="700" fill="#f7f1e5" letter-spacing="1">
    ${escapeXml(data.salonName.toUpperCase())}
  </text>
  <text x="75" y="132" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" font-weight="600" fill="#c5a059" letter-spacing="3">
    PROFESSIONAL HAIR &amp; BEAUTY SALON AND ACADEMY
  </text>
  <text x="75" y="158" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11" fill="#e8e1d5">
    📍 ${escapeXml(data.salonAddress)}
  </text>
  <text x="75" y="178" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11" fill="#c5a059">
    📞 ${escapeXml(data.salonPhone)}  •  ✉️ ${escapeXml(data.salonEmail)}
  </text>

  <!-- Status Bar Banner -->
  <rect x="65" y="218" width="670" height="56" rx="8" fill="#f7f1e5" stroke="#c5a059" stroke-width="1" />
  <circle cx="95" cy="246" r="12" fill="#2e6b46" />
  <text x="91" y="251" font-family="Arial, sans-serif" font-size="14" font-weight="bold" fill="#ffffff">✓</text>
  <text x="118" y="244" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="700" fill="#2e6b46" letter-spacing="1">
    APPOINTMENT CONFIRMED
  </text>
  <text x="118" y="260" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10.5" fill="#69605b">
    Official Booking Slip Issued on ${escapeXml(data.issuedDate)}
  </text>

  <text x="715" y="242" text-anchor="end" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10" font-weight="600" fill="#968c85" letter-spacing="1">
    BOOKING REFERENCE #
  </text>
  <text x="715" y="262" text-anchor="end" font-family="monospace, Courier" font-size="18" font-weight="800" fill="#181413" letter-spacing="1.5">
    ${escapeXml(data.bookingRef)}
  </text>

  <!-- Section 1: Customer & Schedule Summary -->
  <g transform="translate(65, 300)">
    <!-- Client Name -->
    <text x="10" y="22" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#69605b">Guest / Client Name</text>
    <text x="10" y="44" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="16" font-weight="700" fill="#1f1b19">${escapeXml(data.customerName)}</text>
    <line x1="10" y1="58" x2="660" y2="58" stroke="#f0ebe1" stroke-dasharray="4 4" />

    <!-- Phone & Contact -->
    <text x="10" y="80" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#69605b">Phone / WhatsApp</text>
    <text x="10" y="102" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="15" font-weight="600" fill="#1f1b19">${escapeXml(data.customerPhone)}</text>

    ${data.customerEmail ? `
      <text x="360" y="80" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#69605b">Email Address</text>
      <text x="360" y="102" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="14" font-weight="500" fill="#1f1b19">${escapeXml(data.customerEmail)}</text>
    ` : ""}
    <line x1="10" y1="116" x2="660" y2="116" stroke="#f0ebe1" stroke-dasharray="4 4" />

    <!-- Service Selected -->
    <text x="10" y="138" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#69605b">Reserved Salon Service</text>
    <text x="10" y="160" font-family="'Playfair Display', Georgia, serif" font-size="18" font-weight="700" fill="#181413">${escapeXml(data.serviceName)}</text>
    <text x="10" y="178" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11" fill="#c5a059" font-weight="600">Category: ${escapeXml(data.categoryTitle)}</text>
    <line x1="10" y1="192" x2="660" y2="192" stroke="#f0ebe1" stroke-dasharray="4 4" />

    <!-- Schedule Date & Time -->
    <text x="10" y="214" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#69605b">Appointment Schedule</text>
    <text x="10" y="238" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="17" font-weight="700" fill="#181413">
      🗓️ ${escapeXml(data.appointmentDate)}  at  ⏰ ${escapeXml(data.timeSlot)}
    </text>
    <line x1="10" y1="252" x2="660" y2="252" stroke="#f0ebe1" stroke-dasharray="4 4" />

    <!-- Price / Fees -->
    <text x="10" y="274" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#69605b">Estimated Price / Fees</text>
    <text x="10" y="298" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="20" font-weight="800" fill="#c5a059">${escapeXml(data.priceDisplay)}</text>

    <!-- Payment Terms -->
    <text x="360" y="274" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#69605b">Payment Policy</text>
    <text x="360" y="296" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13" font-weight="600" fill="#2e6b46">Pay at Salon (Cash / UPI / Card)</text>
    <text x="360" y="312" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11" fill="#69605b">Zero Advance Payment Required</text>
    <line x1="10" y1="328" x2="660" y2="328" stroke="#f0ebe1" stroke-dasharray="4 4" />

    <!-- Location Venue -->
    <text x="10" y="350" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#69605b">Salon Venue</text>
    <text x="10" y="372" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="13.5" font-weight="600" fill="#1f1b19">
      Scheme No 78, Yashraj Complex, Sector C, Aranya Nagar, Vijay Nagar, Indore
    </text>
    <text x="10" y="390" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11" fill="#69605b">
      Open all 7 days from 10:00 AM to 09:00 PM
    </text>

    ${data.specialInstructions ? `
      <line x1="10" y1="406" x2="660" y2="406" stroke="#f0ebe1" stroke-dasharray="4 4" />
      <text x="10" y="426" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" fill="#69605b">Client Special Request / Notes</text>
      <text x="10" y="446" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="12" font-weight="500" fill="#1f1b19">${escapeXml(data.specialInstructions)}</text>
    ` : ""}
  </g>

  <!-- Important Notice & Official Seal Footer -->
  <g transform="translate(65, 830)">
    <rect width="670" height="90" rx="8" fill="#f5f0e6" stroke="#e8e1d5" stroke-width="1" />
    <text x="20" y="32" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="11.5" font-weight="700" fill="#181413">
      📌 CLIENT INSTRUCTIONS:
    </text>
    <text x="20" y="52" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10.5" fill="#69605b">
      • Please arrive 5-10 minutes prior to your reserved slot.
    </text>
    <text x="20" y="70" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="10.5" fill="#69605b">
      • To reschedule or share hair photos, contact our concierge at +91 79875 83445.
    </text>

    <!-- Official Verified Badge Box -->
    <rect x="520" y="16" width="130" height="58" rx="6" fill="#ffffff" stroke="#c5a059" stroke-width="1.5" stroke-dasharray="3 3" />
    <text x="585" y="38" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="9" font-weight="800" fill="#c5a059" letter-spacing="1">
      OFFICIALLY VERIFIED
    </text>
    <text x="585" y="56" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="8.5" font-weight="600" fill="#181413">
      THE GLORIOUS
    </text>
  </g>

  <!-- Bottom Legal Strip -->
  <text x="400" y="975" text-anchor="middle" font-family="'Plus Jakarta Sans', Arial, sans-serif" font-size="9.5" fill="#968c85">
    Thank you for choosing ${escapeXml(data.salonName)}. We look forward to creating your glorious beauty experience.
  </text>
</svg>
  `.trim();
}

/**
 * Renders the vector SVG to an offscreen high-res HTML5 Canvas
 */
async function renderSvgToCanvas(svgMarkup: string, width = 800, height = 1050): Promise<HTMLCanvasElement> {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = 2; // Retina quality
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not create canvas 2d context");

        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        URL.revokeObjectURL(url);
        resolve(canvas);
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };
    img.src = url;
  });
}

/**
 * Downloads the Confirmation Slip as an Image (PNG)
 */
export async function downloadSlipAsImage(data: ConfirmationSlipData): Promise<void> {
  const width = 800;
  const height = 1050;
  const svg = buildSlipSvg(data, width, height);
  const canvas = await renderSvgToCanvas(svg, width, height);

  await new Promise<void>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Image blob creation failed"));
          return;
        }
        const fileUrl = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = fileUrl;
        a.download = `The-Glorious-Hair-Studio-Slip-${data.bookingRef}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        setTimeout(() => URL.revokeObjectURL(fileUrl), 1000);
        resolve();
      },
      "image/png",
      1.0
    );
  });
}

/**
 * Constructs a binary single-page PDF with the rendered slip embedded
 * Downloads directly as .pdf without opening print dialogs
 */
export async function downloadSlipAsPdf(data: ConfirmationSlipData): Promise<void> {
  const width = 800;
  const height = 1050;
  const svg = buildSlipSvg(data, width, height);
  const canvas = await renderSvgToCanvas(svg, width, height);

  // Convert canvas to JPEG data for PDF compression
  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.95);
  const base64Data = jpegDataUrl.split(",")[1];
  const binaryJpeg = atob(base64Data);
  const jpegLength = binaryJpeg.length;

  // Convert binary string to Uint8Array
  const jpegBytes = new Uint8Array(jpegLength);
  for (let i = 0; i < jpegLength; i++) {
    jpegBytes[i] = binaryJpeg.charCodeAt(i);
  }

  // Standard A4 / Slip Points (595.28 x 841.89 pt)
  const pageWidth = 595;
  const pageHeight = 780;

  // Assemble standard valid PDF 1.4 document
  const pdfHeader = "%PDF-1.4\n";

  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`;

  const streamContent = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im1 Do\nQ\n`;
  const obj4 = `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}endstream\nendobj\n`;

  const obj5Header = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegLength} >>\nstream\n`;
  const obj5Footer = "\nendstream\nendobj\n";

  // Calculate byte offsets for cross-reference table
  const encoder = new TextEncoder();
  const bHeader = encoder.encode(pdfHeader);
  const bObj1 = encoder.encode(obj1);
  const bObj2 = encoder.encode(obj2);
  const bObj3 = encoder.encode(obj3);
  const bObj4 = encoder.encode(obj4);
  const bObj5Header = encoder.encode(obj5Header);
  const bObj5Footer = encoder.encode(obj5Footer);

  const offset1 = bHeader.length;
  const offset2 = offset1 + bObj1.length;
  const offset3 = offset2 + bObj2.length;
  const offset4 = offset3 + bObj3.length;
  const offset5 = offset4 + bObj4.length;
  const offsetEndObj5 = offset5 + bObj5Header.length + jpegLength + bObj5Footer.length;

  const pad = (num: number) => num.toString().padStart(10, "0");

  const xref = `xref\n0 6\n0000000000 65535 f \n${pad(offset1)} 00000 n \n${pad(offset2)} 00000 n \n${pad(offset3)} 00000 n \n${pad(offset4)} 00000 n \n${pad(offset5)} 00000 n \n`;
  const trailer = `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${offsetEndObj5}\n%%EOF\n`;
  const bXref = encoder.encode(xref);
  const bTrailer = encoder.encode(trailer);

  // Combine into single PDF Blob
  const pdfBlob = new Blob(
    [
      bHeader,
      bObj1,
      bObj2,
      bObj3,
      bObj4,
      bObj5Header,
      jpegBytes,
      bObj5Footer,
      bXref,
      bTrailer
    ],
    { type: "application/pdf" }
  );

  // Trigger immediate file download
  const downloadUrl = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `The-Glorious-Hair-Studio-Booking-${data.bookingRef}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
