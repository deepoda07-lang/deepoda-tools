import { getDictionary, hasLocale } from "@/lib/dictionaries";
import type { Metadata } from "next";
import CategoryPageClient from "@/components/CategoryPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.catPages.pdf.metaTitle,
    description: dict.catPages.pdf.metaDesc,
  };
}

export default async function PDFPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) return null;
  const dict = await getDictionary(lang);
  const t = dict.t;

  const tools = [
    { ...t.pdfMerge, href: "/pdf/merge" },
    { ...t.pdfSplit, href: "/pdf/split" },
    { ...t.pdfEdit, href: "/pdf/edit" },
    { ...t.pdfRotate, href: "/pdf/rotate" },
    { ...t.pdfCompress, href: "/pdf/compress" },
    { ...t.pdfPageNumber, href: "/pdf/page-number" },
    { ...t.pdfToJpg, href: "/pdf/to-jpg" },
    { ...t.pdfFromJpg, href: "/pdf/from-jpg" },
    { ...t.pdfWatermark, href: "/pdf/watermark" },
    { ...t.pdfSign, href: "/pdf/sign" },
    { ...t.pdfToWord, href: "/pdf/to-word" },
    { ...t.pdfLock, href: "/pdf/lock" },
    { ...t.pdfUnlock, href: "/pdf/unlock" },
    { ...t.pdfCrop, href: "/pdf/crop" },
    { ...t.pdfFormFill, href: "/pdf/form-fill" },
    { ...t.pdfAnnotate, href: "/pdf/annotate" },
  ];

  return <CategoryPageClient catKey="pdf" tools={tools} />;
}
