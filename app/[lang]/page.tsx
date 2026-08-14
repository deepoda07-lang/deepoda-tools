"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import RecentTools from "@/components/RecentTools";
import { Search, FileText, Image, Video, RefreshCw, LayoutGrid } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { cn } from "@/lib/utils";

const CAT_KEYS = ["all", "pdf", "image", "convert", "video"] as const;

const CAT_ICONS: Record<string, React.ReactNode> = {
  all:     <LayoutGrid className="w-3.5 h-3.5" />,
  pdf:     <FileText   className="w-3.5 h-3.5" />,
  image:   <Image      className="w-3.5 h-3.5" />,
  convert: <RefreshCw  className="w-3.5 h-3.5" />,
  video:   <Video      className="w-3.5 h-3.5" />,
};

export default function Home() {
  const dict = useDictionary();
  const d = dict.home;
  const pathname = usePathname();
  const pathLang = pathname.split("/")[1];
  const lang = ["tr", "es"].includes(pathLang) ? pathLang : "en";
  const t = dict.t;
  const cats = dict.cats;

  const tools = [
    // ── PDF (17) ──────────────────────────────────────────────
    { ...t.pdfMerge,      href: "/pdf/merge" },
    { ...t.pdfSplit,      href: "/pdf/split" },
    { ...t.pdfEdit,       href: "/pdf/edit" },
    { ...t.pdfOrganize,   href: "/pdf/organize" },
    { ...t.pdfCompress,   href: "/pdf/compress" },
    { ...t.pdfRotate,     href: "/pdf/rotate" },
    { ...t.pdfPageNumber, href: "/pdf/page-number" },
    { ...t.pdfToJpg,      href: "/pdf/to-jpg" },
    { ...t.pdfFromJpg,    href: "/pdf/from-jpg" },
    { ...t.pdfWatermark,  href: "/pdf/watermark" },
    { ...t.pdfSign,       href: "/pdf/sign" },
    { ...t.pdfToWord,     href: "/pdf/to-word" },
    { ...t.pdfLock,       href: "/pdf/lock" },
    { ...t.pdfUnlock,     href: "/pdf/unlock" },
    { ...t.pdfCrop,       href: "/pdf/crop" },
    { ...t.pdfFormFill,   href: "/pdf/form-fill" },
    { ...t.pdfAnnotate,   href: "/pdf/annotate" },
    // ── Image (13) ────────────────────────────────────────────
    { ...t.imgCompress,     href: "/image/compress" },
    { ...t.imgResize,       href: "/image/resize" },
    { ...t.imgCrop,         href: "/image/crop" },
    { ...t.imgRotate,       href: "/image/rotate" },
    { ...t.imgConvert,      href: "/image/convert" },
    { ...t.imgRemoveBg,     href: "/image/remove-bg" },
    { ...t.imgWatermark,    href: "/image/watermark" },
    { ...t.imgAddText,      href: "/image/add-text" },
    { ...t.imgHeicToJpg,    href: "/image/heic-to-jpg" },
    { ...t.imgToPdf,        href: "/image/to-pdf" },
    { ...t.imgExif,         href: "/image/exif" },
    { ...t.imgColorPalette, href: "/image/color-palette" },
    { ...t.imgOcr,          href: "/image/ocr" },
    // ── Convert (7) ───────────────────────────────────────────
    { ...t.convWordToPdf,  href: "/convert/word-to-pdf" },
    { ...t.convExcelToPdf, href: "/convert/excel-to-pdf" },
    { ...t.convHtmlToPdf,  href: "/convert/html-to-pdf" },
    { ...t.convMdToPdf,    href: "/convert/markdown-to-pdf" },
    { ...t.convBase64,     href: "/convert/base64" },
    { ...t.convJsonFormat, href: "/convert/json-format" },
    { ...t.convQrCode,     href: "/convert/qr-code" },
    // ── Video (8) ─────────────────────────────────────────────
    { ...t.vidCompress, href: "/video/compress" },
    { ...t.vidTrim,     href: "/video/trim" },
    { ...t.vidToMp3,    href: "/video/to-mp3" },
    { ...t.vidConvert,  href: "/video/convert" },
    { ...t.vidToGif,    href: "/video/to-gif" },
    { ...t.vidMerge,    href: "/video/merge" },
    { ...t.vidMute,     href: "/video/mute" },
    { ...t.vidRotate,   href: "/video/rotate" },
  ].map((tool) => ({
    ...tool,
    cat: tool.href.startsWith("/pdf")
      ? cats.pdf
      : tool.href.startsWith("/image")
      ? cats.image
      : tool.href.startsWith("/convert")
      ? cats.convert
      : cats.video,
  }));

  const CATS = [cats.all, cats.pdf, cats.image, cats.convert, cats.video];

  const [activeCat, setActiveCat] = useState(cats.all);
  const [search, setSearch] = useState("");

  const filtered = tools.filter((tool) => {
    const matchCat = activeCat === cats.all || tool.cat === activeCat;
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      tool.title.toLowerCase().includes(q) ||
      tool.desc.toLowerCase().includes(q);
    return matchCat && matchSearch;
  });

  return (
    <div className="min-h-screen bg-gray-50">

      {/* ── Page header ──────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-7">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-1.5 tracking-tight">
            {d.heading}
          </h1>
          <p className="text-gray-500 text-sm mb-6">{d.description}</p>

          {/* Search */}
          <div className="relative max-w-xl mx-auto mb-6">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={d.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-400 text-sm transition-all"
            />
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-2 justify-center">
            {CATS.map((cat, i) => (
              <button
                key={cat}
                onClick={() => { setActiveCat(cat); setSearch(""); }}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-150 border",
                  activeCat === cat
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                )}
              >
                {CAT_ICONS[CAT_KEYS[i]]}
                {cat}
                {cat !== cats.all && (
                  <span className={cn("text-xs", activeCat === cat ? "opacity-70" : "opacity-50")}>
                    ({tools.filter((tt) => tt.cat === cat).length})
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Main content ─────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Recent tools */}
        <RecentTools label={d.recentTools} lang={lang} />

        {/* Tool grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {filtered.map((tool) => (
              <ToolCard
                key={tool.href}
                title={tool.title}
                description={tool.desc}
                href={tool.href}
                icon={tool.icon}
                badge={tool.badge}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">{dict.common.noResults} &ldquo;{search}&rdquo;</p>
            <p className="text-sm mt-1">{dict.common.tryDifferent}</p>
          </div>
        )}
      </div>
    </div>
  );
}
