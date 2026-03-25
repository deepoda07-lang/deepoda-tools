import type { Metadata } from "next";

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
  return <>{children}</>;
}
