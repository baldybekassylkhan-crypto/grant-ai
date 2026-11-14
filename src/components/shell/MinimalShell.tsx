"use client";

import type { ReactNode } from "react";
import { Logo } from "@/components/ui/Logo";
import { UI } from "@/content/ui";
import { SUPPORT_EMAIL } from "@/lib/site";
import { useLocale } from "@/lib/useLocale";
import { LanguageMenu } from "./SiteHeader";

/** Minimal shell: slim top bar with centred small logo + language switch, single footer line. */
export function MinimalShell({ children, left, bar }: { children: ReactNode; left?: ReactNode; bar?: ReactNode }) {
  const locale = useLocale();
  return (
    <div className="flex min-h-screen flex-col bg-page">
      <header className="sticky top-0 z-30 bg-page">
        <div className="relative mx-auto grid h-12 max-w-[1152px] grid-cols-[1fr_auto_1fr] items-center px-4 md:mt-2 md:h-9">
          <div className="flex items-center">{left}</div>
          <Logo locale={locale} small />
          <div className="flex justify-end">
            <LanguageMenu compact />
          </div>
        </div>
        {bar}
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <footer className="px-4 py-8 text-center text-[13px] font-semibold text-muted">
        {UI.needHelp[locale]} {SUPPORT_EMAIL}
      </footer>
    </div>
  );
}
