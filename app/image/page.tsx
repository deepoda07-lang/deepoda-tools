import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Görsel Araçları – Ücretsiz Online Görsel İşlemleri",
  description:
    "Görsel sıkıştır, format dönüştür, arka plan sil. 3 ücretsiz araç, AI destekli, tarayıcıda çalışır.",
};

const tools = [
  { title: "Görsel Sıkıştır",  description: "JPG, PNG ve WEBP dosyalarını kalite kaybetmeden küçült. Toplu işlem.", href: "/image/compress",  icon: "🗜️", badge: "Popüler" },
  { title: "Format Dönüştür",  description: "JPG ↔ PNG ↔ WEBP arasında anında format dönüşümü.",                  href: "/image/convert",   icon: "🔄" },
  { title: "Arka Plan Sil",    description: "Yapay zeka ile görseldeki arka planı otomatik kaldır. Şeffaf PNG.",   href: "/image/remove-bg", icon: "🪄", badge: "AI" },
];

export default function ImagePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: "Görsel Araçları" }]} />

      {/* Başlık */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🖼️</span>
          <h1 className="text-3xl font-bold text-gray-900">Görsel Araçları</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} araç
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">
          Görsellerinizi sıkıştırın, format dönüştürün veya arka planı AI ile kaldırın.
          Tüm işlemler tarayıcınızda, dosyalar sunucuya gitmez.
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
          <a href="/convert" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🔄 Dönüştürme Araçları <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
