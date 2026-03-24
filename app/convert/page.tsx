import type { Metadata } from "next";
import ToolCard from "@/components/ToolCard";

export const metadata: Metadata = {
  title: "Dosya Dönüştür",
  description: "Word ve Excel dosyalarını PDF'e dönüştür.",
};

const tools = [
  { title: "Word → PDF", description: "Word belgelerini PDF formatına dönüştür.", href: "/convert/word-to-pdf", icon: "📋" },
];

export default function ConvertPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Dosya Dönüştür</h1>
      <p className="text-gray-500 mb-8">Tüm işlemler tarayıcınızda gerçekleşir.</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((t) => <ToolCard key={t.href} {...t} />)}
      </div>
    </div>
  );
}
