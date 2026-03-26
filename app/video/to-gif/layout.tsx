import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Video GIF'e Çevir – Animasyonlu GIF Yap | Ücretsiz",
  description: "Video dosyasından animasyonlu GIF oluştur. Başlangıç/bitiş zamanı ve FPS ayarla. Tarayıcıda çalışır.",
  keywords: ["video gif çevir", "mp4 gif online", "animasyonlu gif yap ücretsiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Video Araçları", href: "/video" }, { label: "Video → GIF" }]} />
      {children}
    </div>
  );
}
