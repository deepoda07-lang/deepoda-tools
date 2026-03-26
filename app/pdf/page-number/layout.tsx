import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "PDF Sayfa Numarası Ekle – Ücretsiz Online",
  description: "PDF sayfalarına otomatik numara ekle. Konum seç, anında indir. Ücretsiz, tarayıcıda.",
  keywords: ["pdf sayfa numarası ekle", "pdf numara bas online", "pdf page number ücretsiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "PDF Sayfa Numarası" }]} />
      {children}
    </div>
  );
}
