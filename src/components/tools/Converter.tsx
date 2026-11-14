"use client";

import { Link2 } from "lucide-react";
import { PlanButton } from "@/components/ui/PlanAware";
import { Button } from "@/components/ui/Button";
import { UI } from "@/content/ui";
import { SUBJECTS, SUBJECT_MINIMUMS, THRESHOLDS, UNT } from "@/content/unt-config";
import { accent } from "@/lib/accents";
import { cn } from "@/lib/cn";
import { lp, type L, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";
import { DataTableClient } from "./DataTableClient";
import { useCopyLink, useQueryState } from "./hooks";

type Scale = { id: string; name: L; max: number; step: number; min?: number; total?: boolean; creative?: boolean };

const mins = SUBJECT_MINIMUMS.value;
const SCALES: Scale[] = [
  { id: "mathlit", name: SUBJECTS.mathlit, max: 10, step: 1, min: mins.mathlit },
  { id: "reading", name: SUBJECTS.reading, max: 10, step: 1, min: mins.reading },
  { id: "history", name: SUBJECTS.history, max: 20, step: 2, min: mins.history },
  { id: "profile", name: { kk: "Бейіндік пән", ru: "Профильный предмет" }, max: UNT.standard.profile.value.max, step: 5, min: mins.profile },
  { id: "total", name: { kk: "Жалпы балл", ru: "Общий балл" }, max: UNT.standard.maxScore.value, step: 10, total: true },
  { id: "creative", name: { kk: "Шығармашылық (жалпы)", ru: "Творческий (итог)" }, max: UNT.creative.maxWithCreativeExams.value, step: 10, total: true, creative: true },
];

const KEY_THRESHOLDS = ["other", "national", "healthcare", "pedagogy"] as const;
const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);
const values = (s: Scale) => Array.from({ length: Math.floor(s.max / s.step) + 1 }, (_, i) => i * s.step);

function results(s: Scale, v: number, l: Locale): { label: string; caption: string; value: string; ok?: boolean }[] {
  const pct = Math.round((v / s.max) * 100);
  const out: { label: string; caption: string; value: string; ok?: boolean }[] = [{ label: T(l, "Ең жоғары балдан", "От максимума"), caption: `${v} / ${s.max}`, value: `${pct}%` }];
  if (s.total) {
    KEY_THRESHOLDS.forEach((id) => {
      const t = THRESHOLDS.value.find((x) => x.id === id)!;
      const d = v - t.score;
      out.push({ label: t.label[l], caption: T(l, `Шекті балл ${t.score}`, `Порог ${t.score}`), value: d >= 0 ? `+${d}` : `${d}`, ok: d >= 0 });
    });
  } else {
    const d = v - (s.min ?? 0);
    out.push({ label: T(l, "Пәндік минимум", "Минимум по предмету"), caption: `${s.min}`, value: d >= 0 ? "✓" : `${d}`, ok: d >= 0 });
    out.push({ label: T(l, "140 балдағы үлесі", "Доля от 140"), caption: T(l, "жалпы балдан", "от общего балла"), value: `${((v / UNT.standard.maxScore.value) * 100).toFixed(1)}%` });
    if (s.id === "profile") out.push({ label: T(l, "Қате жіберуге болады", "Можно потерять"), caption: T(l, "минимумға дейін", "до минимума"), value: `${Math.max(0, v - (s.min ?? 0))}` });
  }
  return out;
}

