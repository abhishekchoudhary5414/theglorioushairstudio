import { execSync } from "child_process";
import fs from "fs";
import os from "os";
import path from "path";
import { BookingSlipModel, buildUnifiedConfirmationSvg } from "@/lib/templates/slip-template";

/**
 * Loads the salon logo from /public/images/logo.png (or logo.jpg) as base64 data URI
 */
function getSalonLogoDataUri(): string | undefined {
  try {
    const logoPngPath = path.join(process.cwd(), "public", "images", "logo.png");
    const logoJpgPath = path.join(process.cwd(), "public", "images", "logo.jpg");

    if (fs.existsSync(logoPngPath)) {
      const fileBuf = fs.readFileSync(logoPngPath);
      return `data:image/png;base64,${fileBuf.toString("base64")}`;
    } else if (fs.existsSync(logoJpgPath)) {
      const fileBuf = fs.readFileSync(logoJpgPath);
      return `data:image/jpeg;base64,${fileBuf.toString("base64")}`;
    }
  } catch (err) {
    console.warn("Could not load salon logo for PDF:", err);
  }
  return undefined;
}

/**
 * Server-side vector PDF generator for email attachments.
 * - Embeds the real logo from public/images/logo.png
 * - Uses exact same unified confirmation template as index.tsx
 * - Renders via Inkscape with --export-text-to-path to ensure 100% vector compatibility in Gmail, iOS, Android, and Desktop PDF viewers.
 */
export function generateBookingSlipPdfBuffer(data: BookingSlipModel): Buffer {
  const width = 800;
  const height = 1100;

  // Attach logo data URI if not provided
  const enrichedData: BookingSlipModel = {
    ...data,
    logoDataUri: data.logoDataUri || getSalonLogoDataUri()
  };

  const svgMarkup = buildUnifiedConfirmationSvg(enrichedData, width, height);

  const tmpDir = os.tmpdir();
  const filePrefix = `slip-${Date.now()}-${Math.random().toString(36).substring(7)}`;
  const svgPath = path.join(tmpDir, `${filePrefix}.svg`);
  const pdfPath = path.join(tmpDir, `${filePrefix}.pdf`);

  try {
    fs.writeFileSync(svgPath, svgMarkup, "utf-8");

    // Convert SVG to PDF with text converted to paths so Gmail & mobile viewers never break
    execSync(
      `inkscape "${svgPath}" --export-filename="${pdfPath}" --export-type=pdf --export-text-to-path`,
      {
        stdio: "pipe",
        timeout: 15000
      }
    );

    if (fs.existsSync(pdfPath)) {
      const pdfBuffer = fs.readFileSync(pdfPath);
      try {
        fs.unlinkSync(svgPath);
        fs.unlinkSync(pdfPath);
      } catch (_) {}
      return pdfBuffer;
    }
  } catch (err) {
    console.warn("Inkscape vector export notice, using fallback PDF:", err);
    try {
      if (fs.existsSync(svgPath)) fs.unlinkSync(svgPath);
      if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    } catch (_) {}
  }

  return generateStandardPdfFallback(enrichedData);
}

