import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Görsel Sıkıştır – JPG PNG Küçült | Ücretsiz Online",
  description:
    "JPG, PNG ve WEBP dosyalarını kalite kaybetmeden sıkıştır. Toplu işlem, önce/sonra boyut karşılaştırma. Ücretsiz, tarayıcıda çalışır.",
  keywords: [
    "jpg sıkıştır online",
    "png küçült ücretsiz",
    "görsel boyutunu küçült",
    "resim sıkıştır türkçe",
    "webp sıkıştır online",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Görsel Araçları", href: "/image" }, { label: "Görsel Sıkıştır" }]} />
      {children}
    </div>
  );
}