export function ConverterTool({ accentIndex }: { accentIndex: number }) {
  const l = useLocale();
  const a = accent(accentIndex);
  const [state, set, setAll] = useQueryState({ from: "total", score: 90 });
  const { copied, copy } = useCopyLink();
  const scale = SCALES.find((x) => x.id === state.from) ?? SCALES[4];
  const vals = values(scale);
  const score = vals.includes(Number(state.score)) ? Number(state.score) : vals[Math.floor(vals.length / 2)];
  const res = results(scale, score, l);
  const selected = { boxShadow: `inset 0 0 0 2px ${a.color}`, background: a.tint };

  const tableHead = scale.total
    ? [scale.name[l], "%", ...KEY_THRESHOLDS.map((id) => `${THRESHOLDS.value.find((x) => x.id === id)!.score}`)]
    : [scale.name[l], "%", T(l, "Минимум", "Минимум"), T(l, "140-тан үлесі", "Доля от 140")];
  const tableRows = vals.map((v) =>
    scale.total
      ? [String(v), `${Math.round((v / scale.max) * 100)}%`, ...KEY_THRESHOLDS.map((id) => (v >= THRESHOLDS.value.find((x) => x.id === id)!.score ? "✓" : "—"))]
      : [String(v), `${Math.round((v / scale.max) * 100)}%`, v >= (scale.min ?? 0) ? "✓" : "—", `${((v / 140) * 100).toFixed(1)}%`],
  );

  return (
    <div>
      <div className="grid gap-6 rounded-[24px] bg-card p-5 shadow-soft-ring md:grid-cols-2 md:p-6">
        <div>
          <h2 id="from-label" className="eyebrow font-sans font-extrabold text-muted">{T(l, "Менде балл бар:", "У меня есть балл по:")}</h2>
          <div role="radiogroup" aria-labelledby="from-label" className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {SCALES.map((s) => {
              const on = s.id === scale.id;
              return (
                <button key={s.id} type="button" role="radio" aria-checked={on} onClick={() => setAll({ from: s.id, score: values(s)[Math.floor(values(s).length / 2)] })} className={cn("min-h-14 rounded-xl bg-card px-3 py-2.5 text-left transition-shadow", !on && "ring-line hover:bg-surface")} style={on ? selected : undefined}>
                  <span className="block text-[13px] font-extrabold leading-tight text-ink">{s.name[l]}</span>
                  <span className="block text-[11px] font-semibold text-muted">0–{s.max}</span>
                </button>
              );
            })}
          </div>

          <h2 id="score-label" className="eyebrow mt-6 font-sans font-extrabold text-muted">{T(l, "Менің балым", "Мой балл")}</h2>
          <div role="radiogroup" aria-labelledby="score-label" className="mt-3 flex flex-wrap gap-2">
            {vals.map((v) => {
              const on = v === score;
              return (
                <button key={v} type="button" role="radio" aria-checked={on} onClick={() => set("score", v)} className={cn("h-11 min-w-11 rounded-[10px] bg-card px-2.5 text-[15px] font-extrabold text-ink", !on && "ring-line hover:bg-surface")} style={on ? selected : undefined}>
                  {v}
                </button>
              );
            })}
          </div>
        </div>

        <div aria-live="polite">
          <h2 className="eyebrow font-sans font-extrabold text-muted">
            {scale.name[l]}: {score} — {T(l, "бұл", "это")}
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {res.map((r, i) => (
              <li key={i} className="rounded-2xl p-3.5" style={{ background: accent(i).tint }}>
                <div className="text-[12px] font-extrabold leading-tight text-ink">{r.label}</div>
                <div className="text-[11px] font-semibold text-muted">{r.caption}</div>
                <div className={cn("mt-2 font-display text-[26px] leading-none", r.ok === false ? "text-primary-deep" : "text-ink")}>{r.value}</div>
                <div className="mt-2 text-[11px] text-muted">testcenter.kz, 2026</div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <button type="button" onClick={() => copy()} className="mt-4 inline-flex min-h-10 items-center gap-2 text-[14px] font-extrabold text-info-text">
        <Link2 className="size-4" aria-hidden />
        {copied ? UI.copied[l] : T(l, "Осы нәтижеге сілтемені көшіру", "Скопировать ссылку на результат")}
      </button>

      <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-[20px] bg-info-bg p-5 sm:flex-row sm:items-center">
        <p className="text-[16px] font-bold text-ink">
          {T(l, "Ресми түрде жарияланбаған шкалалар арасында түрлендіру жоқ — біз оны ойлап таппаймыз.", "Перевода между шкалами, которые официально не опубликованы, нет — мы его не придумываем.")}
        </p>
        <PlanButton href={lp(l, "/quiz")} variant="blue" className="shrink-0">
          {T(l, "Балды көтеру", "Поднять балл")}
        </PlanButton>
      </div>

      <section className="mt-10" aria-labelledby="full-table">
        <h2 id="full-table" className="text-[22px] text-ink md:text-[26px]">
          {T(l, "Толық кесте", "Полная таблица")}
        </h2>
        <DataTableClient className="mt-4" head={tableHead} rows={tableRows} highlight={vals.indexOf(score)} />
      </section>
    </div>
  );
}
