interface Props {
  title: string;
  desc: string;
  keywords?: string[];
}

export default function ToolSEOSection({ title, desc, keywords }: Props) {
  if (!desc) return null;
  return (
    <section className="mt-10 border-t border-gray-100 pt-8 pb-2">
      <h2 className="text-lg font-bold text-gray-800 mb-2">About {title}</h2>
      <p className="text-sm text-gray-600 leading-relaxed mb-4">{desc}</p>
      {keywords && keywords.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {keywords.slice(0, 8).map((kw) => (
            <span
              key={kw}
              className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium"
            >
              {kw}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
