import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Video Döndür – Online Ücretsiz Video Rotasyon",
  description: "Videoyu 90°, 180° döndür veya yatay/dikey çevir. Tarayıcıda çalışır, dosya sunucuya gitmez.",
  keywords: ["video döndür online", "video rotate ücretsiz", "mp4 çevir döndür"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Video Araçları", href: "/video" }, { label: "Video Döndür" }]} />
      {children}
    </div>
  );
}
