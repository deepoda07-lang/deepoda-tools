import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Video Sessiz Et – Sesi Kaldır | Ücretsiz Online",
  description: "Video dosyasından sesi tamamen kaldır. MP4, MOV, WEBM desteklenir. Tarayıcıda çalışır.",
  keywords: ["video sessiz et", "videodan ses kaldır", "mute video online"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Video Araçları", href: "/video" }, { label: "Video Sessiz Et" }]} />
      {children}
    </div>
  );
}
