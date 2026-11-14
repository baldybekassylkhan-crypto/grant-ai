"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun, X } from "lucide-react";
import { useEffect, useState } from "react";
import { UI } from "@/content/ui";
import { PlanLink } from "@/components/ui/PlanAware";
import { lp, other, swapLocale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

/** Promo strip — only rendered on mini-app (game) pages. */
export function PromoStrip() {
  const locale = useLocale();
  const pathname = usePathname() ?? "";
  if (!/^\/(kk|ru)\/games\//.test(pathname)) return null;
  return (
    <div className="bg-primary px-4 py-2 text-center text-[13px] font-bold text-white">
      <span aria-hidden>🔥 </span>[OFFER] ·{" "}
      <PlanLink href={lp(locale, "/quiz")} className="underline decoration-2 underline-offset-4 hover:no-underline">
        {UI.promo[locale]}
      </PlanLink>
    </div>
  );
}

const LOCALE_KEY = "grantai:locale-banner-dismissed";

/** Offers the other language at the same path; dismissal is remembered in localStorage. */
export function LocaleBanner() {
  const locale = useLocale();
  const pathname = usePathname() ?? `/${locale}`;
  const [show, setShow] = useState(false);
  useEffect(() => {
    try {
      setShow(localStorage.getItem(LOCALE_KEY) !== "1");
    } catch {
      setShow(true);
    }
  }, []);
  if (!show) return null;
  const to = other(locale);
  return (
    <div className="relative bg-info-bg px-12 py-1.5 text-center text-[13px] font-semibold text-info-text">
      <Link href={swapLocale(pathname, to)} hrefLang={to} lang={to} className="underline-offset-4 hover:underline">
        {UI.localeBanner[locale]}
      </Link>
      <button
        type="button"
        aria-label={UI.dismiss[locale]}
        onClick={() => {
          setShow(false);
          try {
            localStorage.setItem(LOCALE_KEY, "1");
          } catch {}
        }}
        className="absolute right-2 top-1/2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full hover:bg-white/60"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}

export function ThemeToggle() {
  const locale = useLocale();
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  return (
    <button
      type="button"
      onClick={() => {
        const next = !dark;
        setDark(next);
        document.documentElement.classList.toggle("dark", next);
        try {
          localStorage.setItem("grantai:theme", next ? "dark" : "light");
        } catch {}
      }}
      className="inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold text-muted ring-line hover:text-ink"
      aria-pressed={dark}
    >
      {dark ? <Sun className="size-4" aria-hidden /> : <Moon className="size-4" aria-hidden />}
      {dark ? UI.light[locale] : UI.dark[locale]}
    </button>
  );
}
