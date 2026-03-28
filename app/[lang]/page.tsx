"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import RecentTools from "@/components/RecentTools";
import { Search } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

export default function Home() {
  const dict = useDictionary();
  const d = dict.home;
  const pathname = usePathname();
  const pathLang = pathname.split("/")[1];
  const lang = ["tr", "es"].includes(pathLang) ? pathLang : "en";
  const t = dict.t;
  const cats = dict.cats;

  const tools = [
    { ...t.pdfMerge, href: "/pdf/merge", cat: cats.pdf },
    { ...t.pdfSplit, href: "/pdf/split", cat: cats.pdf },
    { ...t.pdfEdit, href: "/pdf/edit", cat: cats.pdf },
    { ...t.pdfWatermark, href: "/pdf/watermark", cat: cats.pdf },
    { ...t.pdfSign, href: "/pdf/sign", cat: cats.pdf },
    { ...t.pdfToWord, href: "/pdf/to-word", cat: cats.pdf },
    { ...t.imgCompress, href: "/image/compress", cat: cats.image },
    { ...t.imgConvert, href: "/image/convert", cat: cats.image },
    { ...t.imgRemoveBg, href: "/image/remove-bg", cat: cats.image },
    { ...t.convWordToPdf, href: "/convert/word-to-pdf", cat: cats.convert },
    { ...t.convExcelToPdf, href: "/convert/excel-to-pdf", cat: cats.convert },
    { ...t.convHtmlToPdf, href: "/convert/html-to-pdf", cat: cats.convert },
    { ...t.convMdToPdf, href: "/convert/markdown-to-pdf", cat: cats.convert },
    { ...t.vidCompress, href: "/video/compress", cat: cats.video },
    { ...t.vidTrim, href: "/video/trim", cat: cats.video },
    { ...t.vidToMp3, href: "/video/to-mp3", cat: cats.video },
    { ...t.vidConvert, href: "/video/convert", cat: cats.video },
    { ...t.vidToGif, href: "/video/to-gif", cat: cats.video },
    { ...t.vidMerge, href: "/video/merge", cat: cats.video },
    { ...t.vidMute, href: "/video/mute", cat: cats.video },
    { ...t.vidRotate, href: "/video/rotate", cat: cats.video },
    { ...t.convQrCode, href: "/convert/qr-code", cat: cats.convert },
    { ...t.convBase64, href: "/convert/base64", cat: cats.convert },
    { ...t.convJsonFormat, href: "/convert/json-format", cat: cats.convert },
    { ...t.imgExif, href: "/image/exif", cat: cats.image },
    { ...t.imgColorPalette, href: "/image/color-palette", cat: cats.image },
    { ...t.imgOcr, href: "/image/ocr", cat: cats.image },
  ];

  const CATS = [cats.all, cats.pdf, cats.image, cats.convert, cats.video];
  const [activeCat, setActiveCat] = useState(cats.all);
  const [search, setSearch] = useState("");

  const filtered = tools.filter((tool) => {
    const matchCat = activeCat === cats.all || tool.cat === activeCat;
    const matchSearch =
      tool.title.toLowerCase().includes(search.toLowerCase()) ||
      tool.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const stats = dict.home.stats;

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-3">{d.heading}</h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto mb-8">
          {tools.length} {d.description}
        </p>

        <div className="relative max-w-lg mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={d.searchPlaceholder}
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
          />
        </div>

        <div className="flex flex-wrap gap-2 justify-center">
          {CATS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCat === cat
                  ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                  : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
              }`}
            >
              {cat}
              {cat !== cats.all && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({tools.filter((tt) => tt.cat === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <RecentTools label={d.recentTools} lang={lang} />

      {/* Stats bar */}
      <div className="flex flex-wrap justify-center gap-6 mb-10 py-5 border-y border-gray-100 dark:border-gray-800">
        <div className="text-center">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100"><AnimatedCounter end={50000} suffix="+" /></div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stats.files}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">{tools.length}</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stats.tools}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">$0</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stats.free}</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-extrabold text-gray-900 dark:text-gray-100">100%</div>
          <div className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{stats.privacy}</div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.href} title={tool.title} description={tool.desc} href={tool.href} icon={tool.icon} badge={tool.badge} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">{dict.common.noResults} &ldquo;{search}&rdquo;</p>
          <p className="text-sm mt-1">{dict.common.tryDifferent}</p>
        </div>
      )}
    </div>
  );
}
