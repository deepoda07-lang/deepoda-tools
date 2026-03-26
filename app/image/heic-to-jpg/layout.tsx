import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "HEIC JPG'ye Çevir – iPhone Fotoğraf Dönüştür | Ücretsiz",
  description: "iPhone HEIC ve HEIF fotoğraflarını JPG formatına dönüştür. Ücretsiz, tarayıcıda çalışır.",
  keywords: ["heic jpg çevir ücretsiz", "iphone fotoğraf dönüştür", "heif jpg online"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Görsel Araçları", href: "/image" }, { label: "HEIC → JPG" }]} />
      {children}
    </div>
  );
}
