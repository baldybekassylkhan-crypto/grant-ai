import type { L } from "./i18n";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://grant.ai").replace(/\/$/, "");
export const BRAND = "grant.ai";
export const COMPANY = "[COMPANY NAME]";
export const SUPPORT_EMAIL = "[SUPPORT EMAIL]";
export const PARTNER_EMAIL = "[PARTNERS EMAIL]";
export const NTC_URL = "https://testcenter.kz";

export const MAIN_NAV: { label: L; path: string; match: string[] }[] = [
  { label: { kk: "Жаттығу", ru: "Практика" }, path: "/games/hronologiya", match: ["/games"] },
  { label: { kk: "Пробный тест", ru: "Пробный тест" }, path: "/mock-tests", match: ["/mock-tests", "/mock"] },
  { label: { kk: "Құралдар", ru: "Инструменты" }, path: "/tools", match: ["/tools"] },
  { label: { kk: "Университеттер", ru: "Вузы" }, path: "/universities", match: ["/universities", "/programs"] },
  { label: { kk: "Нұсқаулықтар", ru: "Гайды" }, path: "/guides", match: ["/guides", "/authors"] },
  { label: { kk: "Кепілдік", ru: "Гарантия" }, path: "/guarantee", match: ["/guarantee"] },
];

/** pathname includes the locale; match entries do not. */
export function isActive(pathname: string, match: string[]) {
  const rest = pathname.replace(/^\/(kk|ru)/, "") || "/";
  return match.some((m) => rest === m || rest.startsWith(m + "/"));
}
