"use client";

import Link from "next/link";
import { PlanButton } from "@/components/ui/PlanAware";
import { usePathname } from "next/navigation";
import { ChevronDown, Globe, Menu, UserRound, X } from "lucide-react";
import { useAccount } from "@/lib/account";
import { useEffect, useRef, useState } from "react";
import { Logo } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { UI } from "@/content/ui";
import { LOCALES, LOCALE_LABEL, LOCALE_SHORT, lp, swapLocale, type Locale } from "@/lib/i18n";
import { MAIN_NAV, isActive } from "@/lib/site";
import { useLocale } from "@/lib/useLocale";
import { cn } from "@/lib/cn";

export function LanguageMenu({ compact = false }: { compact?: boolean }) {
  const locale = useLocale();
  const pathname = usePathname() ?? `/${locale}`;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[14px] font-bold text-muted transition-colors hover:bg-surface hover:text-ink",
          compact && "px-2",
        )}
      >
        <Globe aria-hidden className="size-4" />
        {LOCALE_SHORT[locale]}
        <span className="sr-only">— {UI.changeLanguage[locale]}</span>
        <ChevronDown aria-hidden className={cn("size-3.5 transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <ul role="menu" className="pop-in absolute right-0 top-11 z-50 w-48 rounded-2xl bg-card p-2 shadow-soft-ring">
          {LOCALES.map((l) => (
            <li key={l} role="none">
              <Link
                role="menuitem"
                href={swapLocale(pathname, l)}
                hrefLang={l}
                lang={l}
                aria-current={l === locale ? "true" : undefined}
                className={cn(
                  "flex min-h-10 items-center justify-between rounded-xl px-3 text-[14px] hover:bg-surface",
                  l === locale ? "font-extrabold text-ink" : "font-semibold text-muted",
                )}
                onClick={() => setOpen(false)}
              >
                {LOCALE_LABEL[l]} {l === locale && <span className="text-[12px] text-muted">{UI.current[locale]}</span>}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function MobileDrawer({ open, onClose, pathname, locale, signedIn }: { open: boolean; onClose: () => void; pathname: string; locale: Locale; signedIn: boolean }) {
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label={UI.menu[locale]}>
      <button aria-label={UI.closeMenu[locale]} className="absolute inset-0 bg-ink/40" onClick={onClose} tabIndex={-1} />
      <div className="slide-prev absolute inset-y-0 left-0 flex h-full w-[86%] max-w-sm flex-col bg-page shadow-soft">
        <div className="flex h-16 items-center justify-between border-b border-line px-4">
          <Logo locale={locale} />
          <button ref={closeRef} type="button" onClick={onClose} aria-label={UI.closeMenu[locale]} className="inline-flex size-11 items-center justify-center rounded-full hover:bg-surface">
            <X className="size-5" />
          </button>
        </div>
        <nav aria-label={UI.menu[locale]} className="flex-1 overflow-y-auto p-4">
          <ul className="space-y-1">
            {MAIN_NAV.map((n) => {
              const active = isActive(pathname, n.match);
              return (
                <li key={n.path}>
                  <Link
                    href={lp(locale, n.path)}
                    onClick={onClose}
                    aria-current={active ? "page" : undefined}
                    className={cn("flex min-h-12 items-center rounded-2xl px-4 text-[17px] font-extrabold", active ? "bg-primary-tint-2 text-primary-nav" : "text-ink hover:bg-surface")}
                  >
                    {n.label[locale]}
                  </Link>
                </li>
              );
            })}
          </ul>
          <div className="mt-6 border-t border-line pt-6">
            <Link href={lp(locale, signedIn ? "/account" : "/login")} onClick={onClose} className="flex min-h-12 items-center px-4 text-[16px] font-bold text-muted hover:text-ink">
              {signedIn ? "Кабинет" : UI.login[locale]}
            </Link>
            <div className="px-2">
              <LanguageMenu />
            </div>
          </div>
        </nav>
        <div className="border-t border-line p-4">
          <PlanButton href={lp(locale, "/quiz")} size="lg" className="w-full">
            {UI.start[locale]}
          </PlanButton>
        </div>
      </div>
    </div>
  );
}

export function SiteHeader() {
  const locale = useLocale();
  const pathname = usePathname() ?? `/${locale}`;
  const [drawer, setDrawer] = useState(false);
  const [hasPlan, setHasPlan] = useState(false);
  const account = useAccount();
  useEffect(() => {
    const check = () => {
      try {
        setHasPlan(!!JSON.parse(localStorage.getItem("grantai:unt-quiz") || "null")?.role);
      } catch {}
    };
    check();
    window.addEventListener("grantai:plan", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("grantai:plan", check);
      window.removeEventListener("storage", check);
    };
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-line bg-page">
      <div className="container-site flex h-full items-center gap-2 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <div className="flex items-center gap-1">
          <button
            type="button"
            className="-ml-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-surface lg:hidden"
            aria-label={UI.openMenu[locale]}
            aria-expanded={drawer}
            onClick={() => setDrawer(true)}
          >
            <Menu className="size-5" />
          </button>
          <Logo locale={locale} />
        </div>

        <nav aria-label={UI.menu[locale]} className="hidden lg:block">
          <ul className="flex items-center gap-0.5 xl:gap-1">
            {MAIN_NAV.map((n) => {
              const active = isActive(pathname, n.match);
              return (
                <li key={n.path}>
                  <Link
                    href={lp(locale, n.path)}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "inline-flex h-9 items-center whitespace-nowrap rounded-full px-3 py-2 text-[14px] font-bold leading-5 transition-colors duration-150 xl:px-4",
                      active ? "bg-primary-tint-2 text-primary-nav" : "text-muted hover:bg-surface hover:text-ink",
                    )}
                  >
                    {n.label[locale]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center justify-end gap-1 lg:ml-0 lg:gap-2">
          <div className="hidden lg:block">
            <LanguageMenu />
          </div>
          <Link href={lp(locale, account.user ? "/account" : "/login")} className="hidden min-h-9 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[14px] font-bold text-muted hover:text-ink lg:inline-flex">
            <UserRound className="size-4" aria-hidden />
            <span className="hidden xl:inline">{account.user ? (locale === "kk" ? "Кабинет" : "Кабинет") : UI.login[locale]}</span>
            <span className="sr-only xl:hidden">{account.user ? "Кабинет" : UI.login[locale]}</span>
          </Link>
          {hasPlan ? (
            <Button href={lp(locale, "/plan")} size="md" arrow={false} className="whitespace-nowrap">
              {locale === "kk" ? "Жоспарым" : "Мой план"}
            </Button>
          ) : (
            <PlanButton href={lp(locale, "/quiz")} size="md" className="whitespace-nowrap">
              {UI.start[locale]}
            </PlanButton>
          )}
        </div>
      </div>
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} pathname={pathname} locale={locale} signedIn={!!account.user} />
    </header>
  );
}
