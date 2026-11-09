/**
 * Server-side vector PDF generator for email attachments.
 * Generates an official, standard single-page PDF Buffer using pure PDF 1.4 specification
 * without heavy headless browser dependencies, ensuring lightning-fast SMTP email delivery.
 */

export interface BookingPdfSlipData {
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  serviceName: string;
  appointmentDate: string;
  timeSlot: string;
  priceDisplay: string;
  salonName: string;
  salonAddress: string;
  salonPhone: string;
  salonEmail: string;
  issuedDate: string;
}

function escapePdfText(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

export function generateBookingSlipPdfBuffer(data: BookingPdfSlipData): Buffer {
  const width = 595; // A4 standard width (pt)
  const height = 842; // A4 standard height (pt)

  // Direct clean vector stream using standard Helvetica/Times fonts
  let contentStream = `
q
% Background Alabaster Wash
0.98 0.969 0.949 rg
0 0 ${width} ${height} re f

% Main Luxury White Slip Box
1 1 1 rg
40 40 515 762 re f
0.91 0.882 0.835 RG
1.5 w
40 40 515 762 re s

% Top Gold Luxury Accent Bar
0.773 0.627 0.349 rg
40 794 515 8 re f

% Header Noir Banner
0.094 0.078 0.075 rg
40 670 515 124 re f

% Header Typography
BT
/F2 22 Tf
0.969 0.945 0.898 rg
65 745 Td
(${escapePdfText(data.salonName.toUpperCase())}) Tj
ET

BT
/F1 9 Tf
0.773 0.627 0.349 rg
65 725 Td
(PROFESSIONAL HAIR & BEAUTY SALON AND ACADEMY) Tj
ET

BT
/F1 8.5 Tf
0.91 0.882 0.835 rg
65 705 Td
(Address: ${escapePdfText(data.salonAddress)}) Tj
ET

BT
/F1 8.5 Tf
0.773 0.627 0.349 rg
65 688 Td
(Phone: ${escapePdfText(data.salonPhone)}   |   Email: ${escapePdfText(data.salonEmail)}) Tj
ET

% Confirmation Status Ribbon
0.969 0.945 0.898 rg
60 610 475 42 re f
0.773 0.627 0.349 RG
1 w
60 610 475 42 re s

BT
/F1 11 Tf
0.18 0.42 0.27 rg
80 626 Td
([VERIFIED] APPOINTMENT CONFIRMED) Tj
ET

BT
/F1 8 Tf
0.412 0.376 0.357 rg
270 627 Td
(Issued on ${escapePdfText(data.issuedDate)}) Tj
ET

BT
/F1 12 Tf
0.094 0.078 0.075 rg
410 626 Td
(REF: ${escapePdfText(data.bookingRef)}) Tj
ET

% Data Grid Lines & Labels
0.941 0.922 0.882 RG
0.75 w
60 565 475 0.1 re s
60 515 475 0.1 re s
60 465 475 0.1 re s
60 415 475 0.1 re s
60 365 475 0.1 re s
60 315 475 0.1 re s

% Field 1: Customer Name
BT
/F1 9 Tf
0.412 0.376 0.357 rg
75 580 Td
(Client Name:) Tj
/F1 11 Tf
0.122 0.106 0.098 rg
200 580 Td
(${escapePdfText(data.customerName)}) Tj
ET

% Field 2: Phone & Email
BT
/F1 9 Tf
0.412 0.376 0.357 rg
75 530 Td
(Phone / WhatsApp:) Tj
/F1 10.5 Tf
0.122 0.106 0.098 rg
200 530 Td
(${escapePdfText(data.customerPhone)}) Tj
ET

% Field 3: Reserved Service
BT
/F1 9 Tf
0.412 0.376 0.357 rg
75 480 Td
(Reserved Service:) Tj
/F2 12 Tf
0.094 0.078 0.075 rg
200 480 Td
(${escapePdfText(data.serviceName)}) Tj
ET

% Field 4: Appointment Schedule
BT
/F1 9 Tf
0.412 0.376 0.357 rg
75 430 Td
(Appointment Schedule:) Tj
/F1 11 Tf
0.094 0.078 0.075 rg
200 430 Td
(${escapePdfText(data.appointmentDate)}  at  ${escapePdfText(data.timeSlot)}) Tj
ET

% Field 5: Estimated Price / Fees
BT
/F1 9 Tf
0.412 0.376 0.357 rg
75 380 Td
(Estimated Price / Fees:) Tj
/F1 12 Tf
0.773 0.627 0.349 rg
200 380 Td
(${escapePdfText(data.priceDisplay)}) Tj
ET

% Field 6: Payment Terms & Venue
BT
/F1 9 Tf
0.412 0.376 0.357 rg
75 330 Td
(Payment Terms:) Tj
/F1 9.5 Tf
0.18 0.42 0.27 rg
200 330 Td
(Pay at Salon on Arrival - Zero Advance Required) Tj
ET

% Salon Venue Box
BT
/F1 9 Tf
0.412 0.376 0.357 rg
75 280 Td
(Salon Venue:) Tj
/F1 9.5 Tf
0.122 0.106 0.098 rg
200 280 Td
(Scheme No 78, Yashraj Complex, Sector C, Vijay Nagar, Indore) Tj
ET

% Client Instructions Card
0.961 0.941 0.902 rg
60 170 475 75 re f
0.91 0.882 0.835 RG
1 w
60 170 475 75 re s

BT
/F1 9 Tf
0.094 0.078 0.075 rg
75 225 Td
(IMPORTANT CLIENT INSTRUCTIONS:) Tj
/F1 8.5 Tf
0.412 0.376 0.357 rg
75 208 Td
(- Please arrive 5-10 minutes prior to your scheduled appointment.) Tj
75 192 Td
(- In case of delay, kindly call our front desk at +91 79875 83445.) Tj
75 178 Td
(- All standard payment methods accepted: UPI, Credit/Debit Cards, and Cash.) Tj
ET

% Official Verification Stamp
0.773 0.627 0.349 RG
1 w
395 180 125 45 re s
BT
/F1 8 Tf
0.773 0.627 0.349 rg
415 208 Td
(OFFICIALLY VERIFIED) Tj
/F1 7.5 Tf
0.094 0.078 0.075 rg
412 192 Td
(${escapePdfText(data.salonName.toUpperCase())}) Tj
ET

% Footer Legal Line
BT
/F1 8 Tf
0.588 0.549 0.522 rg
140 100 Td
(Thank you for choosing ${escapePdfText(data.salonName)}. Luxury beauty crafted for you.) Tj
ET

Q
`;

  contentStream = contentStream.trim();
  const streamLength = Buffer.byteLength(contentStream, "utf-8");

  // Construct PDF Objects
  const pdfHeader = "%PDF-1.4\n";
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${contentStream}\nendstream\nendobj\n`;
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const obj6 = "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>\nendobj\n";

  const bHeader = Buffer.from(pdfHeader, "utf-8");
  const bObj1 = Buffer.from(obj1, "utf-8");
  const bObj2 = Buffer.from(obj2, "utf-8");
  const bObj3 = Buffer.from(obj3, "utf-8");
  const bObj4 = Buffer.from(obj4, "utf-8");
  const bObj5 = Buffer.from(obj5, "utf-8");
  const bObj6 = Buffer.from(obj6, "utf-8");

  const offset1 = bHeader.length;
  const offset2 = offset1 + bObj1.length;
  const offset3 = offset2 + bObj2.length;
  const offset4 = offset3 + bObj3.length;
  const offset5 = offset4 + bObj4.length;
  const offset6 = offset5 + bObj5.length;
  const offsetEndObj6 = offset6 + bObj6.length;

  const pad = (num: number) => num.toString().padStart(10, "0");

  const xref = `xref\n0 7\n0000000000 65535 f \n${pad(offset1)} 00000 n \n${pad(offset2)} 00000 n \n${pad(offset3)} 00000 n \n${pad(offset4)} 00000 n \n${pad(offset5)} 00000 n \n${pad(offset6)} 00000 n \n`;
  const trailer = `trailer\n<< /Size 7 /Root 1 0 R >>\nstartxref\n${offsetEndObj6}\n%%EOF\n`;

  const bXref = Buffer.from(xref, "utf-8");
  const bTrailer = Buffer.from(trailer, "utf-8");

  return Buffer.concat([
    bHeader,
    bObj1,
    bObj2,
    bObj3,
    bObj4,
    bObj5,
    bObj6,
    bXref,
    bTrailer
  ]);
}
