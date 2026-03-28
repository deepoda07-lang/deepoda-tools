"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string | null;
}

export default function ToolCard({ title, description, href, icon, badge }: ToolCardProps) {
  const dict = useDictionary();

  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-lg hover:shadow-blue-50 dark:hover:shadow-blue-950 transition-all duration-300 bg-white dark:bg-gray-900"
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{icon}</span>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            badge === "AI" || badge === "IA" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300" :
            badge === "New" || badge === "Yeni" || badge === "Nuevo" ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" :
            badge === "Popular" || badge === "Popüler" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300" :
            "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          }`}>
            {badge}
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1.5 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 pt-3 border-t border-gray-100 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-opacity">
        {dict.common.use} <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
