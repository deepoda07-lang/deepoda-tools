"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";
import { cn } from "@/lib/utils";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string | null;
}

export default function ToolCard({ title, description, href, icon, badge }: ToolCardProps) {
  const dict = useDictionary();

  const badgeStyle =
    badge === "AI" || badge === "IA"
      ? "bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300 border-purple-200 dark:border-purple-800/40"
      : badge === "New" || badge === "Yeni" || badge === "Nuevo"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40"
      : badge === "Popular" || badge === "Popüler"
      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/40"
      : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 border-gray-200 dark:border-gray-700";

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col gap-3 p-5 rounded-2xl transition-all duration-300",
        "bg-white dark:bg-gray-900/80",
        "border border-gray-100 dark:border-gray-800",
        "hover:border-blue-200 dark:hover:border-blue-800/60",
        "hover:shadow-xl hover:shadow-blue-50/80 dark:hover:shadow-blue-950/30",
        "hover:-translate-y-1"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-3xl leading-none select-none">{icon}</span>
        {badge && (
          <span className={cn(
            "text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
            badgeStyle
          )}>
            {badge}
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 text-sm group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
          {title}
        </h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed line-clamp-2">{description}</p>
      </div>

      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 dark:text-blue-400 pt-2.5 border-t border-gray-100 dark:border-gray-800 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-0 group-hover:translate-x-0.5">
        {dict.common.use} <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}
