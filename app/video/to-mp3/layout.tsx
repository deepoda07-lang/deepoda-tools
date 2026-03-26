import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Video MP3'e Çevir – Videodan Ses Çıkar | Ücretsiz",
  description: "MP4, MOV, WEBM videolardan MP3 ses çıkar. Ücretsiz, tarayıcıda çalışır.",
  keywords: ["video mp3 çevir", "videodan ses çıkar", "mp4 mp3 dönüştür online"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Video Araçları", href: "/video" }, { label: "Video → MP3" }]} />
      {children}
    </div>
  );
}
