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
    <section className="mt-10 border-t border-gray-100 dark:border-gray-800 pt-8 pb-4">
      <h2 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">{label}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {items.map((item) => (
          <Link
            key={item.href}
            href={`${prefix}${item.href}`}
            className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-blue-300 dark:hover:border-blue-500 hover:shadow-md hover:shadow-blue-50 dark:hover:shadow-blue-950 transition-all group"
          >
            <span className="text-2xl">{item.icon}</span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 transition-colors">
              {item.title}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
