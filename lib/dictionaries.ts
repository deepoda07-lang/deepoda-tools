import "server-only";

const dictionaries = {
  en: () =>
    import("@/dictionaries/en.json").then((m) => m.default),
  tr: () =>
    import("@/dictionaries/tr.json").then((m) => m.default),
  es: () =>
    import("@/dictionaries/es.json").then((m) => m.default),
};

export type Locale = keyof typeof dictionaries;
export const locales: Locale[] = ["en", "tr", "es"];
export const defaultLocale: Locale = "en";

export const hasLocale = (locale: string): locale is Locale =>
  locale in dictionaries;

export const getDictionary = async (locale: Locale) =>
  dictionaries[locale]();

export type Dictionary = Awaited<ReturnType<typeof getDictionary>>;
