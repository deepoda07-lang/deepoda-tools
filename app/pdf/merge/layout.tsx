import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "PDF Birleştir – Ücretsiz Online PDF Merge",
  description:
    "Birden fazla PDF dosyasını tek belgede birleştir. Sürükle-bırak ile sırala, anında indir. Ücretsiz, tarayıcıda, dosyalar sunucuya gitmez.",
  keywords: [
    "pdf birleştir ücretsiz",
    "pdf merge online türkçe",
    "pdf dosyası birleştir",
    "pdf birleştirme aracı",
    "online pdf merge",
  ],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "PDF Birleştir" }]} />
      {children}
    </div>
  );
}
