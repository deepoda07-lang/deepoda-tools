import type { Metadata } from "next";
import Breadcrumb from "@/components/Breadcrumb";

export const metadata: Metadata = {
  title: "Add Text to Image – Free Online Image Text Editor",
  description: "Add custom text to your image. Click anywhere on the image to place text. Free, runs in your browser.",
  keywords: ["add text to image online free", "image text editor", "photo text overlay", "caption image"],
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl mx-auto px-4 pt-6">
      <Breadcrumb crumbs={[{ label: "Image Tools", href: "/image" }, { label: "Add Text" }]} />
      {children}
    </div>
  );
}
