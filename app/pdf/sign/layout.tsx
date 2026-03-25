import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "PDF İmzala – Online Elektronik İmza Ekle | Ücretsiz",
  description:
    "PDF dosyasına elektronik imza ekle. İmzanı çiz, sayfayı seç, konumu ayarla ve PDF'e göm. Tamamen ücretsiz, tarayıcıda çalışır.",
  keywords: [
    "pdf imzala online ücretsiz",
    "pdf e imza ekle",
    "elektronik imza pdf",
    "pdf sign türkçe",
    "online pdf imza",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "PDF İmzala" }]} />
      {children}
    </div>
  );
}
