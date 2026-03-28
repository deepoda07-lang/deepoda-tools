"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { useDictionary } from "./DictionaryProvider";

const LOCALES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "tr", label: "TR", flag: "🇹🇷" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];

export default function Navbar({ lang }: { lang: string }) {
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const dict = useDictionary();
  const router = useRouter();
  const pathname = usePathname();
  const prefix = lang === "en" ? "" : `/${lang}`;
  const current = LOCALES.find((l) => l.code === lang) ?? LOCALES[0];

  function switchLocale(target: string) {
    let base = pathname;
    for (const loc of ["tr", "es"]) {
      if (base === `/${loc}`) { base = "/"; break; }
      if (base.startsWith(`/${loc}/`)) { base = base.slice(loc.length + 1); break; }
    }
    router.push(target === "en" ? base : `/${target}${base}`);
    setLangOpen(false);
  }

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">
        <Link href={prefix || "/"} className="font-bold text-lg text-blue-600">
          tools.deepoda
        </Link>

        <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label={dict.navbar.menu}>
          <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-600 mb-1" />
          <span className="block w-5 h-0.5 bg-gray-600" />
        </button>

        <div className={`${open ? "flex" : "hidden"} md:flex absolute md:static top-14 left-0 w-full md:w-auto bg-white md:bg-transparent flex-col md:flex-row gap-1 md:gap-4 px-4 md:px-0 pb-4 md:pb-0 border-b md:border-0`}>
          <Link href={`${prefix}/pdf`} className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">{dict.navbar.pdf}</Link>
          <Link href={`${prefix}/image`} className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">{dict.navbar.image}</Link>
          <Link href={`${prefix}/convert`} className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">{dict.navbar.convert}</Link>
          <Link href={`${prefix}/video`} className="px-3 py-2 rounded hover:bg-gray-100 text-sm font-medium">{dict.navbar.video}</Link>

          <div className="flex gap-2 md:hidden pt-2 border-t border-gray-100">
            {LOCALES.map((l) => (
              <button key={l.code} onClick={() => { switchLocale(l.code); setOpen(false); }}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm ${l.code === lang ? "bg-blue-600 text-white font-semibold" : "bg-gray-100 text-gray-700"}`}>
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        <div className="hidden md:block relative">
          <button onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1.5 px-3 py-2 text-sm text-gray-600 rounded-lg hover:bg-gray-100">
            {current.flag} {current.label}
            <ChevronDown className={`w-3.5 h-3.5 transition-transform ${langOpen ? "rotate-180" : ""}`} />
          </button>
          {langOpen && (
            <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50">
              {LOCALES.map((l) => (
                <button key={l.code} onClick={() => switchLocale(l.code)}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-gray-50 ${l.code === lang ? "text-blue-600 font-semibold" : "text-gray-700"}`}>
                  {l.flag} {l.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
