import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Görsel Kırp – Ücretsiz Online Image Crop",
  description: "Görselin istediğin bölümünü kırp ve indir. Ücretsiz, tarayıcıda çalışır.",
  keywords: ["resim kırp online ücretsiz", "fotoğraf kırpma", "image crop türkçe"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Görsel Araçları", href: "/image" }, { label: "Görsel Kırp" }]} />
      {children}
    </div>
  );
}
