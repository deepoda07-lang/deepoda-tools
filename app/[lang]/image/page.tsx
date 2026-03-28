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
    title: dict.catPages.image.metaTitle,
    description: dict.catPages.image.metaDesc,
  };
}

export default async function ImagePage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) return null;
  const dict = await getDictionary(lang);
  const t = dict.t;

  const tools = [
    { ...t.imgCompress, href: "/image/compress" },
    { ...t.imgConvert, href: "/image/convert" },
    { ...t.imgRemoveBg, href: "/image/remove-bg" },
    { ...t.imgResize, href: "/image/resize" },
    { ...t.imgCrop, href: "/image/crop" },
    { ...t.imgRotate, href: "/image/rotate" },
    { ...t.imgToPdf, href: "/image/to-pdf" },
    { ...t.imgHeicToJpg, href: "/image/heic-to-jpg" },
    { ...t.imgWatermark, href: "/image/watermark" },
    { ...t.imgAddText, href: "/image/add-text" },
  ];

  return <CategoryPageClient catKey="image" tools={tools} />;
}
