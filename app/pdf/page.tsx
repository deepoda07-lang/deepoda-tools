import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "PDF Araçları – Ücretsiz Online PDF İşlemleri",
  description:
    "PDF birleştir, böl, düzenle, döndür, sıkıştır, imzala ve daha fazlası. 11 ücretsiz araç, tarayıcıda çalışır.",
};

const tools = [
  { title: "PDF Birleştir",       description: "Birden fazla PDF'i tek belgede birleştir.",              href: "/pdf/merge",        icon: "📄", badge: "Popüler" },
  { title: "PDF Böl",             description: "PDF sayfalarını ayrı dosyalara böl.",                    href: "/pdf/split",        icon: "✂️" },
  { title: "PDF Düzenle",         description: "Sayfa sil, yeniden sırala, sürükle-bırak.",              href: "/pdf/edit",         icon: "🖊️" },
  { title: "PDF Döndür",          description: "Sayfaları 90°, 180° veya 270° döndür.",                  href: "/pdf/rotate",       icon: "🔄", badge: "Yeni" },
  { title: "PDF Sıkıştır",        description: "PDF dosya boyutunu küçült.",                             href: "/pdf/compress",     icon: "🗜️", badge: "Yeni" },
  { title: "PDF Sayfa No Ekle",   description: "Her sayfaya otomatik numara bas.",                       href: "/pdf/page-number",  icon: "🔢", badge: "Yeni" },
  { title: "PDF → JPG",           description: "PDF sayfalarını JPG görsellerine dönüştür.",             href: "/pdf/to-jpg",       icon: "🖼️", badge: "Yeni" },
  { title: "JPG → PDF",           description: "Görselleri tek PDF dosyasına dönüştür.",                 href: "/pdf/from-jpg",     icon: "📋", badge: "Yeni" },
  { title: "PDF Filigran",        description: "Sayfalarına GİZLİ, TASLAK gibi damga ekle.",            href: "/pdf/watermark",    icon: "🔏" },
  { title: "PDF İmzala",          description: "İmzanı çiz ve PDF sayfasına göm.",                      href: "/pdf/sign",         icon: "✍️" },
  { title: "PDF → Word",          description: "PDF dosyasını Word formatına dönüştür.",                 href: "/pdf/to-word",      icon: "📝" },
];

export default function PDFPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: "PDF Araçları" }]} />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">📄</span>
          <h1 className="text-3xl font-bold text-gray-900">PDF Araçları</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} araç
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">
          PDF dosyalarınızı birleştirin, bölün, düzenleyin, döndürün ve daha fazlası.
          Tüm işlemler tarayıcınızda, dosyalar sunucuya gitmez.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {tools.map((t) => <ToolCard key={t.href} {...t} />)}
      </div>

      <div className="border-t pt-8">
        <p className="text-sm text-gray-500 mb-4 font-medium">Diğer kategoriler</p>
        <div className="flex flex-wrap gap-3">
          <a href="/image" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🖼️ Görsel Araçları <ArrowRight className="w-3.5 h-3.5" />
          </a>
          <a href="/convert" className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all">
            🔄 Dönüştürme Araçları <ArrowRight className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
