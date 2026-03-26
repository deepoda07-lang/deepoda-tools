import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Video Sıkıştır – Ücretsiz Online Video Küçültme",
  description: "MP4, WEBM, MOV video dosyalarını kalite kaybetmeden sıkıştır. Tarayıcıda çalışır.",
  keywords: ["video sıkıştır", "video küçült online", "mp4 sıkıştır ücretsiz"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Video Araçları", href: "/video" }, { label: "Video Sıkıştır" }]} />
      {children}
    </div>
  );
}
