import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Video Birleştir – Online Ücretsiz Video Birleştirme",
  description: "Birden fazla MP4 video dosyasını tek bir videoda birleştir. Tarayıcıda çalışır.",
  keywords: ["video birleştir online", "mp4 birleştir", "video merge ücretsiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Video Araçları", href: "/video" }, { label: "Video Birleştir" }]} />
      {children}
    </div>
  );
}
