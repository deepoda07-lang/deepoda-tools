import type { Metadata } from "next";

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
  return <>{children}</>;
}
