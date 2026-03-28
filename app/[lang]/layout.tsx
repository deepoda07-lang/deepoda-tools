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
        <footer className="mt-16 border-t border-gray-200 dark:border-gray-800 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
          <p>{dict.footer}</p>
        </footer>
      </DictionaryProvider>
    </ThemeProvider>
  );
}
