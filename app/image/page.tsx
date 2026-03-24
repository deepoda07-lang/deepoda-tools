import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "Görsel Araçları",
  description: "Görsel sıkıştır, format dönüştür, arka plan sil. Ücretsiz ve tarayıcıda.",
};

const tools = [
  { title: "Görsel Sıkıştır", description: "JPG, PNG ve WEBP dosyalarını kalite kaybetmeden küçült.", href: "/image/compress", icon: "🗜️", badge: "Popüler" },
  { title: "Format Dönüştür", description: "JPG ↔ PNG ↔ WEBP dönüşümü anında.", href: "/image/convert", icon: "🔄" },
  { title: "Arka Plan Sil", description: "Görsellerden arka planı otomatik sil.", href: "/image/remove-bg", icon: "🪄", badge: "AI" },
];

export default function ImagePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Görsel Araçları</h1>
      <p className="text-gray-500 mb-8">Tüm işlemler tarayıcınızda gerçekleşir.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => <ToolCard key={t.href} {...t} />)}
      </div>
    </div>
  );
}
