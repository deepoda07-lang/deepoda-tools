import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "PDF Araçları",
  description: "PDF birleştir, böl ve dönüştür. Ücretsiz, tarayıcıda çalışır.",
};

const tools = [
  { title: "PDF Birleştir", description: "Birden fazla PDF'i tek belgede birleştir.", href: "/pdf/merge", icon: "📄", badge: "Popüler" },
  { title: "PDF Böl", description: "PDF sayfalarını ayrı dosyalara böl.", href: "/pdf/split", icon: "✂️" },
  { title: "PDF → Word", description: "PDF dosyasını Word formatına çevir.", href: "/pdf/to-word", icon: "📝" },
];

export default function PDFPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">PDF Araçları</h1>
      <p className="text-gray-500 mb-8">Tüm işlemler tarayıcınızda gerçekleşir.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => <ToolCard key={t.href} {...t} />)}
      </div>
    </div>
  );
}
