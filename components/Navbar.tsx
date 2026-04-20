"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { ChevronDown, Globe, Menu, X, Home } from "lucide-react";

import { useDictionary } from "./DictionaryProvider";
import ThemeToggle from "./ThemeToggle";
import { cn } from "@/lib/utils";

const LOCALES = [
  { code: "en", label: "EN", flag: "🇬🇧" },
  { code: "tr", label: "TR", flag: "🇹🇷" },
  { code: "es", label: "ES", flag: "🇪🇸" },
];

export default function Navbar({ lang }: { lang: string }) {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [langOpen, setLangOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);
  const dict = useDictionary();
  const router = useRouter();
  const pathname = usePathname();
  const prefix = lang === "en" ? "" : `/${lang}`;
  const current = LOCALES.find((l) => l.code === lang) ?? LOCALES[0];
  const langRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function switchLocale(target: string) {
    let base = pathname;
    for (const loc of ["tr", "es"]) {
      if (base === `/${loc}`) { base = "/"; break; }
      if (base.startsWith(`/${loc}/`)) { base = base.slice(loc.length + 1); break; }
    }
    router.push(target === "en" ? base : `/${target}${base}`);
    setLangOpen(false);
  }

  const navLinks = [
    { href: `${prefix}/pdf`,     label: dict.navbar.pdf },
    { href: `${prefix}/image`,   label: dict.navbar.image },
    { href: `${prefix}/convert`, label: dict.navbar.convert },
    { href: `${prefix}/video`,   label: dict.navbar.video },
  ];

  const isActive = (href: string) => pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50">
      <div className={cn(
        "transition-all duration-300",
        scrolled
          ? "bg-white/80 dark:bg-gray-950/85 backdrop-blur-xl border-b border-gray-200/60 dark:border-white/8 shadow-sm"
          : "bg-white/95 dark:bg-gray-950/95 border-b border-gray-100 dark:border-gray-900"
      )}>
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-14">

          {/* Logo */}
          <a
            href="https://deepoda.com"
            className="shrink-0 group hover:opacity-90 transition-opacity"
          >
            <img
              src="/deepoda-logo.png"
              alt="Deepoda"
              className="h-8 w-auto group-hover:scale-[1.03] transition-transform"
            />
          </a>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                  isActive(link.href)
                    ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                    : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-white/8"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-1.5">
            {/* deepoda.com link — desktop only */}
            <a
              href="https://deepoda.com"
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 transition-all"
            >
              <Home className="w-3.5 h-3.5" />
              deepoda.com
            </a>

            <ThemeToggle />

            {/* Language switcher */}
            <div className="hidden md:block relative" ref={langRef}>
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/8 rounded-xl transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>{current.flag} {current.label}</span>
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform duration-200", langOpen && "rotate-180")} />
              </button>

              {langOpen && (
                <div className="absolute right-0 top-full mt-2 w-36 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl border border-gray-100 dark:border-gray-700/60 shadow-xl py-1 z-50">
                  {LOCALES.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => switchLocale(l.code)}
                      className={cn(
                        "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                        l.code === lang
                          ? "text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                      )}
                    >
                      <span className="text-base">{l.flag}</span>
                      <span>{l.label}</span>
                      {l.code === lang && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/8 text-gray-700 dark:text-gray-300 transition-colors"
              aria-label={dict.navbar.menu}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 dark:bg-gray-950/95 backdrop-blur-xl border-b border-gray-100 dark:border-gray-800 px-4 py-3 flex flex-col gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "px-3 py-2.5 rounded-xl text-sm font-medium transition-colors",
                isActive(link.href)
                  ? "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/8"
              )}
            >
              {link.label}
            </Link>
          ))}

          <div className="mt-2 pt-3 border-t border-gray-100 dark:border-white/8 flex items-center justify-between">
            <div className="flex gap-1.5">
              {LOCALES.map((l) => (
                <button
                  key={l.code}
                  onClick={() => { switchLocale(l.code); setMobileOpen(false); }}
                  className={cn(
                    "flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
                    l.code === lang
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 dark:bg-white/8 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/15"
                  )}
                >
                  <span>{l.flag}</span>
                  <span>{l.label}</span>
                </button>
              ))}
            </div>
            <ThemeToggle />
          </div>
        </div>
      )}
    </header>
  );
}
