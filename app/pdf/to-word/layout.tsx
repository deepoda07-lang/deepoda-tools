import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PDF Word'e Çevir – Ücretsiz Online PDF to Word",
  description:
    "PDF dosyasını Word formatına dönüştür. Ücretsiz online araç, kayıt gerektirmez.",
  keywords: [
    "pdf word çevir ücretsiz",
    "pdf docx dönüştür",
    "pdf to word türkçe",
    "online pdf word",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
