import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  badge?: string;
}

export default function ToolCard({ title, description, href, icon, badge }: ToolCardProps) {
  return (
    <Link
      href={href}
      className="group flex flex-col gap-3 p-6 rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-50 transition-all duration-300 bg-white"
    >
      <div className="flex items-start justify-between">
        <span className="text-3xl">{icon}</span>
        {badge && (
          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
            badge === "AI"      ? "bg-purple-100 text-purple-700" :
            badge === "Yeni"    ? "bg-emerald-100 text-emerald-700" :
            badge === "Popüler" ? "bg-blue-100 text-blue-700" :
                                  "bg-gray-100 text-gray-600"
          }`}>
            {badge}
          </span>
        )}
      </div>

      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>

      <div className="flex items-center gap-1.5 text-sm font-semibold text-blue-600 pt-3 border-t border-gray-100 opacity-0 group-hover:opacity-100 transition-opacity">
        Kullan <ArrowRight className="w-4 h-4" />
      </div>
    </Link>
  );
}
