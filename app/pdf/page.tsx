import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF Tools – Free Online PDF Operations",
  description:
    "Merge, split, edit, rotate, compress, sign, lock and unlock PDFs. 13 free tools, runs in your browser.",
};

const tools = [
  { title: "Merge PDF",        description: "Combine multiple PDFs into a single document.",        href: "/pdf/merge",       icon: "📄", badge: "Popular" },
  { title: "Split PDF",        description: "Split PDF pages into separate files.",                 href: "/pdf/split",       icon: "✂️" },
  { title: "Edit PDF",         description: "Delete pages, reorder, drag & drop.",                  href: "/pdf/edit",        icon: "🖊️" },
  { title: "Rotate PDF",       description: "Rotate pages 90°, 180°, or 270°.",                    href: "/pdf/rotate",      icon: "🔄", badge: "New" },
  { title: "Compress PDF",     description: "Reduce PDF file size.",                                href: "/pdf/compress",    icon: "🗜️", badge: "New" },
  { title: "Add Page Numbers", description: "Automatically stamp page numbers on each page.",       href: "/pdf/page-number", icon: "🔢", badge: "New" },
  { title: "PDF → JPG",        description: "Convert PDF pages to JPG images.",                    href: "/pdf/to-jpg",      icon: "🖼️", badge: "New" },
  { title: "JPG → PDF",        description: "Convert images into a single PDF file.",              href: "/pdf/from-jpg",    icon: "📋", badge: "New" },
  { title: "PDF Watermark",    description: "Add CONFIDENTIAL, DRAFT stamps to pages.",            href: "/pdf/watermark",   icon: "🔏" },
  { title: "Sign PDF",         description: "Draw your signature and embed it into a PDF page.",   href: "/pdf/sign",        icon: "✍️" },
  { title: "PDF → Word",       description: "Convert a PDF file to Word format.",                  href: "/pdf/to-word",     icon: "📝" },
  { title: "Lock PDF",         description: "Password-protect a PDF with encryption.",               href: "/pdf/lock",        icon: "🔒", badge: "New" },
  { title: "Unlock PDF",       description: "Remove password protection from a PDF file.",           href: "/pdf/unlock",      icon: "🔓", badge: "New" },
];

export default function PDFPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: "PDF Tools" }]} />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">📄</span>
          <h1 className="text-3xl font-bold text-gray-900">PDF Tools</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} tools
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">
          Merge, split, edit, rotate your PDF files and more.
          All processing in your browser — files never leave your device.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {tools.map((t) => <ToolCard key={t.href} {...t} />)}
      </div>

      <div className="border-t pt-8">
        <p className="text-sm text-gray-500 mb-4 font-medium">Other categories</p>
        <div className="flex flex-wrap gap-3">
          <a href="/image" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🖼️ Image Tools <ArrowRight className="w-3.5 h-3.5" />
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
