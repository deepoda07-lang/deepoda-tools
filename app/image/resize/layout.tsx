import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Görsel Boyutlandır – Ücretsiz Online Image Resize",
  description: "Görselin genişlik ve yüksekliğini ayarla. Orantı kilidi, JPG/PNG/WEBP desteği. Ücretsiz, tarayıcıda.",
  keywords: ["resim boyutlandır online", "görsel yeniden boyutlandır", "image resize ücretsiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Görsel Araçları", href: "/image" }, { label: "Görsel Boyutlandır" }]} />
      {children}
    </div>
  );
}
