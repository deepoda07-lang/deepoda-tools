import Link from "next/link";
import { FileQuestion, ArrowLeft, FileText, Image, Video, RefreshCw } from "lucide-react";

export default function NotFound() {
  const categories = [
    { icon: "📄", label: "PDF Tools", href: "/pdf", count: "15 tools" },
    { icon: "🖼️", label: "Image Tools", href: "/image", count: "10 tools" },
    { icon: "🎬", label: "Video Tools", href: "/video", count: "8 tools" },
    { icon: "🔄", label: "Convert", href: "/convert", count: "4 tools" },
  ];

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      {/* Icon + code */}
      <div className="flex flex-col items-center mb-8">
        <div className="w-24 h-24 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <FileQuestion className="w-12 h-12 text-blue-400" />
        </div>
        <p className="text-7xl font-black text-gray-100 select-none leading-none">404</p>
      </div>

      {/* Message */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2 text-center">Page not found</h1>
      <p className="text-gray-500 text-center max-w-sm mb-10">
        The tool or page you&apos;re looking for doesn&apos;t exist. Maybe it was moved, or you typed the URL wrong.
      </p>

      {/* Category shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10 w-full max-w-lg">
        {categories.map((cat) => (
          <Link
            key={cat.href}
            href={cat.href}
            className="flex flex-col items-center gap-1.5 p-4 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all text-center group"
          >
            <span className="text-2xl">{cat.icon}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600">{cat.label}</span>
            <span className="text-xs text-gray-400">{cat.count}</span>
          </Link>
        ))}
      </div>

      {/* Back home */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to home
      </Link>
    </div>
  );
}
