import type { Metadata } from "next";
import { getDictionary, hasLocale } from "@/lib/dictionaries";
import Breadcrumb from "@/components/Breadcrumb";
import ToolFAQ from "@/components/ToolFAQ";
import RecordVisit from "@/components/RecordVisit";
import RelatedTools from "@/components/RelatedTools";
import { RELATED, TOOL_HREF } from "@/lib/related-tools";
import ToolSEOSection from "@/components/ToolSEOSection";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const t = dict.t.vidCompress;
  return { title: t.meta.title, description: t.meta.description, keywords: t.meta.keywords };
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return null;
  const dict = await getDictionary(lang);
  const prefix = lang === "en" ? "" : `/${lang}`;
    const faq = dict.t.vidCompress.faq ?? [];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  const relatedItems = (RELATED["vidCompress"] ?? []).map((k) => ({
    href: TOOL_HREF[k],
    title: dict.t[k as keyof typeof dict.t].title,
    icon: dict.t[k as keyof typeof dict.t].icon,
  }));

    return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: dict.catPages.video.title, href: `${prefix}/video` }, { label: dict.t.vidCompress.title }]} />
      {children}
      <RecordVisit href="/video/compress" title={dict.t.vidCompress.title} icon={dict.t.vidCompress.icon} />
      <ToolSEOSection title={dict.t.vidCompress.title} desc={dict.t.vidCompress.meta.description} keywords={dict.t.vidCompress.meta.keywords} />
      <ToolFAQ items={faq} />
      <RelatedTools label={dict.home.relatedTools} items={relatedItems} lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}
