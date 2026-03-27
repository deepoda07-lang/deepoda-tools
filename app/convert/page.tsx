import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Convert Tools – Free Online File Converter",
  description:
    "Convert Word, Excel, and other files to PDF. Free, runs in your browser, files never leave your device.",
};

const tools = [
  { title: "Word → PDF",     description: "Convert Word documents to PDF. Upload DOCX, download instantly.", href: "/convert/word-to-pdf",     icon: "📋" },
  { title: "Excel → PDF",    description: "Convert Excel (XLSX/XLS) files to PDF.",                          href: "/convert/excel-to-pdf",    icon: "📊", badge: "New" },
  { title: "HTML → PDF",     description: "Convert HTML code or a file to PDF.",                             href: "/convert/html-to-pdf",     icon: "🌐", badge: "New" },
  { title: "Markdown → PDF", description: "Convert Markdown text or a .md file to PDF.",                     href: "/convert/markdown-to-pdf", icon: "📝", badge: "New" },
];

export default function ConvertPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: "Convert Tools" }]} />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🔄</span>
          <h1 className="text-3xl font-bold text-gray-900">Convert Tools</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} tools
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">
          Convert file formats. All processing in your browser —
          your files never leave your device.
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
          <a href="/image" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🖼️ Image Tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a href="/video" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🎬 Video Tools <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
