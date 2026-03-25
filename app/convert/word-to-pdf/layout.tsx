import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Word PDF'e Çevir – DOCX PDF Dönüştür | Ücretsiz Online",
  description:
    "Word belgelerini PDF formatına dönüştür. DOCX dosyasını yükle, anında PDF olarak indir. Kayıt gerektirmez, ücretsiz, tarayıcıda çalışır.",
  keywords: [
    "word pdf çevir ücretsiz online",
    "docx pdf dönüştür",
    "word to pdf türkçe",
    "word belgesi pdf yap",
    "online word pdf dönüştürücü",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
