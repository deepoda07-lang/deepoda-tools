import type { Metadata } from "next";

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
  return <>{children}</>;
}
