"use client";

import { useState } from "react";
import ToolCard from "@/components/ToolCard";
import { Search } from "lucide-react";

const CATS = ["All", "PDF", "Image", "Convert", "Video"] as const;

const tools = [
  // PDF
  { title: "Merge PDF",         description: "Combine multiple PDF files into a single document.",          href: "/pdf/merge",          icon: "📄", badge: "Popular", cat: "PDF" },
  { title: "Split PDF",         description: "Split PDF pages into separate files.",                        href: "/pdf/split",          icon: "✂️", cat: "PDF" },
  { title: "Edit PDF",          description: "Delete pages, reorder, drag & drop to arrange.",              href: "/pdf/edit",           icon: "🖊️", cat: "PDF" },
  { title: "PDF Watermark",     description: "Add text watermarks like CONFIDENTIAL, DRAFT to pages.",      href: "/pdf/watermark",      icon: "🔏", badge: "New", cat: "PDF" },
  { title: "Sign PDF",          description: "Draw your signature and embed it into a PDF page.",           href: "/pdf/sign",           icon: "✍️", badge: "New", cat: "PDF" },
  { title: "PDF → Word",        description: "Convert a PDF file to Word format.",                          href: "/pdf/to-word",        icon: "📝", cat: "PDF" },
  // Image
  { title: "Compress Image",    description: "Shrink JPG, PNG, and WEBP files without quality loss.",       href: "/image/compress",     icon: "🗜️", badge: "Popular", cat: "Image" },
  { title: "Convert Format",    description: "Instantly convert between JPG ↔ PNG ↔ WEBP.",               href: "/image/convert",      icon: "🔄", cat: "Image" },
  { title: "Remove Background", description: "Automatically remove image backgrounds with AI.",             href: "/image/remove-bg",    icon: "🪄", badge: "AI", cat: "Image" },
  // Convert
  { title: "Word → PDF",        description: "Convert Word documents to PDF format.",                       href: "/convert/word-to-pdf",    icon: "📋", cat: "Convert" },
  { title: "Excel → PDF",       description: "Convert Excel (XLSX/XLS) files to PDF.",                     href: "/convert/excel-to-pdf",   icon: "📊", badge: "New", cat: "Convert" },
  { title: "HTML → PDF",        description: "Convert HTML code or a file to PDF.",                         href: "/convert/html-to-pdf",    icon: "🌐", badge: "New", cat: "Convert" },
  { title: "Markdown → PDF",    description: "Convert Markdown text or a .md file to PDF.",                 href: "/convert/markdown-to-pdf", icon: "📝", badge: "New", cat: "Convert" },
  // Video
  { title: "Compress Video",    description: "Shrink video files without losing quality.",                  href: "/video/compress", icon: "🗜️", badge: "New", cat: "Video" },
  { title: "Trim Video",        description: "Cut any portion of your video and download it.",              href: "/video/trim",     icon: "✂️", badge: "New", cat: "Video" },
  { title: "Video → MP3",       description: "Extract audio from video and download as MP3.",              href: "/video/to-mp3",   icon: "🎵", badge: "New", cat: "Video" },
  { title: "Convert Video",     description: "Switch format between MP4, WEBM, AVI, MOV.",                href: "/video/convert",  icon: "🔄", badge: "New", cat: "Video" },
  { title: "Video → GIF",       description: "Convert a video clip into an animated GIF.",                 href: "/video/to-gif",   icon: "🎞️", badge: "New", cat: "Video" },
  { title: "Merge Videos",      description: "Join multiple video files into one.",                        href: "/video/merge",    icon: "🔗", badge: "New", cat: "Video" },
  { title: "Mute Video",        description: "Remove all audio from a video file.",                        href: "/video/mute",     icon: "🔇", badge: "New", cat: "Video" },
  { title: "Rotate Video",      description: "Rotate or flip your video 90°, 180°.",                      href: "/video/rotate",   icon: "🔃", badge: "New", cat: "Video" },
];

export default function Home() {
  const [activeCat, setActiveCat] = useState<(typeof CATS)[number]>("All");
  const [search, setSearch] = useState("");

  const filtered = tools.filter((t) => {
    const matchCat = activeCat === "All" || t.cat === activeCat;
    const matchSearch =
      t.title.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* Heading + Search */}
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900 mb-3">
          Free Online Tools
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          {tools.length} tools — PDF, image, and file operations. Completely free,
          runs in your browser, files never leave your device.
        </p>

        {/* Search box */}
        <div className="relative max-w-lg mx-auto mb-8">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tools — merge PDF, remove background…"
            className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-gray-200 bg-white shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm transition-all"
          />
        </div>

        {/* Category tabs */}
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
              {cat !== "All" && (
                <span className="ml-1.5 text-xs opacity-70">
                  ({tools.filter((t) => t.cat === cat).length})
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tool list */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((tool) => (
            <ToolCard key={tool.href} {...tool} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <Search className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-lg font-medium">No tools found for "{search}"</p>
          <p className="text-sm mt-1">Try a different keyword</p>
        </div>
      )}
    </div>
  );
}
