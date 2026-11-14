"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { cn } from "@/lib/cn";
import { UI } from "@/content/ui";
import { lp } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

export type NavCategory = { slug: string; name: string; color: string };

/** Section sub-nav under the header (not sticky), horizontally scrollable. */
export function SectionNav({ categories }: { categories: NavCategory[] }) {
  const l = useLocale();
  const pathname = usePathname() ?? "";
  const isIndex = pathname === lp(l, "/guides");
  return (
    <nav aria-label={UI.guides[l]} className="border-b border-line bg-page">
      <div className="relative">
        <ul className="container-site no-scrollbar flex gap-2 overflow-x-auto py-3">
          <li className="shrink-0">
            <Link
              href={lp(l, "/guides")}
              aria-current={isIndex ? "page" : undefined}
              className={cn(
                "inline-flex min-h-9 items-center whitespace-nowrap rounded-full px-4 text-[14px] font-bold",
                isIndex ? "bg-surface text-ink ring-line" : "text-muted hover:bg-surface hover:text-ink",
              )}
            >
              {UI.allGuides[l]}
            </Link>
          </li>
          {categories.map((c) => {
            const base = lp(l, `/guides/${c.slug}`);
            const active = pathname === base || pathname.startsWith(base + "/");
            return (
              <li key={c.slug} className="shrink-0">
                <Link
                  href={base}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "inline-flex min-h-9 items-center gap-2 whitespace-nowrap rounded-full px-4 text-[14px] font-bold transition-colors",
                    active ? "bg-info-bg text-info-text" : "text-muted hover:bg-surface hover:text-ink",
                  )}
                >
                  <span aria-hidden className="size-2 rounded-full" style={{ background: c.color }} />
                  {c.name}
                </Link>
              </li>
            );
          })}
        </ul>
        <span aria-hidden className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-page md:hidden" />
      </div>
    </nav>
  );
}

export type IndexBlock = {
  slug: string;
  name: string;
  color: string;
  guides: { title: string; href: string }[];
};

/** Guides index: search + category blocks, filtered client-side. */
export function GuidesBrowser({ blocks }: { blocks: IndexBlock[] }) {
  const l = useLocale();
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const filtered = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return blocks;
    return blocks.map((b) => ({ ...b, guides: b.guides.filter((g) => g.title.toLowerCase().includes(n)) })).filter((b) => b.guides.length);
  }, [q, blocks]);

  return (
    <>
      <label className="relative mt-8 block max-w-[580px]">
        <span className="sr-only">{UI.search[l]}</span>
        <Search aria-hidden className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={l === "kk" ? "Нұсқаулық іздеу" : "Поиск по гайдам"}
          className="h-[52px] w-full rounded-full bg-card pr-5 text-[16px] font-semibold text-ink ring-line placeholder:text-muted"
          style={{ paddingLeft: 52 }}
        />
      </label>
      <p className="sr-only" aria-live="polite">
        {filtered.reduce((n, b) => n + b.guides.length, 0)}
      </p>

      <div className="mt-12 grid gap-12 md:grid-cols-2">
        {filtered.map((b) => {
          const expanded = open[b.slug] || q.length > 0;
          const list = expanded ? b.guides : b.guides.slice(0, 5);
          return (
            <section key={b.slug} aria-labelledby={`cat-${b.slug}`}>
              <div className="flex items-baseline justify-between gap-4 border-b-2 pb-3" style={{ borderColor: b.color }}>
                <h2 id={`cat-${b.slug}`} className="text-[22px] text-ink">
                  <Link href={lp(l, `/guides/${b.slug}`)} className="hover:underline underline-offset-4">
                    {b.name}
                  </Link>
                </h2>
                <span className="shrink-0 text-[13px] font-bold text-muted">{b.guides.length} {l === "kk" ? "нұсқаулық" : "гайдов"}</span>
              </div>
              <ul className="mt-4 space-y-3.5">
                {list.map((g) => (
                  <li key={g.href}>
                    <Link href={g.href} className="text-[15px] font-bold text-ink underline-offset-4 hover:underline">
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
              {b.guides.length > 5 && !q && (
                <button
                  type="button"
                  aria-expanded={expanded}
                  onClick={() => setOpen((s) => ({ ...s, [b.slug]: !s[b.slug] }))}
                  className="mt-4 inline-flex min-h-9 items-center gap-1 text-[14px] font-extrabold"
                  style={{ color: b.color }}
                >
                  {expanded ? UI.showFewer[l] : `${UI.showAll[l]} (${b.guides.length})`}
                  <ChevronDown aria-hidden className={cn("size-4 transition-transform", expanded && "rotate-180")} />
                </button>
              )}
            </section>
          );
        })}
        {filtered.length === 0 && <p className="text-muted">{l === "kk" ? "Ештеңе табылмады" : "Ничего не найдено"}: «{q}»</p>}
      </div>
    </>
  );
}
