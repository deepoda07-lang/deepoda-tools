import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "PDF Sıkıştır – Ücretsiz Online PDF Compress",
  description: "PDF dosya boyutunu küçült. Ücretsiz, tarayıcıda çalışır, dosyan sunucuya gitmez.",
  keywords: ["pdf sıkıştır online", "pdf boyutunu küçült", "pdf compress ücretsiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "PDF Araçları", href: "/pdf" }, { label: "PDF Sıkıştır" }]} />
      {children}
    </div>
  );
}
