"use client";

import Link from "next/link";
import { PlanButton } from "@/components/ui/PlanAware";
import { Minus, Plus, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PillSelect, SegmentedControl } from "@/components/ui/client";
import { MascotAvatar } from "@/components/ui/Logo";
import { UI } from "@/content/ui";
import { GRANTS, PAIRS, SUBJECTS, SUBJECT_MINIMUMS, THRESHOLDS, UNT, thresholdNote, type SubjectId } from "@/content/unt-config";
import { accent } from "@/lib/accents";
import { cn } from "@/lib/cn";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";
import { useCopyLink, useQueryState } from "./hooks";
import { ProgramReachTable, ReachList } from "./Reach";
import { PROGRAMS, programByCode, programUniversities, progName, uniName } from "@/content/data";

type State = Record<string, string | number>;
type InputDef = { key: string; label: string; min: number; max: number; step: number; suffix?: string; helper?: { label: string; href: string } };
type SelectDef = { key: string; label: string; kind: "segmented" | "pill"; options: { value: string; label: string }[]; normalize?: (v: string) => string };
type Result = {
  value: string;
  breakdown: string;
  level: string;
  tone: "success" | "star" | "primary";
  levelText: string;
  lines: string[];
  cross: { label: string; href: string };
  table: [string, string][];
  nudge: string;
};
type Config = {
  defaults: State;
  selects: (s: State, l: Locale) => SelectDef[];
  inputs: (s: State, l: Locale) => InputDef[];
  compute: (s: State, l: Locale) => Result;
  below?: (s: State) => React.ReactNode;
};

const n = (v: string | number) => Number(v) || 0;
const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);
const fieldOptions = (l: Locale) => THRESHOLDS.value.map((t) => ({ value: t.id, label: `${t.label[l]} — ${t.score}` }));
const thresholdOf = (id: string) => THRESHOLDS.value.find((t) => t.id === id) ?? THRESHOLDS.value[1];
const std = UNT.standard;
const cre = UNT.creative;
const mins = SUBJECT_MINIMUMS.value;
const profileMax = std.profile.value.max;

