import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Görsel Döndür – Ücretsiz Online Image Rotate & Flip",
  description: "Görseli 90°, 180° döndür veya yatay/dikey çevir. Ücretsiz, tarayıcıda çalışır.",
  keywords: ["resim döndür online", "fotoğraf çevir ücretsiz", "image rotate flip türkçe"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Görsel Araçları", href: "/image" }, { label: "Görsel Döndür" }]} />
      {children}
    </div>
  );
}
