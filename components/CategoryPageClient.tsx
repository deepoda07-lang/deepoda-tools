"use client";

import ToolCard from "@/components/ToolCard";
import Breadcrumb from "@/components/Breadcrumb";
import { ArrowRight } from "lucide-react";
import { useDictionary } from "@/components/DictionaryProvider";

interface Tool {
  title: string;
  desc: string;
  badge?: string | null;
  icon: string;
  href: string;
}

interface Props {
  catKey: "pdf" | "image" | "convert" | "video";
  tools: Tool[];
}

export default function CategoryPageClient({ catKey, tools }: Props) {
  const dict = useDictionary();
  const cat = dict.catPages[catKey];
  const otherCats = (["pdf", "image", "convert", "video"] as const).filter(
    (c) => c !== catKey,
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Breadcrumb crumbs={[{ label: cat.title }]} />

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl">{cat.icon}</span>
          <h1 className="text-3xl font-bold text-gray-900">{cat.title}</h1>
          <span className="text-sm font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-600">
            {tools.length} {dict.common.tools}
          </span>
        </div>
        <p className="text-gray-500 max-w-xl">{cat.description}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {tools.map((t) => (
          <ToolCard
            key={t.href}
            title={t.title}
            description={t.desc}
            href={t.href}
            icon={t.icon}
            badge={t.badge}
          />
        ))}
      </div>

      <div className="border-t pt-8">
        <p className="text-sm text-gray-500 mb-4 font-medium">
          {dict.common.otherCategories}
        </p>
        <div className="flex flex-wrap gap-3">
          {otherCats.map((c) => (
            <a
              key={c}
              href={`/${c}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 hover:border-blue-300 hover:text-blue-600 text-sm font-medium text-gray-700 transition-all"
            >
              {dict.catPages[c].icon} {dict.crossCats[c]}{" "}
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
