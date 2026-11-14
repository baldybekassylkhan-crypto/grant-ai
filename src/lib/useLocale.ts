"use client";

import { useParams } from "next/navigation";
import { asLocale, type Locale } from "./i18n";

export function useLocale(): Locale {
  const p = useParams<{ locale?: string }>();
  return asLocale(p?.locale);
}
