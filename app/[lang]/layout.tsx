import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import { DictionaryProvider } from "@/components/DictionaryProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { getDictionary, hasLocale, locales } from "@/lib/dictionaries";

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: {
      default: dict.meta.siteTitle,
      template: `%s | Deepoda Tools`,
    },
    description: dict.meta.siteDescription,
    keywords: dict.meta.siteKeywords,
    alternates: {
      languages: {
        en: "https://tools.deepoda.com",
        tr: "https://tools.deepoda.com/tr",
        es: "https://tools.deepoda.com/es",
      },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <ThemeProvider>
      <DictionaryProvider dict={dict}>
        <Navbar lang={lang} />
        <main className="flex-1">{children}</main>
        <footer className="relative mt-16 bg-gray-950 text-gray-500 overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-600/40 to-transparent" />
          <div className="relative max-w-6xl mx-auto px-5 py-10">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex items-center gap-2.5">
                <span className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                  <svg className="w-3.5 h-3.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <span className="font-bold text-sm text-white">tools.<span className="text-blue-400">deepoda</span></span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <p>© {new Date().getFullYear()} {dict.footer}</p>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <a href="https://deepoda.com" className="hover:text-white transition-colors">deepoda.com</a>
                <a href="https://deepoda.com/about" className="hover:text-white transition-colors">About</a>
                <a href="https://deepoda.com/contact" className="hover:text-white transition-colors">Contact</a>
              </div>
            </div>
          </div>
        </footer>
      </DictionaryProvider>
    </ThemeProvider>
  );
}
