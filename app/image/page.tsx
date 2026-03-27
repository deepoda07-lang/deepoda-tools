import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Image Tools – Free Online Image Operations",
  description: "Compress, crop, rotate, resize images, add watermark and more. 9 free tools, runs in your browser.",
};

const tools = [
  { title: "Compress Image",    description: "Shrink JPG, PNG, and WEBP files without quality loss.",  href: "/image/compress",    icon: "🗜️", badge: "Popular" },
  { title: "Remove Background", description: "Automatically remove image backgrounds with AI.",         href: "/image/remove-bg",   icon: "🪄",  badge: "AI" },
  { title: "Convert Format",    description: "Instantly convert between JPG ↔ PNG ↔ WEBP.",           href: "/image/convert",     icon: "🔄" },
  { title: "Resize Image",      description: "Set width/height with aspect ratio lock.",               href: "/image/resize",      icon: "📐", badge: "New" },
  { title: "Crop Image",        description: "Crop any portion of your image and download it.",        href: "/image/crop",        icon: "✂️", badge: "New" },
  { title: "Rotate Image",      description: "Rotate 90°/180° or flip horizontally/vertically.",      href: "/image/rotate",      icon: "🔃", badge: "New" },
  { title: "Image → PDF",       description: "Convert images into a single PDF file.",                href: "/image/to-pdf",      icon: "📋", badge: "New" },
  { title: "HEIC → JPG",        description: "Convert iPhone HEIC photos to JPG.",                   href: "/image/heic-to-jpg", icon: "📱", badge: "New" },
  { title: "Add Watermark",     description: "Stamp text watermark on your image. Custom position, opacity, color.", href: "/image/watermark", icon: "💧", badge: "New" },
];

export default function ImagePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: "Image Tools" }]} />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🖼️</span>
          <h1 className="text-3xl font-bold text-gray-900">Image Tools</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} tools
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">
          Edit, convert, and optimize your images.
          All processing in your browser — files never leave your device.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {tools.map((t) => <ToolCard key={t.href} {...t} />)}
      </div>

      <div className="border-t pt-8">
        <p className="text-sm text-gray-500 mb-4 font-medium">Other categories</p>
        <div className="flex flex-wrap gap-3">
          <a href="/pdf" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            📄 PDF Tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a href="/convert" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🔄 Convert Tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a href="/video" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🎬 Video Tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
