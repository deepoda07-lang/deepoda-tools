import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "PDF Düzenle – Sayfa Sil ve Sırala | Ücretsiz",
  description:
    "PDF sayfalarını sil, yeniden sırala, sürükle-bırak ile düzenle. Thumbnail önizleme ile kolay kullanım. Ücretsiz, tarayıcıda çalışır.",
  keywords: [
    "pdf sayfa sil online",
    "pdf düzenle ücretsiz",
    "pdf sayfa sırala",
    "pdf sayfa düzenleme",
    "online pdf editor türkçe",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "PDF Düzenle" }]} />
      {children}
    </div>
  );
}
