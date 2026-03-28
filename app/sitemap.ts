import type { MetadataRoute } from "next";

const BASE_URL = "https://tools.deepoda.com";
const locales = ["en", "tr", "es"];

const paths = [
  { path: "",                         freq: "weekly" as const,  prio: 1 },
  // PDF
  { path: "/pdf",                     freq: "weekly" as const,  prio: 0.9 },
  { path: "/pdf/merge",               freq: "monthly" as const, prio: 0.9 },
  { path: "/pdf/split",               freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/edit",                freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/watermark",           freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/sign",                freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/to-word",             freq: "monthly" as const, prio: 0.7 },
  { path: "/pdf/rotate",              freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/compress",            freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/page-number",         freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/to-jpg",              freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/from-jpg",            freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/lock",                freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/unlock",              freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/crop",                freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/form-fill",           freq: "monthly" as const, prio: 0.8 },
  { path: "/pdf/annotate",            freq: "monthly" as const, prio: 0.8 },
  // Image
  { path: "/image",                   freq: "weekly" as const,  prio: 0.9 },
  { path: "/image/compress",          freq: "monthly" as const, prio: 0.8 },
  { path: "/image/convert",           freq: "monthly" as const, prio: 0.8 },
  { path: "/image/remove-bg",         freq: "monthly" as const, prio: 0.8 },
  { path: "/image/resize",            freq: "monthly" as const, prio: 0.8 },
  { path: "/image/crop",              freq: "monthly" as const, prio: 0.8 },
  { path: "/image/rotate",            freq: "monthly" as const, prio: 0.8 },
  { path: "/image/to-pdf",            freq: "monthly" as const, prio: 0.8 },
  { path: "/image/heic-to-jpg",       freq: "monthly" as const, prio: 0.8 },
  { path: "/image/watermark",         freq: "monthly" as const, prio: 0.8 },
  { path: "/image/add-text",          freq: "monthly" as const, prio: 0.8 },
  // Convert
  { path: "/convert",                 freq: "weekly" as const,  prio: 0.9 },
  { path: "/convert/word-to-pdf",     freq: "monthly" as const, prio: 0.8 },
  { path: "/convert/excel-to-pdf",    freq: "monthly" as const, prio: 0.8 },
  { path: "/convert/html-to-pdf",     freq: "monthly" as const, prio: 0.8 },
  { path: "/convert/markdown-to-pdf", freq: "monthly" as const, prio: 0.8 },
  // Video
  { path: "/video",                   freq: "weekly" as const,  prio: 0.9 },
  { path: "/video/compress",          freq: "monthly" as const, prio: 0.8 },
  { path: "/video/trim",              freq: "monthly" as const, prio: 0.8 },
  { path: "/video/to-mp3",            freq: "monthly" as const, prio: 0.8 },
  { path: "/video/convert",           freq: "monthly" as const, prio: 0.8 },
  { path: "/video/to-gif",            freq: "monthly" as const, prio: 0.8 },
  { path: "/video/merge",             freq: "monthly" as const, prio: 0.8 },
  { path: "/video/mute",              freq: "monthly" as const, prio: 0.8 },
  { path: "/video/rotate",            freq: "monthly" as const, prio: 0.8 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return paths.flatMap(({ path, freq, prio }) =>
    locales.map((lang) => ({
      url: lang === "en" ? `${BASE_URL}${path}` : `${BASE_URL}/${lang}${path}`,
      lastModified: new Date(),
      changeFrequency: freq,
      priority: prio,
    }))
  );
}
