import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "PDF Döndür – Ücretsiz Online PDF Rotate",
  description: "PDF sayfalarını 90°, 180° veya 270° döndür. Ücretsiz, tarayıcıda çalışır.",
  keywords: ["pdf döndür online ücretsiz", "pdf rotate türkçe", "pdf sayfa döndür"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "PDF Döndür" }]} />
      {children}
    </div>
  );
}
