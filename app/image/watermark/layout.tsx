import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Add Watermark to Image – Free Online Image Watermark",
  description: "Add a custom text watermark to your image. Choose position, opacity, font size and color. Free, runs in your browser.",
  keywords: ["add watermark to image online free", "image watermark", "photo watermark", "text watermark"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Image Tools", href: "/image" }, { label: "Add Watermark" }]} />
      {children}
    </div>
  );
}
