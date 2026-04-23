"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import ToolCard from "@/components/ToolCard";
import AnimatedCounter from "@/components/AnimatedCounter";
import RecentTools from "@/components/RecentTools";
import { Search, Sparkles, FileText, Image, Video, RefreshCw, LayoutGrid } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";
import { cn } from "@/lib/utils";

const CAT_ICONS: Record<string, React.ReactNode> = {
  all:     <LayoutGrid className="w-3.5 h-3.5" />,
  pdf:     <FileText className="w-3.5 h-3.5" />,
  image:   <Image className="w-3.5 h-3.5" />,
  convert: <RefreshCw className="w-3.5 h-3.5" />,
  video:   <Video className="w-3.5 h-3.5" />,
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
    // PDF (16)
    { ...t.pdfMerge,        href: "/pdf/merge",               cat: cats.pdf },
    { ...t.pdfSplit,        href: "/pdf/split",               cat: cats.pdf },
    { ...t.pdfEdit,         href: "/pdf/edit",                cat: cats.pdf },
    { ...t.pdfCompress,     href: "/pdf/compress",            cat: cats.pdf },
    { ...t.pdfRotate,       href: "/pdf/rotate",              cat: cats.pdf },
    { ...t.pdfPageNumber,   href: "/pdf/page-number",         cat: cats.pdf },
    { ...t.pdfToJpg,        href: "/pdf/to-jpg",              cat: cats.pdf },
    { ...t.pdfFromJpg,      href: "/pdf/from-jpg",            cat: cats.pdf },
    { ...t.pdfWatermark,    href: "/pdf/watermark",           cat: cats.pdf },
    { ...t.pdfSign,         href: "/pdf/sign",                cat: cats.pdf },
    { ...t.pdfToWord,       href: "/pdf/to-word",             cat: cats.pdf },
    { ...t.pdfLock,         href: "/pdf/lock",                cat: cats.pdf },
    { ...t.pdfUnlock,       href: "/pdf/unlock",              cat: cats.pdf },
    { ...t.pdfCrop,         href: "/pdf/crop",                cat: cats.pdf },
    { ...t.pdfFormFill,     href: "/pdf/form-fill",           cat: cats.pdf },
    { ...t.pdfAnnotate,     href: "/pdf/annotate",            cat: cats.pdf },
    // Image (13)
    { ...t.imgCompress,     href: "/image/compress",          cat: cats.image },
    { ...t.imgResize,       href: "/image/resize",            cat: cats.image },
    { ...t.imgCrop,         href: "/image/crop",              cat: cats.image },
    { ...t.imgRotate,       href: "/image/rotate",            cat: cats.image },
    { ...t.imgConvert,      href: "/image/convert",           cat: cats.image },
    { ...t.imgRemoveBg,     href: "/image/remove-bg",         cat: cats.image },
    { ...t.imgWatermark,    href: "/image/watermark",         cat: cats.image },
    { ...t.imgAddText,      href: "/image/add-text",          cat: cats.image },
    { ...t.imgHeicToJpg,    href: "/image/heic-to-jpg",       cat: cats.image },
    { ...t.imgToPdf,        href: "/image/to-pdf",            cat: cats.image },
    { ...t.imgExif,         href: "/image/exif",              cat: cats.image },
    { ...t.imgColorPalette, href: "/image/color-palette",     cat: cats.image },
    { ...t.imgOcr,          href: "/image/ocr",               cat: cats.image },
    // Convert (7)
    { ...t.convWordToPdf,   href: "/convert/word-to-pdf",     cat: cats.convert },
    { ...t.convExcelToPdf,  href: "/convert/excel-to-pdf",    cat: cats.convert },
    { ...t.convHtmlToPdf,   href: "/convert/html-to-pdf",     cat: cats.convert },
    { ...t.convMdToPdf,     href: "/convert/markdown-to-pdf", cat: cats.convert },
    { ...t.convBase64,      href: "/convert/base64",          cat: cats.convert },
    { ...t.convJsonFormat,  href: "/convert/json-format",     cat: cats.convert },
    { ...t.convQrCode,      href: "/convert/qr-code",         cat: cats.convert },
    // Video (8)
    { ...t.vidCompress,     href: "/video/compress",          cat: cats.video },
    { ...t.vidTrim,         href: "/video/trim",              cat: cats.video },
    { ...t.vidToMp3,        href: "/video/to-mp3",            cat: cats.video },
    { ...t.vidConvert,      href: "/video/convert",           cat: cats.video },
    { ...t.vidToGif,        href: "/video/to-gif",            cat: cats.video },
    { ...t.vidMerge,        href: "/video/merge",             cat: cats.video },
    { ...t.vidMute,         href: "/video/mute",              cat: cats.video },
    { ...t.vidRotate,       href: "/video/rotate",            cat: cats.video },
  ];

  const CATS = [cats.all, cats.pdf, cats.image, cats.convert, cats.video];
  const catKeys = ["all", "pdf", "image", "convert", "video"];

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
    <div className="min-h-screen">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-14 pb-10 px-4">
        {/* Background blobs */}
        <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-br from-blue-400/20 via-purple-400/15 to-pink-400/10 rounded-full blur-3xl" />
          <div className="absolute top-0 right-[-5%] w-72 h-72 bg-blue-300/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-3xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold mb-6"
          >
            <Sparkles className="w-3.5 h-3.5" />
            {tools.length} {d.description}
          </motion.div>

          {/* Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.08 }}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4 leading-tight"
          >
            {d.heading}
          </motion.h1>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.16 }}
            className="relative max-w-lg mx-auto mb-7"
          >
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={d.searchPlaceholder}
              className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-lg shadow-gray-100/60 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400 text-sm transition-all"
            />
          </motion.div>

          {/* Category tabs */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.22 }}
            className="flex flex-wrap gap-2 justify-center"
          >
            {CATS.map((cat, i) => (
              <button
                key={cat}
                onClick={() => setActiveCat(cat)}
                className={cn(
                  "flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200",
                  activeCat === cat
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {CAT_ICONS[catKeys[i]]}
                {cat}
                {cat !== cats.all && (
                  <span className="text-xs opacity-60">
                    ({tools.filter((tt) => tt.cat === cat).length})
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ── Stats bar ────────────────────────────────────── */}
      <section className="px-4 mb-6">
        <div className="max-w-3xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { animated: true, end: 50000, suffix: "+", label: stats.files },
              { value: String(tools.length),  label: stats.tools },
              { value: "$0",                   label: stats.free },
              { value: "100%",                 label: stats.privacy },
            ].map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.07, duration: 0.4 }}
                className="flex flex-col items-center gap-0.5 px-3 py-4 rounded-2xl bg-white border border-gray-100"
              >
                <div className="text-xl font-extrabold text-gray-900">
                  {s.animated
                    ? <AnimatedCounter end={s.end!} suffix={s.suffix!} />
                    : s.value}
                </div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Recent tools ─────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-4">
        <RecentTools label={d.recentTools} lang={lang} />
      </div>

      {/* ── Tool grid ────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 pb-16">
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((tool, i) => (
              <motion.div
                key={tool.href}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.025, duration: 0.35 }}
              >
                <ToolCard
                  title={tool.title}
                  description={tool.desc}
                  href={tool.href}
                  icon={tool.icon}
                  badge={tool.badge}
                />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 text-gray-400">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-base font-medium">{dict.common.noResults} &ldquo;{search}&rdquo;</p>
            <p className="text-sm mt-1 text-gray-400">{dict.common.tryDifferent}</p>
          </div>
        )}
      </section>
    </div>
  );
}
