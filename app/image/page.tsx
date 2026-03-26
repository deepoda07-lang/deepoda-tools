import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Görsel Araçları – Ücretsiz Online Görsel İşlemleri",
  description: "Görsel sıkıştır, kırp, döndür, boyutlandır, arka plan sil ve daha fazlası. 8 ücretsiz araç, tarayıcıda.",
};

const tools = [
  { title: "Görsel Sıkıştır",   description: "JPG, PNG ve WEBP dosyalarını kalite kaybetmeden küçült.",   href: "/image/compress",   icon: "🗜️", badge: "Popüler" },
  { title: "Arka Plan Sil",     description: "Yapay zeka ile görsel arka planını otomatik kaldır.",        href: "/image/remove-bg",  icon: "🪄",  badge: "AI" },
  { title: "Format Dönüştür",   description: "JPG ↔ PNG ↔ WEBP arasında anında dönüşüm.",               href: "/image/convert",    icon: "🔄" },
  { title: "Görsel Boyutlandır",description: "Genişlik/yükseklik gir, orantı kilidi ile boyutlandır.",    href: "/image/resize",     icon: "📐", badge: "Yeni" },
  { title: "Görsel Kırp",       description: "Görselin istediğin bölümünü kırp ve indir.",               href: "/image/crop",       icon: "✂️", badge: "Yeni" },
  { title: "Görsel Döndür",     description: "90°/180° döndür veya yatay/dikey çevir.",                  href: "/image/rotate",     icon: "🔃", badge: "Yeni" },
  { title: "Görsel → PDF",      description: "Görselleri tek bir PDF dosyasına dönüştür.",               href: "/image/to-pdf",     icon: "📋", badge: "Yeni" },
  { title: "HEIC → JPG",        description: "iPhone HEIC fotoğraflarını JPG'ye dönüştür.",             href: "/image/heic-to-jpg",icon: "📱", badge: "Yeni" },
];

export default function ImagePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: "Görsel Araçları" }]} />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🖼️</span>
          <h1 className="text-3xl font-bold text-gray-900">Görsel Araçları</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} araç
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">
          Görsellerinizi düzenleyin, dönüştürün ve optimize edin.
          Tüm işlemler tarayıcınızda, dosyalar sunucuya gitmez.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {tools.map((t) => <ToolCard key={t.href} {...t} />)}
      </div>

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
