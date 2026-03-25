import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arka Plan Sil – AI ile Ücretsiz Fotoğraf Arka Plan Kaldır",
  description:
    "Yapay zeka ile fotoğraf arka planını otomatik sil. Şeffaf PNG çıktı. Tamamen tarayıcıda, dosyalar sunucuya gitmez. Ücretsiz.",
  keywords: [
    "resim arka plan sil ücretsiz",
    "fotoğraf arka plan kaldır",
    "arka plan silici online",
    "background remover türkçe",
    "arka plan sil ai",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
