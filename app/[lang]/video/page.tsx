import { getDictionary, hasLocale } from "@/lib/dictionaries";
import type { Metadata } from "next";
import CategoryPageClient from "@/components/CategoryPageClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.catPages.video.metaTitle,
    description: dict.catPages.video.metaDesc,
  };
}

export default async function VideoPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) return null;
  const dict = await getDictionary(lang);
  const t = dict.t;

  const tools = [
    { ...t.vidCompress, href: "/video/compress" },
    { ...t.vidTrim, href: "/video/trim" },
    { ...t.vidToMp3, href: "/video/to-mp3" },
    { ...t.vidConvert, href: "/video/convert" },
    { ...t.vidToGif, href: "/video/to-gif" },
    { ...t.vidMerge, href: "/video/merge" },
    { ...t.vidMute, href: "/video/mute" },
    { ...t.vidRotate, href: "/video/rotate" },
  ];

  return <CategoryPageClient catKey="video" tools={tools} />;
}