const CONFIGS: Record<string, Config> = {
  /* ───── ҰБТ score calculator ───── */
  "score-calculator": {
    defaults: { mode: "standard", field: "national", pair: "math-physics", quota: "gen", mathlit: 6, reading: 7, history: 12, p1: 30, p2: 28, c1: 30, c2: 30 },
    selects: (s, l) => [
      { key: "mode", label: T(l, "Мамандық түрі", "Тип специальности"), kind: "segmented", options: [{ value: "standard", label: T(l, "Стандарт", "Стандарт") }, { value: "creative", label: T(l, "Шығармашылық", "Творческий") }] },
      ...(s.mode === "creative"
        ? []
        : [{ key: "pair", label: T(l, "Бейіндік пәндер", "Профильные предметы"), kind: "pill" as const, options: PAIRS.value.filter((p) => !p.creative).map((p) => ({ value: p.id, label: `${SUBJECTS[p.a][l]} — ${SUBJECTS[p.b][l]}` })) }]),
      { key: "field", label: T(l, "Бағыт / шекті балл", "Направление / порог"), kind: "pill", options: fieldOptions(l) },
      { key: "quota", label: T(l, "Грант конкурсы", "Конкурс грантов"), kind: "segmented", options: [{ value: "gen", label: T(l, "Жалпы", "Общий") }, { value: "rural", label: T(l, "Ауыл квотасы", "Сельская квота") }] },
    ],
    below: (s) => {
      const creative = s.mode === "creative";
      const total = creative ? n(s.reading) + n(s.history) + n(s.c1) + n(s.c2) : n(s.mathlit) + n(s.reading) + n(s.history) + n(s.p1) + n(s.p2);
      return <ReachList score={total} pair={creative ? "creative" : String(s.pair)} rural={s.quota === "rural"} />;
    },
    inputs: (s, l) => {
      const helper = { label: T(l, "Формат туралы", "О формате"), href: lp(l, "/guides/basics/how-unt-works") };
      if (s.mode === "creative") {
        return [
          { key: "reading", label: SUBJECTS.reading[l], min: 0, max: 10, step: 1, helper },
          { key: "history", label: SUBJECTS.history[l], min: 0, max: 20, step: 1 },
          { key: "c1", label: SUBJECTS.creative1[l], min: 0, max: cre.creativeExamMax.value, step: 1 },
          { key: "c2", label: SUBJECTS.creative2[l], min: 0, max: cre.creativeExamMax.value, step: 1 },
        ];
      }
      const pair = PAIRS.value.find((p) => p.id === s.pair) ?? PAIRS.value[0];
      return [
        { key: "mathlit", label: SUBJECTS.mathlit[l], min: 0, max: 10, step: 1, helper },
        { key: "reading", label: SUBJECTS.reading[l], min: 0, max: 10, step: 1 },
        { key: "history", label: SUBJECTS.history[l], min: 0, max: 20, step: 1 },
        { key: "p1", label: SUBJECTS[pair.a][l], min: 0, max: profileMax, step: 1 },
        { key: "p2", label: SUBJECTS[pair.b][l], min: 0, max: profileMax, step: 1 },
      ];
    },
    compute: (s, l) => {
      const creative = s.mode === "creative";
      const pair = PAIRS.value.find((p) => p.id === s.pair) ?? PAIRS.value[0];
      const rows: { name: string; v: number; max: number; min: number }[] = creative
        ? [
            { name: SUBJECTS.reading[l], v: n(s.reading), max: 10, min: mins.reading },
            { name: SUBJECTS.history[l], v: n(s.history), max: 20, min: mins.history },
            { name: SUBJECTS.creative1[l], v: n(s.c1), max: cre.creativeExamMax.value, min: mins.creative },
            { name: SUBJECTS.creative2[l], v: n(s.c2), max: cre.creativeExamMax.value, min: mins.creative },
          ]
        : [
            { name: SUBJECTS.mathlit[l], v: n(s.mathlit), max: 10, min: mins.mathlit },
            { name: SUBJECTS.reading[l], v: n(s.reading), max: 10, min: mins.reading },
            { name: SUBJECTS.history[l], v: n(s.history), max: 20, min: mins.history },
            { name: SUBJECTS[pair.a][l], v: n(s.p1), max: profileMax, min: mins.profile },
            { name: SUBJECTS[pair.b][l], v: n(s.p2), max: profileMax, min: mins.profile },
          ];
      const total = rows.reduce((a, r) => a + r.v, 0);
      const max = creative ? cre.maxWithCreativeExams.value : std.maxScore.value;
      const failed = rows.filter((r) => r.v < r.min);
      const th = thresholdOf(String(s.field));
      const gap = total - th.score;
      const ok = failed.length === 0 && gap >= 0;
      return {
        value: String(total),
        breakdown: `/ ${max} · ${Math.round((total / max) * 100)}%`,
        level: !ok ? T(l, "Шектен төмен", "Ниже порога") : gap >= 20 ? T(l, "Жақсы қор", "С запасом") : T(l, "Өтеді", "Проходит"),
        tone: !ok ? "primary" : gap >= 20 ? "success" : "star",
        levelText: `${th.label[l]}: ${th.score}`,
        lines: [
          failed.length
            ? T(l, `Пәндік минимум орындалмады: ${failed.map((f) => `${f.name} (${f.v}/${f.min})`).join(", ")}.`, `Не выполнен минимум: ${failed.map((f) => `${f.name} (${f.v}/${f.min})`).join(", ")}.`)
            : T(l, "Барлық пәндік минимум орындалды.", "Все минимумы по предметам выполнены."),
          gap >= 0 ? T(l, `Шекті балдан ${gap} балл жоғары.`, `На ${gap} баллов выше порога.`) : T(l, `Шекті балға ${-gap} балл жетпейді.`, `До порога не хватает ${-gap} баллов.`),
          thresholdNote[l],
        ],
        cross: { label: T(l, "Грант мүмкіндігін тексеру", "Проверить шансы на грант"), href: lp(l, `/tools/grant-chance?score=${total}&field=${th.id}`) },
        table: rows.map((r) => [r.name, `${r.v} / ${r.max}`] as [string, string]),
        nudge: T(l, "Әлсіз пәннен бастайтын жоспар алыңыз.", "Получите план, который начинается со слабого предмета."),
      };
    },
  },

  /* ───── Grant chance (cut-offs come from 2025 data — no manual input) ───── */
  "grant-chance": {
    defaults: { score: 95, program: "B057", rural: "no" },
    selects: (_s, l) => [
      { key: "rural", label: T(l, "Ауыл жастары (ауыл квотасы)", "Сельская молодёжь (квота)"), kind: "segmented", options: [{ value: "no", label: T(l, "Жоқ", "Нет") }, { value: "yes", label: T(l, "Иә", "Да") }] },
      {
        key: "program",
        label: T(l, "Мамандық (бағдарлама тобы)", "Специальность (группа программ)"),
        normalize: (v: string) => programByCode(v)?.code ?? "B057",
        kind: "pill",
        options: PROGRAMS.filter((p) => p.gen || p.rural).map((p) => ({ value: p.code, label: `${p.code} — ${progName(p, l)}` })),
      },
    ],
    inputs: (_s, l) => [
      { key: "score", label: T(l, "Менің ҰБТ балым", "Мой балл ЕНТ"), min: 0, max: std.maxScore.value, step: 1, helper: { label: T(l, "Балды есептеу", "Посчитать балл"), href: lp(l, "/tools/score-calculator") } },
    ],
    below: (s) => {
      const p = programByCode(String(s.program));
      return p ? <ProgramReachTable program={p} score={n(s.score)} rural={s.rural === "yes"} /> : null;
    },
    compute: (s, l) => {
      const score = n(s.score);
      const rural = s.rural === "yes";
      const p = programByCode(String(s.program)) ?? PROGRAMS[0];
      const rows = programUniversities(p.code)
        .map((r) => ({ uni: r.uni, row: rural ? r.r : r.g }))
        .filter((r): r is { uni: typeof r.uni; row: [number, number] } => !!r.row);
      const ok = rows.filter((r) => score >= r.row[0]).sort((a, b) => b.row[0] - a.row[0]);
      const mins = rows.map((r) => r.row[0]);
      const lowest = mins.length ? Math.min(...mins) : null;
      const highest = mins.length ? Math.max(...mins) : null;
      const share = rows.length ? ok.length / rows.length : 0;
      const level = !rows.length ? T(l, "Дерек жоқ", "Нет данных") : ok.length === 0 ? (lowest !== null && lowest - score <= 5 ? T(l, "Аз қалды", "Почти") : T(l, "Төмен", "Низкие")) : share >= 0.5 ? T(l, "Жоғары", "Высокие") : T(l, "Мүмкін", "Возможно");
      return {
        value: `${ok.length}/${rows.length}`,
        breakdown: T(l, `ЖОО-да балыңыз 2025 жылғы грант балынан кем емес`, `вузов, где ваш балл не ниже проходного 2025 года`),
        level,
        tone: ok.length === 0 ? "primary" : share >= 0.5 ? "success" : "star",
        levelText: `${p.code} ${progName(p, l)}`,
        lines: [
          lowest !== null ? T(l, `${rural ? "Ауыл квотасы" : "Жалпы конкурс"}: ең төменгі грант балы — ${lowest}, ең жоғарысы — ${highest}.`, `${rural ? "Сельская квота" : "Общий конкурс"}: минимальный проходной — ${lowest}, максимальный — ${highest}.`) : T(l, "Бұл конкурс түрі бойынша 2025 жылы грант болмаған.", "По этому виду конкурса в 2025 году грантов не было."),
          ok.length ? T(l, `Ең «жоғары» жететін ЖОО: ${uniName(ok[0].uni, l)} (${ok[0].row[0]}).`, `Самый «высокий» вуз, куда вы проходите: ${uniName(ok[0].uni, l)} (${ok[0].row[0]}).`) : lowest !== null ? T(l, `Грантқа жету үшін кемінде ${lowest - score} балл қосу керек.`, `Чтобы пройти, нужно добавить минимум ${lowest - score} балл(ов).`) : "",
          T(l, "Грант балы жыл сайын өзгереді — бұл 2025 жылғы деректерге негізделген болжам.", "Проходной меняется каждый год — это прогноз по данным 2025 года."),
        ],
        cross: { label: T(l, "Мамандық туралы толығырақ", "Подробнее о специальности"), href: lp(l, `/programs/${p.code}`) },
        table: [
          [T(l, "Менің балым", "Мой балл"), String(score)],
          [T(l, "Ең төменгі грант балы", "Мин. проходной"), lowest !== null ? String(lowest) : "—"],
          [T(l, "Ең жоғары грант балы", "Макс. проходной"), highest !== null ? String(highest) : "—"],
          [T(l, "Грант саны (2025)", "Грантов (2025)"), String(rows.reduce((a, r) => a + r.row[1], 0))],
        ],
        nudge: T(l, "Айырманы жабатын жоспар алыңыз.", "Получите план, который закроет разницу."),
      };
    },
  },

  /* ───── Study planner ───── */
  "study-planner": {
    defaults: { days: 120, hours: 2, current: 60, target: 100 },
    selects: () => [],
    inputs: (_s, l) => [
      { key: "days", label: T(l, "Тестке дейін қалған күн", "Дней до теста"), min: 1, max: 365, step: 1 },
      { key: "hours", label: T(l, "Күніне сағат", "Часов в день"), min: 1, max: 8, step: 1 },
      { key: "current", label: T(l, "Қазіргі пробный балл", "Текущий балл пробника"), min: 0, max: std.maxScore.value, step: 1 },
      { key: "target", label: T(l, "Мақсатты балл", "Целевой балл"), min: 0, max: std.maxScore.value, step: 1 },
    ],
    compute: (s, l) => {
      const days = n(s.days);
      const weekly = n(s.hours) * 7;
      const weeks = Math.max(1, days / 7);
      const gap = Math.max(0, n(s.target) - n(s.current));
      const perWeek = gap / weeks;
      const parts: { id: SubjectId | "p"; w: number; name: string }[] = [
        { id: "history", w: 20, name: SUBJECTS.history[l] },
        { id: "mathlit", w: 10, name: SUBJECTS.mathlit[l] },
        { id: "reading", w: 10, name: SUBJECTS.reading[l] },
        { id: "p", w: 50, name: T(l, "1-бейіндік пән", "1-й профильный") },
        { id: "p", w: 50, name: T(l, "2-бейіндік пән", "2-й профильный") },
      ];
      const status = perWeek <= 2 ? 0 : perWeek <= 4 ? 1 : 2;
      return {
        value: `${weekly}`,
        breakdown: T(l, `сағат/апта · ${Math.round(weeks)} апта · барлығы ${Math.round(weekly * weeks)} сағ`, `часов в неделю · ${Math.round(weeks)} нед. · всего ${Math.round(weekly * weeks)} ч`),
        level: [T(l, "Жоспар бойынша", "По плану"), T(l, "Тығыз", "Плотно"), T(l, "Тәуекел", "Рискованно")][status],
        tone: (["success", "star", "primary"] as const)[status],
        levelText: T(l, `Аптасына +${perWeek.toFixed(1)} балл керек`, `Нужно +${perWeek.toFixed(1)} балла в неделю`),
        lines: [
          T(l, `Мақсатқа дейін ${gap} балл қалды.`, `До цели осталось ${gap} баллов.`),
          T(l, "Уақыт пәндердің балына қарай бөлінді (140-тың 100-і — бейіндік пәндер). Бұл — grant.ai-дың шамамен ережесі.", "Время поделено по весу предметов (100 из 140 — профильные). Это примерное правило grant.ai."),
        ],
        cross: { label: T(l, "Бүгін жаттығудан бастау", "Начать практику сегодня"), href: lp(l, "/tools/question-generator") },
        table: parts.map((p) => [p.name, `${((weekly * p.w) / 140).toFixed(1)} ${T(l, "сағ/апта", "ч/нед")}`] as [string, string]),
        nudge: T(l, "Күнделікті тапсырмалары бар нақты жоспар алыңыз.", "Получите план с ежедневными заданиями."),
      };
    },
  },
};

