import Link from "next/link";

interface RelatedItem {
  href: string;
  title: string;
  icon: string;
}

interface Props {
  label: string;
  items: RelatedItem[];
  lang: string;
}

export default function RelatedTools({ label, items, lang }: Props) {
  if (!items.length) return null;
  const prefix = lang === "en" ? "" : `/${lang}`;

  return (
    <section className="mt-10 border-t border-gray-100 pt-8 pb-4">
      <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">{label}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={`${prefix}${item.href}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 bg-white hover:border-blue-300 hover:shadow-md hover:shadow-blue-50 transition-all group"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-600 transition-colors">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
