import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Video Kes – Online Ücretsiz Video Kesme",
  description: "Videonun istediğin bölümünü kes ve indir. MP4, MOV, WEBM desteklenir. Tarayıcıda çalışır.",
  keywords: ["video kes online", "video trim ücretsiz", "mp4 kes"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Video Araçları", href: "/video" }, { label: "Video Kes" }]} />
      {children}
    </div>
  );
}
