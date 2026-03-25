import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "Deepoda Tools – Ücretsiz Online PDF ve Görsel Araçları",
  description:
    "PDF birleştir, böl, imzala, filigran ekle. Görsel sıkıştır, arka plan sil, format dönüştür. Tüm araçlar ücretsiz, tarayıcıda, dosyalar sunucuya gitmez.",
  keywords: [
    "ücretsiz online araçlar",
    "pdf araçları türkçe",
    "görsel araçları ücretsiz",
    "pdf birleştir",
    "arka plan sil",
    "görsel sıkıştır",
  ],
};

const tools = [
  {
    category: "PDF Araçları",
    items: [
      { title: "PDF Birleştir", description: "Birden fazla PDF dosyasını tek belgede birleştir.", href: "/pdf/merge", icon: "📄", badge: "Popüler" },
      { title: "PDF Böl", description: "PDF sayfalarını ayrı dosyalara böl.", href: "/pdf/split", icon: "✂️" },
      { title: "PDF Düzenle", description: "Sayfa sil, yeniden sırala, sürükle-bırak ile düzenle.", href: "/pdf/edit", icon: "🖊️" },
      { title: "PDF Filigran", description: "Sayfalarına GİZLİ, TASLAK gibi metin filigranı ekle.", href: "/pdf/watermark", icon: "🔏", badge: "Yeni" },
      { title: "PDF İmzala", description: "İmzanı çiz ve PDF sayfasına göm.", href: "/pdf/sign", icon: "✍️", badge: "Yeni" },
      { title: "PDF → Word", description: "PDF dosyasını Word formatına çevir.", href: "/pdf/to-word", icon: "📝" },
    ],
  },
  {
    category: "Görsel Araçları",
    items: [
      { title: "Görsel Sıkıştır", description: "JPG, PNG ve WEBP dosyalarını kalite kaybetmeden küçült.", href: "/image/compress", icon: "🗜️", badge: "Popüler" },
      { title: "Format Dönüştür", description: "JPG ↔ PNG ↔ WEBP dönüşümü anında.", href: "/image/convert", icon: "🔄" },
      { title: "Arka Plan Sil", description: "Görsellerden arka planı otomatik sil. Tamamen tarayıcıda çalışır.", href: "/image/remove-bg", icon: "🪄", badge: "AI" },
    ],
  },
  {
    category: "Dosya Dönüştürme",
    items: [
      { title: "Word → PDF", description: "Word belgelerini PDF formatına dönüştür.", href: "/convert/word-to-pdf", icon: "📋" },
    ],
  },
];

export default function Home() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Ücretsiz Online Araçlar
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto">
          PDF, görsel ve dosya işlemleri için güçlü araçlar. Tamamen ücretsiz,
          tarayıcıda çalışır — dosyalarınız sunucuya gitmez.
        </p>
      </div>

      <div className="flex flex-col gap-12">
        {tools.map((group) => (
          <section key={group.category}>
            <h2 className="text-xl font-semibold text-gray-700 mb-4 border-b pb-2">
              {group.category}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {group.items.map((tool) => (
                <ToolCard key={tool.href} {...tool} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
