import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "PDF Böl – Ücretsiz Online PDF Split",
  description:
    "PDF sayfalarını ayrı dosyalara böl. Sayfa aralığı seç, anında indir. Ücretsiz, tarayıcıda çalışır, dosyalar sunucuya gitmez.",
  keywords: [
    "pdf böl online ücretsiz",
    "pdf split türkçe",
    "pdf sayfa ayır",
    "pdf bölme aracı",
    "online pdf split",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "PDF Böl" }]} />
      {children}
    </div>
  );
}
