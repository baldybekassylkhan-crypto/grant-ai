"use client";

import Link from "next/link";
import { ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PillSelect, SegmentedControl } from "@/components/ui/client";
import { AREA_INFO, DATA_META, PROGRAMS, areaOf, progName } from "@/content/data";
import { PAIRS, pairLabel } from "@/content/unt-config";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

/** Programme-group directory with real 2025 grant minimums; each card links to the programme page. */
export function DirectoryTool() {
  const l = useLocale();
  const [q, setQ] = useState("");
  const [pair, setPair] = useState("all");
  const [area, setArea] = useState("all");
  const [mode, setMode] = useState<"gen" | "rural">("gen");
  const [sort, setSort] = useState("min-desc");
  const [shown, setShown] = useState(18);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("pair");
    if (p && PAIRS.value.some((x) => x.id === p)) setPair(p);
  }, []);
  useEffect(() => setShown(18), [q, pair, area, mode, sort]);

  const list = useMemo(() => {
    const n = q.trim().toLowerCase();
    const res = PROGRAMS.filter((p) => {
      if (n && !`${p.code} ${p.kk} ${p.ru}`.toLowerCase().includes(n)) return false;
      if (pair !== "all" && p.pair !== pair) return false;
      if (area !== "all" && !(p.area.startsWith(area) || (area === "6B10" && p.code.startsWith("BM")))) return false;
      if (!p[mode]) return false;
      return true;
    });
    const key = (p: (typeof PROGRAMS)[number]) => p[mode]?.[0] ?? 0;
    return res.sort((a, b) => (sort === "min-desc" ? key(b) - key(a) : sort === "min-asc" ? key(a) - key(b) : (b[mode]?.[1] ?? 0) - (a[mode]?.[1] ?? 0)));
  }, [q, pair, area, mode, sort]);

  return (
    <div>
      <div className="flex flex-col gap-3 md:flex-row">
        <label className="relative block flex-1">
          <span className="sr-only">{T(l, "Мамандық іздеу", "Поиск специальности")}</span>
          <Search aria-hidden className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-muted" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={T(l, "Мамандық атауы немесе коды (мыс. B057)", "Название или код (напр. B057)")} className="h-14 w-full rounded-full bg-card pr-5 text-[16px] font-semibold text-ink shadow-soft-ring placeholder:text-muted" style={{ paddingLeft: 52 }} />
        </label>
        <PillSelect label={T(l, "Пән комбинациясы", "Комбинация предметов")} value={pair} onChange={setPair} options={[{ value: "all", label: T(l, "Барлық комбинация", "Все комбинации") }, ...PAIRS.value.map((p) => ({ value: p.id, label: pairLabel(p.id, l) }))]} className="md:w-80 [&_select]:h-14" />
      </div>

      <div className="mt-4 grid gap-3 rounded-[20px] bg-surface p-4 sm:grid-cols-2 lg:grid-cols-[auto_1fr_1fr]">
        <div>
          <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Конкурс", "Конкурс")}</div>
          <SegmentedControl label={T(l, "Конкурс", "Конкурс")} value={mode} onChange={setMode} options={[{ value: "gen", label: T(l, "Жалпы", "Общий") }, { value: "rural", label: T(l, "Ауыл квотасы", "Сельская квота") }]} />
        </div>
        <div>
          <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Сала", "Область")}</div>
          <PillSelect label={T(l, "Сала", "Область")} value={area} onChange={setArea} className="w-full" options={[{ value: "all", label: T(l, "Барлық сала", "Все области") }, ...Object.entries(AREA_INFO).map(([k, v]) => ({ value: k, label: v.name[l] }))]} />
        </div>
        <div>
          <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Сұрыптау", "Сортировка")}</div>
          <PillSelect
            label={T(l, "Сұрыптау", "Сортировка")}
            value={sort}
            onChange={setSort}
            className="w-full"
            options={[
              { value: "min-desc", label: T(l, "Грант балы: жоғарыдан", "Балл: по убыванию") },
              { value: "min-asc", label: T(l, "Грант балы: төменнен", "Балл: по возрастанию") },
              { value: "grants", label: T(l, "Грант саны", "Число грантов") },
            ]}
          />
        </div>
      </div>

      <p className="mt-6 text-[14px] font-bold text-muted" aria-live="polite">
        {list.length} {T(l, `бағдарлама тобы · ${DATA_META.year} жылғы ең төменгі грант балдары`, `групп программ · минимальные баллы на грант ${DATA_META.year}`)}
      </p>

      <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.slice(0, shown).map((p) => {
          const row = p[mode]!;
          const a = areaOf(p);
          return (
            <li key={p.code}>
              <Link href={lp(l, `/programs/${p.code}`)} className="group flex h-full flex-col rounded-2xl bg-card p-5 ring-line transition-transform hover:-translate-y-0.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[12px] font-extrabold text-primary-deep">{p.code}</span>
                    <h3 className="text-[16px] font-extrabold leading-snug text-ink underline-offset-4 group-hover:underline">{progName(p, l)}</h3>
                  </div>
                  <ChevronRight aria-hidden className="mt-4 size-5 shrink-0 text-muted transition-transform group-hover:translate-x-1" />
                </div>
                <p className="mt-1 text-[12px] font-bold text-info-text">{p.pair ? pairLabel(p.pair, l) : T(l, "Пәндерді ЖОО-дан тексеріңіз", "Предметы уточняйте в вузе")}</p>
                {a && <p className="mt-1 line-clamp-2 text-[13px] text-muted">{a.careers[l]}</p>}
                <dl className="mt-auto grid grid-cols-3 gap-2 border-t border-line pt-4">
                  <div>
                    <dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted">{T(l, "Мин. балл", "Мин. балл")}</dt>
                    <dd className="font-display text-[18px] text-ink">{row[0]}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted">{T(l, "Грант", "Грантов")}</dt>
                    <dd className="font-display text-[18px] text-ink">{row[1]}</dd>
                  </div>
                  <div>
                    <dt className="text-[10px] font-extrabold uppercase tracking-wide text-muted">{T(l, "ЖОО", "Вузов")}</dt>
                    <dd className="font-display text-[18px] text-ink">{p.unis}</dd>
                  </div>
                </dl>
              </Link>
            </li>
          );
        })}
      </ul>
      {shown < list.length && (
        <div className="mt-6 flex justify-center">
          <Button variant="secondary" arrow={false} onClick={() => setShown((s) => s + 18)}>
            {T(l, "Тағы көрсету", "Показать ещё")} ({list.length - shown})
          </Button>
        </div>
      )}
      <p className="mt-6 text-[12px] leading-5 text-muted">
        {T(l, "«Мин. балл» — 2025 жылы осы топта грант алған ең төменгі балл (барлық ЖОО бойынша). Әр университеттің өз балы жоғары болуы мүмкін — мамандық бетінен қараңыз. Дереккөз: univision.kz.", "«Мин. балл» — минимальный балл, с которым в 2025 году получили грант в этой группе (по всем вузам). У конкретного вуза балл может быть выше — смотрите на странице специальности. Источник: univision.kz.")}
      </p>
    </div>
  );
}
