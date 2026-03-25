import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "PDF Filigran Ekle – Ücretsiz Online Watermark",
  description:
    "PDF sayfalarına metin filigranı ekle. GİZLİ, TASLAK gibi damgalar. Renk, konum, opaklık ayarla. Ücretsiz, tarayıcıda çalışır.",
  keywords: [
    "pdf filigran ekle online",
    "pdf watermark ücretsiz",
    "pdf damga ekle",
    "pdf filigran türkçe",
    "online pdf watermark",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "PDF Filigran" }]} />
      {children}
    </div>
  );
}
