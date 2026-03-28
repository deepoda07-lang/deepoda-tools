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
    title: dict.catPages.convert.metaTitle,
    description: dict.catPages.convert.metaDesc,
  };
}

export default async function ConvertPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) return null;
  const dict = await getDictionary(lang);
  const t = dict.t;

  const tools = [
    { ...t.convWordToPdf, href: "/convert/word-to-pdf" },
    { ...t.convExcelToPdf, href: "/convert/excel-to-pdf" },
    { ...t.convHtmlToPdf, href: "/convert/html-to-pdf" },
    { ...t.convMdToPdf, href: "/convert/markdown-to-pdf" },
  ];

  return <CategoryPageClient catKey="convert" tools={tools} />;
}
