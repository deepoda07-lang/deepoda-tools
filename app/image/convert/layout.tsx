import type { Metadata } from "next";

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
  return <>{children}</>;
}
