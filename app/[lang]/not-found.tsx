import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

const POPULAR = [
  { icon: "📄", label: "Merge PDF",          href: "/pdf/merge" },
  { icon: "✂️", label: "Split PDF",          href: "/pdf/split" },
  { icon: "🗜️", label: "Compress Image",     href: "/image/compress" },
  { icon: "🪄", label: "Remove Background",  href: "/image/remove-bg" },
  { icon: "🎬", label: "Compress Video",     href: "/video/compress" },
  { icon: "📝", label: "Word → PDF",         href: "/convert/word-to-pdf" },
];

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none select-none flex items-center justify-center">
        <span className="text-[20rem] font-black text-gray-100 dark:text-gray-800/60 leading-none">
          404
        </span>
      </div>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center max-w-lg">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mb-6">
          <Search className="w-8 h-8 text-blue-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-3">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-10 leading-relaxed">
          The tool or page you&apos;re looking for doesn&apos;t exist. Maybe it was moved or the URL is wrong.
        </p>

        {/* Popular tools */}
        <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">
          Popular tools
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 w-full mb-10">
          {POPULAR.map((tool) => (
            <Link
              key={tool.href}
              href={tool.href}
              className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md hover:shadow-blue-50 dark:hover:shadow-blue-950 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-blue-600 transition-all group"
            >
              <span className="text-lg">{tool.icon}</span>
              <span className="leading-tight">{tool.label}</span>
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
          <span className="text-gray-300 dark:text-gray-700">·</span>
          <Link href="/pdf" className="text-sm text-blue-600 hover:underline font-medium">
            Browse all tools →
          </Link>
        </div>
      </div>
    </div>
  );
}