function escapeLatin1Pdf(str: string): string {
  if (!str) return "";
  return str
    .replace(/₹/g, "Rs. ")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function generateStandardPdfFallback(data: BookingSlipModel): Buffer {
  const width = 595;
  const height = 842;

  let stream = `
q
0.98 0.969 0.949 rg
0 0 ${width} ${height} re f

1 1 1 rg
35 35 525 772 re f
0.91 0.882 0.835 RG
1.5 w
35 35 525 772 re s

0.773 0.627 0.349 rg
35 801 525 6 re f

0.094 0.078 0.075 rg
35 685 525 116 re f

BT
/F2 20 Tf
0.969 0.945 0.898 rg
55 755 Td
(${escapeLatin1Pdf(data.salonName.toUpperCase())}) Tj
ET

BT
/F1 8.5 Tf
0.773 0.627 0.349 rg
55 738 Td
(PROFESSIONAL HAIR & BEAUTY SALON AND ACADEMY) Tj
ET

BT
/F1 8 Tf
0.91 0.882 0.835 rg
55 720 Td
(Address: ${escapeLatin1Pdf(data.salonAddress)}) Tj
ET

BT
/F1 8 Tf
0.773 0.627 0.349 rg
55 704 Td
(Phone: ${escapeLatin1Pdf(data.salonPhone)}   |   Email: ${escapeLatin1Pdf(data.salonEmail)}) Tj
ET

0.969 0.945 0.898 rg
55 628 485 40 re f
0.773 0.627 0.349 RG
1 w
55 628 485 40 re s

BT
/F1 11 Tf
0.18 0.42 0.27 rg
75 644 Td
([CONFIRMED] SLOT CONFIRMED) Tj
ET

BT
/F1 8 Tf
0.412 0.376 0.357 rg
270 644 Td
(Issued on ${escapeLatin1Pdf(data.issuedDate)}) Tj
ET

BT
/F1 11 Tf
0.094 0.078 0.075 rg
415 644 Td
(REF: ${escapeLatin1Pdf(data.bookingRef)}) Tj
ET

0.941 0.922 0.882 RG
0.75 w
55 580 485 0.1 re s
55 530 485 0.1 re s
55 480 485 0.1 re s
55 430 485 0.1 re s
55 380 485 0.1 re s

BT
/F1 8.5 Tf
0.412 0.376 0.357 rg
70 595 Td
(Client Name:) Tj
/F1 11 Tf
0.122 0.106 0.098 rg
190 595 Td
(${escapeLatin1Pdf(data.customerName)}) Tj
ET

BT
/F1 8.5 Tf
0.412 0.376 0.357 rg
70 545 Td
(Phone / Contact:) Tj
/F1 10.5 Tf
0.122 0.106 0.098 rg
190 545 Td
(${escapeLatin1Pdf(data.customerPhone)}) Tj
ET

BT
/F1 8.5 Tf
0.412 0.376 0.357 rg
70 495 Td
(Reserved Service:) Tj
/F2 11 Tf
0.094 0.078 0.075 rg
190 495 Td
(${escapeLatin1Pdf(data.serviceName)}) Tj
ET

BT
/F1 8.5 Tf
0.412 0.376 0.357 rg
70 445 Td
(Appointment Schedule:) Tj
/F1 10.5 Tf
0.094 0.078 0.075 rg
190 445 Td
(${escapeLatin1Pdf(data.appointmentDate)} at ${escapeLatin1Pdf(data.timeSlot)}) Tj
ET

BT
/F1 8.5 Tf
0.412 0.376 0.357 rg
70 395 Td
(Estimated Fees:) Tj
/F1 11 Tf
0.773 0.627 0.349 rg
190 395 Td
(${escapeLatin1Pdf(data.priceDisplay)}) Tj
ET

BT
/F1 8.5 Tf
0.412 0.376 0.357 rg
70 345 Td
(Payment Terms:) Tj
/F1 9 Tf
0.18 0.42 0.27 rg
190 345 Td
(Pay at Salon on Arrival - Zero Advance Required) Tj
ET

0.961 0.941 0.902 rg
55 210 485 70 re f
0.91 0.882 0.835 RG
1 w
55 210 485 70 re s

BT
/F1 8.5 Tf
0.094 0.078 0.075 rg
70 258 Td
(Important Instructions:) Tj
/F1 8 Tf
0.412 0.376 0.357 rg
70 242 Td
(- Please arrive 5-10 minutes prior to your scheduled appointment.) Tj
70 228 Td
(- Contact concierge at ${escapeLatin1Pdf(data.salonPhone)} for any questions.) Tj
70 214 Td
(- Present this confirmation slip on arrival.) Tj
ET

0.773 0.627 0.349 RG
1 w
405 220 120 45 re s
BT
/F1 8 Tf
0.773 0.627 0.349 rg
425 248 Td
(OFFICIALLY VERIFIED) Tj
/F1 7.5 Tf
0.094 0.078 0.075 rg
422 232 Td
(${escapeLatin1Pdf(data.salonName.toUpperCase())}) Tj
ET

BT
/F1 8 Tf
0.588 0.549 0.522 rg
140 120 Td
(Thank you for choosing ${escapeLatin1Pdf(data.salonName)}. Luxury beauty crafted for you.) Tj
ET
Q
`.trim();

  const streamLength = Buffer.byteLength(stream, "binary");

  const pdfHeader = "%PDF-1.4\n";
  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n`;
  const obj4 = `4 0 obj\n<< /Length ${streamLength} >>\nstream\n${stream}\nendstream\nendobj\n`;
  const obj5 = "5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n";
  const obj6 = "6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Times-Bold >>\nendobj\n";

  const bHeader = Buffer.from(pdfHeader, "binary");
  const bObj1 = Buffer.from(obj1, "binary");
  const bObj2 = Buffer.from(obj2, "binary");
  const bObj3 = Buffer.from(obj3, "binary");
  const bObj4 = Buffer.from(obj4, "binary");
  const bObj5 = Buffer.from(obj5, "binary");
  const bObj6 = Buffer.from(obj6, "binary");

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

  const bXref = Buffer.from(xref, "binary");
  const bTrailer = Buffer.from(trailer, "binary");

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
