"use client";

import { ChevronDown, Plus } from "lucide-react";
import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Faq = { q: string; a: string };

/** Home / tools FAQ: one white card, divided rows, chevron rotates on open. */
export function FaqAccordion({ items, className }: { items: Faq[]; className?: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const id = useId();
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-card shadow-soft-ring", className)}>
      {items.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={i} className={cn(i > 0 && "border-t border-line")}>
            <h3>
              <button
                type="button"
                id={`${id}-t${i}`}
                aria-expanded={isOpen}
                aria-controls={`${id}-p${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex min-h-11 w-full items-center justify-between gap-4 px-5 py-4 text-left text-[16px] font-bold text-ink transition-colors hover:bg-surface"
              >
                <span>{f.q}</span>
                <ChevronDown
                  aria-hidden
                  className={cn("size-5 shrink-0 text-muted transition-transform duration-200", isOpen && "rotate-180")}
                />
              </button>
            </h3>
            <div
              id={`${id}-p${i}`}
              role="region"
              aria-labelledby={`${id}-t${i}`}
              className={cn(
                "grid transition-[grid-template-rows] duration-200 ease-out",
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
              )}
            >
              <div className="overflow-hidden" inert={!isOpen}>
                <p className="px-5 pb-5 text-[15px] leading-6 text-muted">{f.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Article FAQ: <details> on surface with a "+" that rotates to "×". */
export function FaqDetails({ items }: { items: Faq[] }) {
  return (
    <div className="space-y-3">
      {items.map((f, i) => (
        <details key={i} className="faq-details group rounded-[20px] bg-surface ring-line-15">
          <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-[18px] pl-6 pr-5 text-[17px] font-extrabold text-ink md:text-[19px]">
            <span>{f.q}</span>
            <span
              aria-hidden
              className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-card shadow-soft transition-transform duration-200 group-open:rotate-45"
            >
              <Plus className="size-4" strokeWidth={2.5} />
            </span>
          </summary>
          <p className="px-6 pb-[22px] text-[17px] leading-[28.8px] text-body md:text-[18px]">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

/** Fades/slides children up 12px the first time they scroll into view. */
export function Reveal({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      el.classList.add("is-visible");
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.add("is-visible");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div ref={ref} id={id} className={cn("reveal", className)}>
      {children}
    </div>
  );
}

/** Pill segmented control with roving keyboard support. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
  className?: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const idx = options.findIndex((o) => o.value === value);
  return (
    <div role="radiogroup" aria-label={label} className={cn("inline-flex rounded-full bg-surface p-1 ring-line", className)}>
      {options.map((o, i) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            ref={(el) => {
              refs.current[i] = el;
            }}
            type="button"
            role="radio"
            aria-checked={active}
            tabIndex={active || (idx === -1 && i === 0) ? 0 : -1}
            onClick={() => onChange(o.value)}
            onKeyDown={(e) => {
              if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
                e.preventDefault();
                const n = (i + (e.key === "ArrowRight" ? 1 : -1) + options.length) % options.length;
                onChange(options[n].value);
                refs.current[n]?.focus();
              }
            }}
            className={cn(
              "min-h-9 whitespace-nowrap rounded-full px-4 text-[14px] font-bold transition-[background-color,color,box-shadow] duration-150",
              active ? "bg-card text-ink shadow-soft" : "text-muted hover:text-ink",
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/** Native select styled as a pill. */
export function PillSelect({
  value,
  onChange,
  options,
  label,
  className,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  label: string;
  className?: string;
}) {
  return (
    <label className={cn("relative inline-flex", className)}>
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-11 w-full appearance-none rounded-full bg-card py-2 pl-4 pr-10 text-[14px] font-bold text-ink shadow-soft-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown aria-hidden className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
    </label>
  );
}
