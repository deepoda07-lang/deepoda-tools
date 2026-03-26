import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "JPG PDF'e Çevir – Ücretsiz Online Image to PDF",
  description: "JPG, PNG, WEBP görsellerini tek PDF dosyasına dönüştür. Ücretsiz, tarayıcıda çalışır.",
  keywords: ["jpg pdf çevir ücretsiz", "görsel pdf dönüştür", "image to pdf türkçe"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "JPG → PDF" }]} />
      {children}
    </div>
  );
}