function Stepper({ def, value, onChange, tintIndex }: { def: InputDef; value: number; onChange: (v: number) => void; tintIndex: number }) {
  const l = useLocale();
  const a = accent(tintIndex);
  const clamp = (v: number) => Math.min(def.max, Math.max(def.min, Math.round(v / def.step) * def.step));
  const id = `in-${def.key}`;
  return (
    <div className="flex items-center gap-4 rounded-2xl px-5 py-3.5" style={{ background: a.tint }}>
      <div className="min-w-0 flex-1">
        <div id={id} className="flex items-center gap-2 text-[15px] font-extrabold text-ink">
          <span aria-hidden className="size-2.5 shrink-0 rounded-full" style={{ background: a.color }} />
          {def.label}
        </div>
        <div className="mt-0.5 flex flex-wrap gap-x-3 text-[12px] font-bold text-muted">
          <span>
            {def.min}–{def.max}
          </span>
          {def.helper && (
            <Link href={def.helper.href} className="underline underline-offset-2 hover:text-ink">
              {def.helper.label}
            </Link>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button type="button" aria-label={`${def.label} −`} onClick={() => onChange(clamp(value - def.step))} disabled={value <= def.min} className="inline-flex size-11 items-center justify-center rounded-full bg-card text-ink shadow-soft transition-transform active:scale-95 disabled:opacity-40 md:size-9">
          <Minus className="size-4" strokeWidth={2.5} />
        </button>
        <div
          role="spinbutton"
          tabIndex={0}
          aria-labelledby={id}
          aria-valuemin={def.min}
          aria-valuemax={def.max}
          aria-valuenow={value}
          onKeyDown={(e) => {
            if (e.key === "ArrowUp" || e.key === "ArrowRight") onChange(clamp(value + def.step));
            else if (e.key === "ArrowDown" || e.key === "ArrowLeft") onChange(clamp(value - def.step));
            else if (e.key === "PageUp") onChange(clamp(value + def.step * 10));
            else if (e.key === "PageDown") onChange(clamp(value - def.step * 10));
            else if (e.key === "Home") onChange(def.min);
            else if (e.key === "End") onChange(def.max);
            else return;
            e.preventDefault();
          }}
          className="min-w-[64px] rounded-lg text-center font-display text-[26px] leading-none text-ink"
          title={l === "kk" ? "Көрсеткі пернелерімен өзгертіңіз" : "Меняйте стрелками"}
        >
          {value}
        </div>
        <button type="button" aria-label={`${def.label} +`} onClick={() => onChange(clamp(value + def.step))} disabled={value >= def.max} className="inline-flex size-11 items-center justify-center rounded-full bg-card text-ink shadow-soft transition-transform active:scale-95 disabled:opacity-40 md:size-9">
          <Plus className="size-4" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

const TONE: Record<Result["tone"], string> = {
  success: "bg-[#E7F8EF] text-[#0A8A50]",
  star: "bg-[#FFF4D9] text-[#8A6200]",
  primary: "bg-primary-tint-2 text-primary-nav",
};

function ResultCard({ r }: { r: Result }) {
  const l = useLocale();
  const { copied, copy } = useCopyLink();
  return (
    <div className="overflow-hidden rounded-[24px] bg-card shadow-soft-ring md:sticky md:top-24" aria-live="polite">
      <div className="relative bg-info px-6 pb-6 pt-5 text-white">
        <div className="eyebrow text-white/80">{l === "kk" ? "Нәтижеңіз" : "Ваш результат"}</div>
        <div className="mt-1 font-display text-[52px] leading-none md:text-[60px]">{r.value}</div>
        <div className="mt-2 pr-16 text-[13px] font-semibold text-white/85">{r.breakdown}</div>
        <span className="absolute right-5 top-5 inline-flex size-14 items-center justify-center rounded-full bg-white">
          <MascotAvatar size={36} className="!rounded-full" />
        </span>
      </div>
      <div className="space-y-4 p-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className={cn("rounded-full px-3 py-1 text-[12px] font-extrabold", TONE[r.tone])}>{r.level}</span>
          <span className="text-[13px] font-bold text-muted">{r.levelText}</span>
        </div>
        <div className="space-y-1 text-[15px] leading-6 text-body">
          {r.lines.map((x, i) => (
            <p key={i} className={i === r.lines.length - 1 && r.lines.length > 2 ? "text-[13px] text-muted" : undefined}>
              {x}
            </p>
          ))}
        </div>
        <Link href={r.cross.href} className="inline-block text-[14px] font-bold text-ink underline decoration-primary decoration-2 underline-offset-4">
          {r.cross.label}
        </Link>
        <table className="w-full overflow-hidden rounded-xl bg-info-bg text-[13px]">
          <tbody>
            {r.table.map(([k, v]) => (
              <tr key={k} className="border-b border-white/70 last:border-0 dark:border-line">
                <th scope="row" className="px-3 py-2 text-left font-semibold text-muted">
                  {k}
                </th>
                <td className="px-3 py-2 text-right font-extrabold text-ink">{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-line pt-4">
          <p className="text-[15px] font-extrabold text-ink">{r.nudge}</p>
          <PlanButton href={lp(l, "/quiz")} variant="blue" className="mt-3 w-full">
            {UI.buildMyPlan[l]}
          </PlanButton>
          <Button variant="secondary" className="mt-2 w-full" arrow={false} icon={<Share2 className="size-4" aria-hidden />} onClick={() => copy({ share: true, title: "grant.ai" })}>
            {copied ? UI.copied[l] : UI.shareResult[l]}
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CalculatorTool({ slug }: { slug: string }) {
  const l = useLocale();
  const cfg = CONFIGS[slug];
  const [state, set] = useQueryState(cfg.defaults);
  const selects = cfg.selects(state, l);
  const inputs = cfg.inputs(state, l);
  const result = cfg.compute(state, l);
  return (
    <div className="grid gap-6 md:grid-cols-[61fr_36fr]">
      <div className="space-y-3">
        {selects.length > 0 && (
          <div className="flex flex-wrap items-end gap-3 rounded-2xl bg-surface p-4">
            {selects.map((s) => (
              <div key={s.key} className={s.kind === "pill" ? "min-w-[220px] flex-1" : undefined}>
                <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-muted">{s.label}</div>
                {s.kind === "segmented" ? (
                  <SegmentedControl label={s.label} value={String(state[s.key])} onChange={(v) => set(s.key, v)} options={s.options} />
                ) : (
                  <PillSelect label={s.label} value={s.normalize ? s.normalize(String(state[s.key])) : String(state[s.key])} onChange={(v) => set(s.key, v)} options={s.options} className="w-full" />
                )}
              </div>
            ))}
          </div>
        )}
        {inputs.map((d, i) => (
          <Stepper key={d.key} def={d} value={Math.min(d.max, n(state[d.key]))} onChange={(v) => set(d.key, v)} tintIndex={i} />
        ))}
        <p className="pt-2 text-[13px] text-muted">
          {l === "kk" ? "Нәтиже бірден жаңарады. Бет сілтемесі енгізгеніңізге сәйкес келеді. Дереккөз: testcenter.kz (2026)." : "Результат обновляется сразу. Адрес страницы совпадает с вводом. Источник: testcenter.kz (2026)."}
        </p>
      </div>
      <div>
        <ResultCard r={result} />
      </div>
      {cfg.below && <div className="md:col-span-2">{cfg.below(state)}</div>}
    </div>
  );
}
