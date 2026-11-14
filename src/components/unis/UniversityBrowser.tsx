"use client";

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { PillSelect, SegmentedControl } from "@/components/ui/client";
import { Button } from "@/components/ui/Button";
import { CAT_LABEL, CITIES, PROGRAMS, UNIVERSITIES, cityName, uniName } from "@/content/data";
import { PAIRS, pairLabel } from "@/content/unt-config";
import { cn } from "@/lib/cn";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

export function UniversityBrowser() {
  const l = useLocale();
  const [q, setQ] = useState("");
  const [city, setCity] = useState("all");
  const [cat, setCat] = useState("all");
  const [pair, setPair] = useState("all");
  const [onlyGrants, setOnlyGrants] = useState<"grant" | "all">("grant");
  const [shown, setShown] = useState(24);

  useEffect(() => setShown(24), [q, city, cat, pair, onlyGrants]);

  const cities = useMemo(() => {
    const used = new Set(UNIVERSITIES.map((u) => u.city).filter(Boolean) as string[]);
    return Object.entries(CITIES)
      .filter(([k]) => used.has(k))
      .sort((a, b) => UNIVERSITIES.filter((u) => u.city === b[0]).length - UNIVERSITIES.filter((u) => u.city === a[0]).length);
  }, []);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    return UNIVERSITIES.filter((u) => {
      if (n && !`${u.kk} ${u.ru} ${u.code ?? ""}`.toLowerCase().includes(n)) return false;
      if (city !== "all" && u.city !== city) return false;
      if (cat !== "all" && u.cat !== cat) return false;
      if (onlyGrants === "grant" && u.progs.length === 0) return false;
      if (pair !== "all" && !u.progs.some((p) => PROGRAMS.find((x) => x.code === p.c)?.pair === pair)) return false;
      return true;
    }).sort((a, b) => b.progs.length - a.progs.length);
  }, [q, city, cat, pair, onlyGrants]);

  return (
    <div>
      <label className="relative block">
        <span className="sr-only">{T(l, "Университет іздеу", "Поиск вуза")}</span>
        <Search aria-hidden className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={T(l, "Университет атауы немесе коды", "Название вуза или код")}
          className="h-14 w-full rounded-full bg-card pr-5 text-[16px] font-semibold text-ink shadow-soft-ring placeholder:text-muted"
          style={{ paddingLeft: 52 }}
        />
      </label>

      <div className="mt-4 grid gap-3 rounded-[20px] bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr_1.4fr]">
        <div>
          <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Көрсету", "Показать")}</div>
          <SegmentedControl label={T(l, "Көрсету", "Показать")} value={onlyGrants} onChange={setOnlyGrants} options={[{ value: "grant", label: T(l, "Грант барлар", "С грантами") }, { value: "all", label: T(l, "Барлығы", "Все") }]} />
        </div>
        <div>
          <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Қала", "Город")}</div>
          <PillSelect label={T(l, "Қала", "Город")} value={city} onChange={setCity} className="w-full" options={[{ value: "all", label: T(l, "Барлық қала", "Все города") }, ...cities.map(([k, v]) => ({ value: k, label: v[l] }))]} />
        </div>
        <div>
          <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Түрі", "Тип")}</div>
          <PillSelect label={T(l, "Түрі", "Тип")} value={cat} onChange={setCat} className="w-full" options={[{ value: "all", label: T(l, "Барлығы", "Все") }, ...Object.entries(CAT_LABEL).map(([k, v]) => ({ value: k, label: v[l] }))]} />
        </div>
        <div>
          <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Пән комбинациясы", "Комбинация предметов")}</div>
          <PillSelect label={T(l, "Пән комбинациясы", "Комбинация предметов")} value={pair} onChange={setPair} className="w-full" options={[{ value: "all", label: T(l, "Кез келген", "Любая") }, ...PAIRS.value.map((p) => ({ value: p.id, label: pairLabel(p.id, l) }))]} />
        </div>
      </div>

      <p className="mt-6 text-[14px] font-bold text-muted" aria-live="polite">
        {list.length} {T(l, "университет", "вузов")}
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, shown).map((u) => {
          const mins = u.progs.map((p) => p.g?.[0]).filter((x): x is number => typeof x === "number");
          const grants = u.progs.reduce((a, p) => a + (p.g?.[1] ?? 0) + (p.r?.[1] ?? 0), 0);
          return (
            <li key={u.id}>
              <Link href={lp(l, `/universities/${u.slug}`)} className="group flex h-full flex-col rounded-2xl bg-card p-5 ring-line transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-[16px] font-extrabold leading-snug text-ink group-hover:underline underline-offset-4">{uniName(u, l)}</h3>
                  <ChevronRight aria-hidden className="mt-0.5 size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-1 text-[13px] font-semibold text-muted">
                  <span aria-hidden>🇰🇿</span> {cityName(u.city, l)} · {CAT_LABEL[u.cat][l]}
                  {u.code && ` · ${T(l, "коды", "код")} ${u.code}`}
                </p>
                <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-4 text-center">
                  <div>
                    <dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted">{T(l, "Топтар", "Группы")}</dt>
                    <dd className="font-display text-[18px] text-ink">{u.progs.length || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted">{T(l, "Грант", "Грантов")}</dt>
                    <dd className="font-display text-[18px] text-ink">{grants || "—"}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted">{T(l, "Мин. балл", "Мин. балл")}</dt>
                    <dd className={cn("font-display text-[18px]", mins.length ? "text-ink" : "text-muted")}>{mins.length ? Math.min(...mins) : "—"}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>
      {shown < list.length && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" arrow={false} onClick={() => setShown((s) => s + 24)}>
            {T(l, "Тағы көрсету", "Показать ещё")} ({list.length - shown})
          </Button>
        </div>
      )}
    </div>
  );
}
