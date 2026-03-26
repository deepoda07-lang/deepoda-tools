import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Dönüştürme Araçları – Ücretsiz Online Dosya Dönüştür",
  description:
    "Word, Excel ve diğer dosyaları PDF'e dönüştür. Ücretsiz, tarayıcıda çalışır, dosyalar sunucuya gitmez.",
};

const tools = [
  { title: "Word → PDF",     description: "Word belgelerini PDF formatına dönüştür. DOCX dosyasını yükle, anında indir.", href: "/convert/word-to-pdf",    icon: "📋" },
  { title: "Excel → PDF",    description: "Excel (XLSX/XLS) dosyalarını PDF'e dönüştür.",                                 href: "/convert/excel-to-pdf",  icon: "📊", badge: "Yeni" },
  { title: "HTML → PDF",     description: "HTML kodunu veya dosyasını PDF'e dönüştür.",                                  href: "/convert/html-to-pdf",   icon: "🌐", badge: "Yeni" },
  { title: "Markdown → PDF", description: "Markdown metnini veya .md dosyasını PDF'e dönüştür.",                         href: "/convert/markdown-to-pdf",icon: "📝", badge: "Yeni" },
];

export default function ConvertPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: "Dönüştürme Araçları" }]} />

      {/* Başlık */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🔄</span>
          <h1 className="text-3xl font-bold text-gray-900">Dönüştürme Araçları</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} araç
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">
          Dosya formatlarını dönüştürün. Tüm işlemler tarayıcınızda,
          dosyalarınız sunucuya gitmez.
        </p>
      </div>

      {/* Araçlar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {tools.map((t) => <ToolCard key={t.href} {...t} />)}
      </div>

      {/* Diğer kategoriler */}
      <div className="border-t pt-8">
        <p className="text-sm text-gray-500 mb-4 font-medium">Diğer kategoriler</p>
        <div className="flex flex-wrap gap-3">
          <a href="/pdf" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            📄 PDF Araçları <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a href="/image" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🖼️ Görsel Araçları <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
