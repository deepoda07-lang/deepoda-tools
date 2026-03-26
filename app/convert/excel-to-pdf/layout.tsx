import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Excel PDF'e Çevir – XLSX/XLS Dönüştür | Ücretsiz",
  description: "Excel dosyalarını (XLSX, XLS) PDF formatına dönüştür. Ücretsiz, tarayıcıda çalışır, dosya sunucuya gitmez.",
  keywords: ["excel pdf çevir", "xlsx pdf dönüştür", "excel pdf online ücretsiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Dönüştürme Araçları", href: "/convert" }, { label: "Excel → PDF" }]} />
      {children}
    </div>
  );
}
