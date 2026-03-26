import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Video Araçları – Ücretsiz Online Video İşlemleri",
  description: "Video sıkıştır, kes, dönüştür, MP3 çıkar, GIF yap ve daha fazlası. 8 ücretsiz araç, tarayıcıda.",
};

const tools = [
  { title: "Video Sıkıştır",   description: "Video dosyalarını kalite kaybetmeden küçült.",                  href: "/video/compress", icon: "🗜️", badge: "Popüler" },
  { title: "Video Kes",        description: "Videonun istediğin bölümünü kes ve indir.",                    href: "/video/trim",     icon: "✂️" },
  { title: "Video → MP3",      description: "Videodan ses çıkar, MP3 formatında indir.",                    href: "/video/to-mp3",   icon: "🎵", badge: "Popüler" },
  { title: "Video Dönüştür",   description: "MP4, WEBM, AVI, MOV arasında format dönüşümü.",               href: "/video/convert",  icon: "🔄" },
  { title: "Video → GIF",      description: "Videoyu animasyonlu GIF'e dönüştür.",                          href: "/video/to-gif",   icon: "🎞️" },
  { title: "Video Birleştir",  description: "Birden fazla video dosyasını tek videoda birleştir.",          href: "/video/merge",    icon: "🔗" },
  { title: "Video Sessiz Et",  description: "Videodan sesi tamamen kaldır.",                                href: "/video/mute",     icon: "🔇" },
  { title: "Video Döndür",     description: "Videoyu 90°, 180° döndür veya yatay/dikey çevir.",           href: "/video/rotate",   icon: "🔃" },
];

export default function VideoPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: "Video Araçları" }]} />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">🎬</span>
          <h1 className="text-3xl font-bold text-gray-900">Video Araçları</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} araç
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">
          Video dosyalarınızı düzenleyin, dönüştürün ve optimize edin.
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
