"use client";

import { useState } from "react";
import ToolCard from "@/components/ToolCard";
import { Search } from "lucide-react";

const CATS = ["Tümü", "PDF", "Görsel", "Dönüştür"] as const;

const tools = [
  // PDF
  { title: "PDF Birleştir",  description: "Birden fazla PDF dosyasını tek belgede birleştir.",         href: "/pdf/merge",          icon: "📄", badge: "Popüler", cat: "PDF" },
  { title: "PDF Böl",        description: "PDF sayfalarını ayrı dosyalara böl.",                       href: "/pdf/split",          icon: "✂️", cat: "PDF" },
  { title: "PDF Düzenle",    description: "Sayfa sil, yeniden sırala, sürükle-bırak ile düzenle.",     href: "/pdf/edit",           icon: "🖊️", cat: "PDF" },
  { title: "PDF Filigran",   description: "Sayfalarına GİZLİ, TASLAK gibi metin filigranı ekle.",     href: "/pdf/watermark",      icon: "🔏", badge: "Yeni", cat: "PDF" },
  { title: "PDF İmzala",     description: "İmzanı çiz ve PDF sayfasına göm.",                         href: "/pdf/sign",           icon: "✍️", badge: "Yeni", cat: "PDF" },
  { title: "PDF → Word",     description: "PDF dosyasını Word formatına çevir.",                       href: "/pdf/to-word",        icon: "📝", cat: "PDF" },
  // Görsel
  { title: "Görsel Sıkıştır", description: "JPG, PNG ve WEBP dosyalarını kalite kaybetmeden küçült.", href: "/image/compress",     icon: "🗜️", badge: "Popüler", cat: "Görsel" },
  { title: "Format Dönüştür", description: "JPG ↔ PNG ↔ WEBP dönüşümü anında.",                     href: "/image/convert",      icon: "🔄", cat: "Görsel" },
  { title: "Arka Plan Sil",   description: "Görsellerden arka planı AI ile otomatik sil.",             href: "/image/remove-bg",    icon: "🪄", badge: "AI", cat: "Görsel" },
  // Dönüştür
  { title: "Word → PDF",     description: "Word belgelerini PDF formatına dönüştür.",         href: "/convert/word-to-pdf",     icon: "📋", cat: "Dönüştür" },
  { title: "Excel → PDF",    description: "Excel (XLSX/XLS) dosyalarını PDF'e dönüştür.",    href: "/convert/excel-to-pdf",    icon: "📊", badge: "Yeni", cat: "Dönüştür" },
  { title: "HTML → PDF",     description: "HTML kodunu veya dosyasını PDF'e dönüştür.",      href: "/convert/html-to-pdf",     icon: "🌐", badge: "Yeni", cat: "Dönüştür" },
  { title: "Markdown → PDF", description: "Markdown metnini veya .md dosyasını PDF'e çevir.",href: "/convert/markdown-to-pdf",  icon: "📝", badge: "Yeni", cat: "Dönüştür" },
];

export default function Home() {
  const [activeCat, setActiveCat] = useState<(typeof CATS)[number]>("Tümü");
  const [search, setSearch] = useState("");

  const filtered = tools.filter((t) => {
    const matchCat = activeCat === "Tümü" || t.cat === activeCat;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Başlık + Arama */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Ücretsiz Online Araçlar
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          {tools.length} araç — PDF, görsel ve dosya işlemleri. Tamamen ücretsiz,
          tarayıcıda çalışır, dosyalar sunucuya gitmez.
        </p>

        {/* Arama kutusu */}
        <div className="relative max-w-lg mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Araç ara — PDF birleştir, arka plan sil…"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
          />
        </div>

        {/* Kategori tabları */}
        <div className="flex flex-wrap gap-2 justify-center">
          {CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCat === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
              {cat !== "Tümü" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({tools.filter((t) => t.cat === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Araç listesi */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">"{search}" için araç bulunamadı</p>
          <p className="text-sm mt-1">Farklı bir kelime dene</p>
        </div>
      )}
    </div>
  );
}
