import type { Metadata } from "next";
import { getDictionary, hasLocale } from "@/lib/dictionaries";
import Breadcrumb from "@/components/Breadcrumb";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const t = dict.t.pdfSign;
  return {
    title: t.meta.title,
    description: t.meta.description,
    keywords: t.meta.keywords,
  };
}

export default async function Layout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) return null;
  const dict = await getDictionary(lang);
  const catTitle = dict.catPages.pdf.title;
  const toolTitle = dict.t.pdfSign.title;
  const prefix = lang === "en" ? "" : `/${lang}`;

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: catTitle, href: `${prefix}/pdf` }, { label: toolTitle }]} />
      {children}
    </div>
  );
}
