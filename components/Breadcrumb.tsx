"use client";
import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";

interface Crumb {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  crumbs: Crumb[];
}

export default function Breadcrumb({ crumbs }: BreadcrumbProps) {
  const dict = useDictionary();

  return (
    <nav className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-6">
      <Link href="/" className="flex items-center gap-1 hover:text-blue-600 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span>{dict.common.home}</span>
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600" />
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-blue-600 transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-gray-900 dark:text-gray-100 font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
