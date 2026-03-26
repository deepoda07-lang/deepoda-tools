import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Markdown PDF'e Çevir – MD Dosyası Dönüştür | Ücretsiz",
  description: "Markdown metnini veya .md dosyasını PDF formatına dönüştür. Ücretsiz, tarayıcıda çalışır.",
  keywords: ["markdown pdf çevir", "md pdf dönüştür", "markdown pdf online"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Dönüştürme Araçları", href: "/convert" }, { label: "Markdown → PDF" }]} />
      {children}
    </div>
  );
}
