export const LOCALES = ["kk", "ru"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "kk";
export type L<T = string> = Record<Locale, T>;

export const LOCALE_LABEL: L = { kk: "Қазақша", ru: "Русский" };
export const LOCALE_SHORT: L = { kk: "ҚАЗ", ru: "РУС" };
export const HTML_LANG: L = { kk: "kk", ru: "ru" };

export const isLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);
export const asLocale = (v: string | undefined): Locale => (v && isLocale(v) ? v : DEFAULT_LOCALE);
export const other = (l: Locale): Locale => (l === "kk" ? "ru" : "kk");

/** Prefix a locale-less path ("/tools") with the locale ("/kk/tools"). */
export const lp = (l: Locale, path = "") => `/${l}${path === "/" ? "" : path}`;

/** Swap the locale segment of a full pathname. */
export const swapLocale = (pathname: string, to: Locale) => pathname.replace(/^\/(kk|ru)(?=\/|$)/, `/${to}`) || `/${to}`;
