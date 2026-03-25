import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Görsel Format Dönüştür – JPG PNG WEBP | Ücretsiz",
  description:
    "JPG, PNG ve WEBP arasında anında format dönüşümü. Toplu işlem, kalite ayarı. Ücretsiz, tarayıcıda çalışır, dosyalar sunucuya gitmez.",
  keywords: [
    "jpg png çevir online",
    "webp jpg dönüştür",
    "görsel format değiştir",
    "resim formatı dönüştür ücretsiz",
    "png webp çevir türkçe",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Görsel Araçları", href: "/image" }, { label: "Format Dönüştür" }]} />
      {children}
    </div>
  );
}
