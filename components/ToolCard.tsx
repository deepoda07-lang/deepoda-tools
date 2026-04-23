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
      ? "bg-purple-100 text-purple-700 border-purple-200"
      : badge === "New" || badge === "Yeni" || badge === "Nuevo"
      ? "bg-emerald-100 text-emerald-700 border-emerald-200"
      : badge === "Popular" || badge === "Popüler"
      ? "bg-blue-100 text-blue-700 border-blue-200"
      : "bg-gray-100 text-gray-600 border-gray-200";

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex flex-col items-center text-center gap-4 p-6 rounded-xl transition-all duration-300",
        "bg-white",
        "border-2 border-gray-200",
        "hover:border-blue-400",
        "hover:shadow-xl hover:shadow-blue-50/80",
        "hover:-translate-y-1"
      )}
    >
      {badge && (
        <span className={cn(
          "absolute top-3 right-3 text-[10px] font-bold px-2 py-0.5 rounded-full border shrink-0",
          badgeStyle
        )}>
          {badge}
        </span>
      )}

      <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-3xl select-none">
        {icon}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1.5 text-sm group-hover:text-blue-600 transition-colors leading-snug">
          {title}
        </h3>
        <p className="text-xs text-gray-500 leading-relaxed line-clamp-2">{description}</p>
      </div>

      <div className="flex items-center gap-1 text-xs font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-200">
        {dict.common.use} <ArrowRight className="w-3.5 h-3.5" />
      </div>
    </Link>
  );
}
