"use client";

import { Play, X } from "lucide-react";
import { PlanButton } from "@/components/ui/PlanAware";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Logo";
import { SectionHeading } from "@/components/ui/misc";
import { TOUR_TABS, VIDEOS } from "@/content/home";
import { cn } from "@/lib/cn";
import { UI } from "@/content/ui";
import { lp } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

/* ───────────── Video carousel ───────────── */

export function VideoCarousel() {
  const l = useLocale();
  const scroller = useRef<HTMLDivElement>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const paused = useRef(false);
  const [active, setActive] = useState<(typeof VIDEOS)[number] | null>(null);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let acc = 0;
    const tick = () => {
      if (!paused.current) {
        acc += 0.35;
        if (acc >= 1) {
          el.scrollLeft += Math.floor(acc);
          acc -= Math.floor(acc);
        }
        const half = el.scrollWidth / 2;
        if (el.scrollLeft >= half) el.scrollLeft -= half;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const open = (v: (typeof VIDEOS)[number]) => {
    setActive(v);
    dialog.current?.showModal();
  };

  const items = [...VIDEOS, ...VIDEOS];

  return (
    <section className="bg-band py-20">
      <div className="container-site">
        <SectionHeading title={l === "kk" ? "Оқушылар тарихы" : "Истории учеников"} sub={l === "kk" ? "grant.ai-мен дайындалған оқушылардың қысқа видеолары. [PLACEHOLDER VIDEOS]" : "Короткие видео учеников, которые готовились с grant.ai. [PLACEHOLDER VIDEOS]"} />
      </div>
      <div
        ref={scroller}
        className="no-scrollbar mt-8 overflow-x-auto"
        onMouseEnter={() => (paused.current = true)}
        onMouseLeave={() => (paused.current = false)}
        onTouchStart={() => (paused.current = true)}
        onFocus={() => (paused.current = true)}
        onBlur={() => (paused.current = false)}
      >
        <ul className="flex w-max gap-4 px-4 md:px-[max(24px,calc((100vw-1104px)/2))]">
          {items.map((v, i) => (
            <li key={i} aria-hidden={i >= VIDEOS.length || undefined}>
              <button
                type="button"
                tabIndex={i >= VIDEOS.length ? -1 : 0}
                onClick={() => open(v)}
                className="group relative block h-[325px] w-[185px] overflow-hidden rounded-[20px] text-left shadow-soft"
                aria-label={`${v.title[l]} — ${v.handle}`}
                style={{
                  background: `linear-gradient(160deg, hsl(${v.hue} 85% 62%), hsl(${(v.hue + 40) % 360} 75% 40%))`,
                }}
              >
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white">
                  <Mascot size={36} bg="rgba(255,255,255,.25)" />
                  <span className="px-4 text-center font-display text-[15px] leading-tight">{v.title[l]}</span>
                </div>
                <span className="absolute left-1/2 top-1/2 inline-flex size-12 -translate-x-1/2 translate-y-6 items-center justify-center rounded-full bg-white/90 text-ink transition-transform group-hover:scale-110">
                  <Play className="ml-0.5 size-5 fill-ink" aria-hidden />
                </span>
                <span className="absolute right-3 top-3 rounded-full bg-black/45 px-2 py-1 text-[11px] font-bold text-white backdrop-blur">
                  ▶ {v.views}
                </span>
                <span className="absolute bottom-3 left-3 text-[12px] font-extrabold text-white drop-shadow">{v.handle}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="container-site mt-8">
        <PlanButton href={lp(l, "/quiz")} size="lg">
          {UI.buildMyPlan[l]}
        </PlanButton>
      </div>

      <dialog
        ref={dialog}
        onClose={() => setActive(null)}
        onClick={(e) => e.target === dialog.current && dialog.current?.close()}
        className="m-auto w-[min(92vw,400px)] overflow-hidden rounded-[20px] bg-dark-pill p-0 text-white"
      >
        {active && (
          <div className="relative aspect-[9/16] w-full">
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3"
              style={{ background: `linear-gradient(160deg, hsl(${active.hue} 85% 55%), hsl(${(active.hue + 40) % 360} 75% 30%))` }}
            >
              <Mascot size={48} bg="rgba(255,255,255,.25)" />
              <p className="font-display text-[20px]">{active.title[l]}</p>
              <p className="text-[13px] font-bold opacity-80">[VIDEO PLACEHOLDER]</p>
            </div>
            <button
              type="button"
              onClick={() => dialog.current?.close()}
              className="absolute right-3 top-3 inline-flex size-11 items-center justify-center rounded-full bg-black/50"
              aria-label={UI.dismiss[l]}
            >
              <X className="size-5" />
            </button>
          </div>
        )}
      </dialog>
    </section>
  );
}

/* ───────────── Product tour ───────────── */

function TourScreen({ tab }: { tab: (typeof TOUR_TABS)[number] }) {
  const l = useLocale();
  return (
    <div className="flex h-full">
      <aside className="hidden w-40 shrink-0 flex-col gap-2 border-r border-line bg-surface p-4 sm:flex" aria-hidden>
        <div className="mb-2 h-3 w-20 rounded bg-ink/80" />
        {[70, 90, 60, 80, 50].map((w, i) => (
          <div key={i} className={cn("h-7 rounded-lg", i === 1 ? "" : "bg-card")} style={{ width: `${w}%`, background: i === 1 ? tab.accent + "22" : undefined }} />
        ))}
      </aside>
      <div className="flex-1 p-5 md:p-7">
        <span className="inline-flex rounded-full px-3 py-1 text-[11px] font-extrabold uppercase tracking-wider" style={{ background: tab.accent + "1a", color: tab.accent }}>
          {tab.label[l]}
        </span>
        <h3 className="mt-3 font-display text-[20px] text-ink md:text-[24px]">{tab.title[l]}</h3>
        <p className="mt-1 max-w-sm text-[14px] text-muted">{tab.text[l]}</p>
        <div className="mt-5 grid grid-cols-3 gap-3" aria-hidden>
          {[0, 1, 2].map((i) => (
            <div key={i} className="rounded-xl bg-surface p-3">
              <div className="h-2 w-10 rounded bg-line" />
              <div className="mt-3 h-2 rounded-full bg-line">
                <div className="shimmer h-2 rounded-full" style={{ background: tab.accent, width: `${60 + i * 15}%`, animationDelay: `${i * 0.4}s` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 space-y-2" aria-hidden>
          {[95, 80, 88].map((w, i) => (
            <div key={i} className="h-2.5 rounded bg-line" style={{ width: `${w}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function ProductTour() {
  const l = useLocale();
  const [active, setActive] = useState(0);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let n = i;
    if (e.key === "ArrowRight") n = (i + 1) % TOUR_TABS.length;
    else if (e.key === "ArrowLeft") n = (i - 1 + TOUR_TABS.length) % TOUR_TABS.length;
    else if (e.key === "Home") n = 0;
    else if (e.key === "End") n = TOUR_TABS.length - 1;
    else return;
    e.preventDefault();
    setActive(n);
    tabRefs.current[n]?.focus();
  };

  return (
    <section id="platform" className="scroll-mt-20 bg-page py-20">
      <div className="container-site">
        <SectionHeading title={l === "kk" ? "Дайындықтың бәрі бір платформада" : "Вся подготовка на одной платформе"} center />
        <div className="mx-auto mt-8 w-fit max-w-full rounded-full bg-card p-1.5 shadow-soft-ring">
          <div role="tablist" aria-label={UI.platform[l]} className="no-scrollbar flex gap-1 overflow-x-auto">
            {TOUR_TABS.map((t, i) => (
              <button
                key={t.id}
                ref={(el) => {
                  tabRefs.current[i] = el;
                }}
                role="tab"
                id={`tour-tab-${t.id}`}
                aria-selected={active === i}
                aria-controls="tour-panel"
                tabIndex={active === i ? 0 : -1}
                onClick={() => setActive(i)}
                onKeyDown={(e) => onKey(e, i)}
                className={cn(
                  "min-h-10 shrink-0 whitespace-nowrap rounded-full px-4 text-[14px] font-bold transition-colors duration-150",
                  active === i ? "bg-primary-tint-2 text-primary-nav" : "text-muted hover:text-ink",
                )}
              >
                {t.label[l]}
              </button>
            ))}
          </div>
        </div>

        <div className="mx-auto mt-8 max-w-[700px] overflow-hidden rounded-2xl bg-card shadow-soft-ring">
          <div className="flex h-10 items-center gap-3 border-b border-line bg-surface px-4" aria-hidden>
            <span className="flex gap-1.5">
              <span className="size-3 rounded-full bg-[#FF5F57]" />
              <span className="size-3 rounded-full bg-[#FEBC2E]" />
              <span className="size-3 rounded-full bg-[#28C840]" />
            </span>
            <span className="mx-auto rounded-full bg-card px-10 py-1 text-[12px] font-bold text-muted ring-line">grant.ai</span>
            <span className="w-12" />
          </div>
          <div
            id="tour-panel"
            role="tabpanel"
            aria-labelledby={`tour-tab-${TOUR_TABS[active].id}`}
            className="relative aspect-[700/410] min-h-[300px]"
          >
            {TOUR_TABS.map((t, i) => (
              <div
                key={t.id}
                aria-hidden={active !== i}
                className={cn(
                  "absolute inset-0 transition-opacity duration-300",
                  active === i ? "opacity-100" : "pointer-events-none opacity-0",
                )}
              >
                <TourScreen tab={t} />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-10 flex justify-center">
          <PlanButton href={lp(l, "/quiz")} size="lg">
            {l === "kk" ? "Тегін көру" : "Попробовать бесплатно"}
          </PlanButton>
        </div>
      </div>
    </section>
  );
}
