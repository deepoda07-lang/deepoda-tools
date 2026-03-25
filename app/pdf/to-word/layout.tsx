import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

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
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "PDF → Word" }]} />
      {children}
    </div>
  );
}
