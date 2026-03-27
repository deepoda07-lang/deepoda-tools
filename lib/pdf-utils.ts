import { PDFDocument, degrees, rgb, StandardFonts } from "pdf-lib";

export async function mergePDFs(files: File[]): Promise<Uint8Array> {
  const merged = await PDFDocument.create();
  for (const file of files) {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes);
    const pages = await merged.copyPages(doc, doc.getPageIndices());
    pages.forEach((page) => merged.addPage(page));
  }
  return merged.save();
}

export async function splitPDF(
  file: File,
  ranges: { from: number; to: number }[]
): Promise<Uint8Array[]> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const results: Uint8Array[] = [];
  for (const range of ranges) {
    const newDoc = await PDFDocument.create();
    const indices = Array.from(
      { length: range.to - range.from + 1 },
      (_, i) => range.from - 1 + i
    );
    const pages = await newDoc.copyPages(doc, indices);
    pages.forEach((p) => newDoc.addPage(p));
    results.push(await newDoc.save());
  }
  return results;
}

export async function rotatePDF(file: File, angle: number): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  doc.getPages().forEach((page) => {
    const current = page.getRotation().angle;
    page.setRotation(degrees((current + angle) % 360));
  });
  return doc.save();
}

export async function compressPDF(file: File): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  return doc.save({ useObjectStreams: true, addDefaultPage: false });
}

export async function addPageNumbers(
  file: File,
  position: "bottom-center" | "bottom-right" | "bottom-left"
): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontSize = 11;

  doc.getPages().forEach((page, i) => {
    const { width } = page.getSize();
    const text = String(i + 1);
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    let x: number;
    if (position === "bottom-center") x = width / 2 - textWidth / 2;
    else if (position === "bottom-right") x = width - textWidth - 24;
    else x = 24;

    page.drawText(text, {
      x,
      y: 18,
      size: fontSize,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
  });

  return doc.save();
}

export async function imagesToPDF(files: File[]): Promise<Uint8Array> {
  const doc = await PDFDocument.create();

  for (const file of files) {
    const bytes = await file.arrayBuffer();
    let image;

    if (file.type === "image/jpeg" || file.type === "image/jpg") {
      image = await doc.embedJpg(bytes);
    } else {
      // PNG veya diğerleri — canvas üzerinden PNG'ye çevir
      const pngBytes = await convertToPngBytes(file);
      image = await doc.embedPng(pngBytes);
    }

    const page = doc.addPage([image.width, image.height]);
    page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
  }

  return doc.save();
}

async function convertToPngBytes(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      canvas.getContext("2d")!.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      canvas.toBlob((blob) => blob!.arrayBuffer().then(resolve), "image/png");
    };
    img.src = url;
  });
}

export function downloadBlob(data: Uint8Array, filename: string) {
  const blob = new Blob([data.buffer as ArrayBuffer], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function lockPDF(file: File, password: string): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  const doc = await PDFDocument.load(bytes);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (doc as any).save({
    encrypt: {
      ownerPassword: password,
      userPassword: password,
      permissions: {
        printing: "highResolution",
        modifying: false,
        copying: false,
        annotating: false,
        fillingForms: false,
        contentAccessibility: true,
        documentAssembly: false,
      },
    },
  });
}

export async function unlockPDF(file: File, password: string): Promise<Uint8Array> {
  const bytes = await file.arrayBuffer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = await PDFDocument.load(bytes, { password } as any);
  return doc.save();
}

export function downloadDataUrl(dataUrl: string, filename: string) {
  const a = document.createElement("a");
  a.href = dataUrl;
  a.download = filename;
  a.click();
}
