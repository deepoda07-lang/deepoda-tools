import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

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
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Görsel Araçları", href: "/image" }, { label: "Arka Plan Sil" }]} />
      {children}
    </div>
  );
}
