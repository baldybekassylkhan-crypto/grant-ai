"use client";

import Link from "next/link";
import { CheckCircle2, ChevronDown } from "lucide-react";
import { useMemo, useState } from "react";
import { DATA_META, PROGRAMS, cityName, programUniversities, progName, reachable, uniName, type Program, type University } from "@/content/data";
import { pairLabel } from "@/content/unt-config";
import { cn } from "@/lib/cn";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

/** Where a score reaches last year's grant minimum — grouped by programme for one subject pair. */
export function ReachList({ score, pair, rural }: { score: number; pair: string | null; rural: boolean }) {
  const l = useLocale();
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const data = useMemo(() => {
    const progs = PROGRAMS.filter((p) => (pair ? p.pair === pair : true));
    return progs
      .map((p) => {
        const rows = programUniversities(p.code)
          .map((r) => ({ uni: r.uni, row: rural ? r.r : r.g }))
          .filter((r) => r.row) as { uni: University; row: [number, number] }[];
        const ok = rows.filter((r) => score >= r.row[0]).sort((a, b) => b.row[0] - a.row[0]);
        const near = rows.filter((r) => score < r.row[0] && r.row[0] - score <= 5).sort((a, b) => a.row[0] - b.row[0]);
        return { p, rows, ok, near };
      })
      .filter((x) => x.rows.length)
      .sort((a, b) => b.ok.length - a.ok.length || a.p.code.localeCompare(b.p.code));
  }, [score, pair, rural]);

  const totalOk = data.reduce((a, x) => a + x.ok.length, 0);
  const totalAll = data.reduce((a, x) => a + x.rows.length, 0);
  const progsOk = data.filter((x) => x.ok.length).length;
  const list = showAll ? data : data.slice(0, 8);

  return (
    <section className="mt-10" aria-labelledby="reach-h">
      <div className="rounded-[24px] bg-card p-5 shadow-soft-ring md:p-6">
        <h2 id="reach-h" className="text-[20px] text-ink md:text-[24px]">
          {T(l, "Осы балмен қайда грантқа түсуге болады?", "Куда с этим баллом можно пройти на грант?")}
        </h2>
        <p className="mt-2 text-[15px] leading-6 text-body">
          {pair ? <strong>{pairLabel(pair, l)}</strong> : null}
          {pair ? " · " : ""}
          {rural ? T(l, "ауыл квотасы", "сельская квота") : T(l, "жалпы конкурс", "общий конкурс")} · {DATA_META.year}
        </p>
        <div className="mt-4 grid grid-cols-3 gap-3">
          {[
            [T(l, "Нұсқа (ЖОО × мамандық)", "Вариантов (вуз × специальность)"), `${totalOk} / ${totalAll}`],
            [T(l, "Мамандық тобы", "Групп программ"), `${progsOk} / ${data.length}`],
            [T(l, "Сіздің балыңыз", "Ваш балл"), String(score)],
          ].map(([k, v]) => (
            <div key={k} className="rounded-2xl bg-info-bg p-3">
              <div className="text-[11px] font-bold leading-tight text-muted">{k}</div>
              <div className="mt-1 font-display text-[22px] text-ink">{v}</div>
            </div>
          ))}
        </div>

        {data.length === 0 ? (
          <p className="mt-4 text-muted">{T(l, "Бұл комбинация бойынша 2025 жылғы грант деректері жоқ.", "По этой комбинации нет данных о грантах 2025 года.")}</p>
        ) : (
          <ul className="mt-5 divide-y divide-line rounded-2xl ring-line">
            {list.map(({ p, ok, near, rows }) => {
              const isOpen = open === p.code;
              return (
                <li key={p.code}>
                  <button type="button" aria-expanded={isOpen} onClick={() => setOpen(isOpen ? null : p.code)} className="flex min-h-12 w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface">
                    <span className={cn("inline-flex min-w-14 justify-center rounded-full px-2 py-1 text-[12px] font-extrabold", ok.length ? "bg-[#E7F8EF] text-[#0A8A50]" : near.length ? "bg-[#FFF4D9] text-[#8A6200]" : "bg-surface text-muted")}>
                      {ok.length}/{rows.length}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-extrabold text-ink">
                        <span className="text-muted">{p.code}</span> {progName(p, l)}
                      </span>
                      <span className="text-[12px] text-muted">
                        {ok.length ? T(l, `${ok.length} ЖОО-да грантқа жетеді`, `проходит в ${ok.length} вуз(ах)`) : near.length ? T(l, `${near.length} ЖОО-ға 5 балдан аз жетпейді`, `до ${near.length} вуз(ов) не хватает ≤5 баллов`) : T(l, "Әзірге жетпейді", "Пока не хватает")}
                      </span>
                    </span>
                    <ChevronDown aria-hidden className={cn("size-4 shrink-0 text-muted transition-transform", isOpen && "rotate-180")} />
                  </button>
                  {isOpen && (
                    <div className="pop-in px-4 pb-4">
                      {ok.length > 0 && (
                        <ul className="grid gap-1.5 sm:grid-cols-2">
                          {ok.map((r) => (
                            <li key={r.uni.id}>
                              <Link href={lp(l, `/universities/${r.uni.slug}`)} className="flex items-center gap-2 rounded-xl bg-[#E7F8EF]/60 px-3 py-2 text-[13px] hover:underline dark:bg-surface">
                                <CheckCircle2 aria-hidden className="size-4 shrink-0 text-success" />
                                <span className="min-w-0 flex-1 font-bold text-ink">{uniName(r.uni, l)}</span>
                                <span className="shrink-0 text-muted">
                                  {r.row[0]} · +{score - r.row[0]}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                      {near.length > 0 && (
                        <>
                          <p className="mb-1.5 mt-3 text-[12px] font-extrabold uppercase tracking-wide text-[#8A6200]">{T(l, "Аз қалды", "Почти")}</p>
                          <ul className="grid gap-1.5 sm:grid-cols-2">
                            {near.map((r) => (
                              <li key={r.uni.id}>
                                <Link href={lp(l, `/universities/${r.uni.slug}`)} className="flex items-center gap-2 rounded-xl bg-[#FFF4D9]/60 px-3 py-2 text-[13px] hover:underline dark:bg-surface">
                                  <span className="min-w-0 flex-1 font-bold text-ink">{uniName(r.uni, l)}</span>
                                  <span className="shrink-0 text-muted">
                                    {r.row[0]} · −{r.row[0] - score}
                                  </span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </>
                      )}
                      <Link href={lp(l, `/programs/${p.code}`)} className="mt-3 inline-block text-[13px] font-extrabold text-info-text underline underline-offset-4">
                        {T(l, "Мамандық туралы толығырақ →", "Подробнее о специальности →")}
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {data.length > 8 && (
          <button type="button" onClick={() => setShowAll((s) => !s)} className="mt-3 min-h-10 text-[13px] font-extrabold text-info-text">
            {showAll ? T(l, "Азырақ көрсету", "Свернуть") : T(l, `Барлық ${data.length} мамандықты көрсету`, `Показать все ${data.length} групп`)}
          </button>
        )}
        <p className="mt-4 text-[12px] leading-5 text-muted">
          {T(l, "«Жетеді» = балыңыз 2025 жылы осы ЖОО-да грант алған ең төменгі балдан кем емес. Бұл болжам, кепілдік емес: грант балы жыл сайын өзгереді. Дереккөз: univision.kz.", "«Проходит» = ваш балл не ниже минимального балла, с которым получили грант в этом вузе в 2025 году. Это прогноз, а не гарантия: проходной меняется каждый год. Источник: univision.kz.")}
        </p>
      </div>
    </section>
  );
}

/** Per-university status table for one programme (used by the grant-chance tool). */
export function ProgramReachTable({ program, score, rural }: { program: Program; score: number; rural: boolean }) {
  const l = useLocale();
  const rows = programUniversities(program.code)
    .map((r) => ({ uni: r.uni, row: rural ? r.r : r.g }))
    .filter((r) => r.row) as { uni: University; row: [number, number] }[];
  rows.sort((a, b) => b.row[0] - a.row[0]);
  return (
    <section className="mt-10" aria-labelledby="pr-h">
      <h2 id="pr-h" className="text-[20px] text-ink md:text-[24px]">
        {program.code} {progName(program, l)}: {T(l, "университеттер бойынша", "по вузам")}
      </h2>
      <div className="mt-4 overflow-x-auto rounded-[20px] bg-card ring-line">
        <table className="w-full min-w-[560px] border-collapse text-left text-[15px]">
          <thead>
            <tr className="text-[12px] font-extrabold uppercase tracking-[1px] text-muted">
              <th className="px-4 pb-3 pt-4">{T(l, "Университет", "Вуз")}</th>
              <th className="px-4 pb-3 pt-4">{T(l, "Қала", "Город")}</th>
              <th className="whitespace-nowrap px-4 pb-3 pt-4 text-right">{T(l, "Грант балы 2025", "Проходной 2025")}</th>
              <th className="whitespace-nowrap px-4 pb-3 pt-4 text-right">{T(l, "Сіз", "Вы")}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const d = score - r.row[0];
              return (
                <tr key={r.uni.id} className="border-t border-line">
                  <th scope="row" className="px-4 py-3 font-bold text-ink">
                    <Link href={lp(l, `/universities/${r.uni.slug}`)} className="underline-offset-4 hover:underline">
                      {uniName(r.uni, l)}
                    </Link>
                  </th>
                  <td className="px-4 py-3 text-[14px] text-body">{cityName(r.uni.city, l)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right align-middle">
                    <span className="font-display text-[17px] text-ink">{r.row[0]}</span> <span className="text-[12px] text-muted">/ {r.row[1]} гр.</span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right align-middle">
                    <span className={cn("rounded-full px-2.5 py-1 text-[12px] font-extrabold", d >= 0 ? "bg-[#E7F8EF] text-[#0A8A50]" : d >= -5 ? "bg-[#FFF4D9] text-[#8A6200]" : "bg-primary-tint-2 text-primary-nav")}>
                      {d >= 0 ? `+${d}` : d}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export { reachable };
