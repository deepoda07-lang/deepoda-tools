"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

interface RecentItem {
  href: string;
  title: string;
  icon: string;
}

interface Props {
  label: string;
  lang: string;
}

const STORAGE_KEY = "deepoda_recent";

export default function RecentTools({ label, lang }: Props) {
  const [items, setItems] = useState<RecentItem[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]");
      setItems(stored);
    } catch {
      // localStorage unavailable
    }
  }, []);

  if (items.length === 0) return null;

  const prefix = lang === "en" ? "" : `/${lang}`;

  return (
    <div className="mb-8">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item) => (
          <Link
            key={item.href}
            href={`${prefix}${item.href}`}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white border border-gray-200 text-sm text-gray-700 hover:border-blue-400 hover:text-blue-600 transition-colors shadow-sm"
          >
            <span>{item.icon}</span>
            <span>{item.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
