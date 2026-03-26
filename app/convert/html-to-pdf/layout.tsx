import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "HTML PDF'e Çevir – Web Sayfası PDF Yap | Ücretsiz",
  description: "HTML kodunu veya dosyasını PDF'e dönüştür. Tarayıcıda çalışır, hiçbir veri sunucuya gitmez.",
  keywords: ["html pdf dönüştür", "html pdf online", "web sayfası pdf"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Dönüştürme Araçları", href: "/convert" }, { label: "HTML → PDF" }]} />
      {children}
    </div>
  );
}
