/**
 * Client-side direct PDF & Image generator for appointment confirmation slips.
 * Uses the exact same single template from @/lib/templates/slip-template.
 * - Format "image": Generates a high-res 2x retina PNG image and triggers download.
 * - Format "pdf": Embeds the exact rendered slip into a standard valid PDF 1.4 document and downloads it.
 * Zero external popups, zero print dialogs, zero distortion.
 */

import { BookingSlipModel, buildUnifiedConfirmationSvg } from "@/lib/templates/slip-template";

export type ConfirmationSlipData = BookingSlipModel;

/**
 * Renders the unified SVG markup into a high-resolution Canvas
 */
async function renderSvgToCanvas(svgMarkup: string, width = 800, height = 1100): Promise<HTMLCanvasElement> {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise<HTMLCanvasElement>((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = 2; // High-resolution retina output
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("Could not initialize canvas context");

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
export async function downloadSlipAsImage(data: BookingSlipModel): Promise<void> {
  const width = 800;
  const height = 1100;
  const svg = buildUnifiedConfirmationSvg(data, width, height);
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
export async function downloadSlipAsPdf(data: BookingSlipModel): Promise<void> {
  const width = 800;
  const height = 1100;
  const svg = buildUnifiedConfirmationSvg(data, width, height);
  const canvas = await renderSvgToCanvas(svg, width, height);

  // Convert canvas to high-quality JPEG for embedding in standard PDF
  const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.96);
  const base64Data = jpegDataUrl.split(",")[1];
  const binaryJpeg = atob(base64Data);
  const jpegLength = binaryJpeg.length;

  const jpegBytes = new Uint8Array(jpegLength);
  for (let i = 0; i < jpegLength; i++) {
    jpegBytes[i] = binaryJpeg.charCodeAt(i);
  }

  // A4 Standard Page dimensions (595 x 820 pt)
  const pageWidth = 595;
  const pageHeight = 820;

  // Assemble standard valid PDF 1.4 document
  const pdfHeader = "%PDF-1.4\n";

  const obj1 = "1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n";
  const obj2 = "2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n";
  const obj3 = `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Contents 4 0 R /Resources << /XObject << /Im1 5 0 R >> >> >>\nendobj\n`;

  const streamContent = `q\n${pageWidth} 0 0 ${pageHeight} 0 0 cm\n/Im1 Do\nQ\n`;
  const obj4 = `4 0 obj\n<< /Length ${streamContent.length} >>\nstream\n${streamContent}endstream\nendobj\n`;

  const obj5Header = `5 0 obj\n<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpegLength} >>\nstream\n`;
  const obj5Footer = "\nendstream\nendobj\n";

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

  const downloadUrl = URL.createObjectURL(pdfBlob);
  const a = document.createElement("a");
  a.href = downloadUrl;
  a.download = `The-Glorious-Hair-Studio-Booking-${data.bookingRef}.pdf`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(downloadUrl), 1000);
}
