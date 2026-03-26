import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Video Format Dönüştür – MP4 WEBM AVI MOV | Ücretsiz",
  description: "Video formatlarını dönüştür: MP4, WEBM, AVI, MOV. Tarayıcıda çalışır, sunucuya gitmez.",
  keywords: ["video format dönüştür", "mp4 webm çevir", "video converter online ücretsiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Video Araçları", href: "/video" }, { label: "Video Dönüştür" }]} />
      {children}
    </div>
  );
}
