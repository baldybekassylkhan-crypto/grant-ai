"use client";

import { ChevronDown, X } from "lucide-react";
import { PlanButton } from "@/components/ui/PlanAware";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { UI } from "@/content/ui";
import { lp } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

export type TocItem = { id: string; text: string };

/** 3px reading progress bar fixed at the very top. */
export function ReadingBar() {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = document.getElementById("article");
      if (!el) return;
      const r = el.getBoundingClientRect();
      const total = r.height - window.innerHeight;
      setP(total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => {
      window.removeEventListener("scroll", on);
      window.removeEventListener("resize", on);
    };
  }, []);
  return (
    <div aria-hidden className="fixed inset-x-0 top-0 z-[60] h-[3px]">
      <div className="h-full origin-left bg-primary" style={{ transform: `scaleX(${p})` }} />
    </div>
  );
}

function useActiveHeading(items: TocItem[]) {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const on = () => {
      let idx = 0;
      items.forEach((it, i) => {
        const el = document.getElementById(it.id);
        if (el && el.getBoundingClientRect().top <= 120) idx = i;
      });
      setActive(idx);
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [items]);
  return active;
}

/** Desktop sticky TOC with scroll-spy fill track + mobile collapsible bar. */
export function Toc({ items }: { items: TocItem[] }) {
  const l = useLocale();
  const active = useActiveHeading(items);
  const listRef = useRef<HTMLOListElement>(null);
  const [fill, setFill] = useState(0);
  const [open, setOpen] = useState(false);

  useLayoutEffect(() => {
    const li = listRef.current?.children[active] as HTMLElement | undefined;
    if (li) setFill(li.offsetTop + li.offsetHeight);
  }, [active]);

  return (
    <>
      {/* Desktop */}
      <nav aria-label={UI.inThisGuide[l]} className="sticky top-24 hidden lg:block">
        <p className="eyebrow pl-[13px] text-muted">{UI.inThisGuide[l]}</p>
        <div className="relative mt-3">
          <span aria-hidden className="absolute bottom-0 left-0 top-0 w-[3px] rounded-full bg-line" />
          <span aria-hidden className="absolute left-0 top-0 w-[3px] rounded-full bg-primary transition-[height] duration-200" style={{ height: fill }} />
          <ol ref={listRef} className="space-y-0.5 pl-[13px]">
            {items.map((it, i) => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  aria-current={i === active ? "location" : undefined}
                  className={cn(
                    "block rounded-[10px] px-2.5 py-[7px] text-[15px] font-bold leading-5 transition-colors hover:bg-surface",
                    i === active ? "text-ink" : "text-muted",
                  )}
                >
                  {it.text}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      {/* Mobile */}
      <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-card/95 backdrop-blur lg:hidden">
        <button
          type="button"
          aria-expanded={open}
          aria-controls="toc-mobile"
          onClick={() => setOpen((o) => !o)}
          className="flex min-h-12 w-full items-center justify-between gap-3 px-4 text-left"
        >
          <span className="min-w-0">
            <span className="block text-[11px] font-extrabold uppercase tracking-[1.2px] text-muted">{UI.inThisGuide[l]}</span>
            <span className="block truncate text-[15px] font-bold text-ink">{items[active]?.text}</span>
          </span>
          <ChevronDown aria-hidden className={cn("size-5 shrink-0 transition-transform", open && "rotate-180")} />
        </button>
        {open && (
          <ol id="toc-mobile" className="max-h-[60vh] overflow-y-auto border-t border-line px-2 py-2">
            {items.map((it, i) => (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  onClick={() => setOpen(false)}
                  className={cn("block min-h-11 rounded-xl px-3 py-2.5 text-[15px] font-bold", i === active ? "bg-surface text-ink" : "text-muted")}
                >
                  {it.text}
                </a>
              </li>
            ))}
          </ol>
        )}
      </div>
    </>
  );
}

/** Mobile floating CTA pill: appears once the summary box has scrolled out of view. */
export function StickyCta() {
  const l = useLocale();
  const [show, setShow] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  useEffect(() => {
    const el = document.getElementById("summary");
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.bottom < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);
  if (dismissed || !show) return null;
  return (
    <div className="pop-in fixed bottom-4 left-1/2 z-40 flex -translate-x-1/2 items-center gap-1 rounded-full bg-dark-pill p-2 shadow-soft lg:hidden">
      <PlanButton href={lp(l, "/quiz")} size="sm">
        {UI.railCta[l]}
      </PlanButton>
      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label={UI.dismiss[l]}
        className="inline-flex size-11 shrink-0 items-center justify-center rounded-full text-white hover:bg-white/10"
      >
        <X className="size-4" />
      </button>
    </div>
  );
}
