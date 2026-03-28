import type { Metadata } from "next";
import { getDictionary, hasLocale } from "@/lib/dictionaries";
import Breadcrumb from "@/components/Breadcrumb";
import ToolFAQ from "@/components/ToolFAQ";
import RecordVisit from "@/components/RecordVisit";
import RelatedTools from "@/components/RelatedTools";
import { RELATED, TOOL_HREF } from "@/lib/related-tools";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  const t = dict.t.convBase64;
  return { title: t.meta.title, description: t.meta.description, keywords: t.meta.keywords };
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) return null;
  const dict = await getDictionary(lang);
  const prefix = lang === "en" ? "" : `/${lang}`;
  const faq = dict.t.convBase64.faq ?? [];
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
  const relatedItems = (RELATED["convBase64"] ?? []).map((k) => ({
    href: TOOL_HREF[k],
    title: dict.t[k as keyof typeof dict.t].title,
    icon: dict.t[k as keyof typeof dict.t].icon,
  }));

  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: dict.catPages.convert.title, href: `${prefix}/convert` }, { label: dict.t.convBase64.title }]} />
      {children}
      <RecordVisit href="/convert/base64" title={dict.t.convBase64.title} icon={dict.t.convBase64.icon} />
      <ToolFAQ items={faq} />
      <RelatedTools label={dict.home.relatedTools} items={relatedItems} lang={lang} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
    </div>
  );
}
