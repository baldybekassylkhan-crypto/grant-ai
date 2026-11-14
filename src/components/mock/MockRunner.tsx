"use client";

import Link from "next/link";
import { Check, ChevronLeft, ChevronRight, Flag, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MinimalShell } from "@/components/shell/MinimalShell";
import { ReachList } from "@/components/tools/Reach";
import { MockAnalysis } from "./MockAnalysis";
import { Button } from "@/components/ui/Button";
import { PillSelect } from "@/components/ui/client";
import { mmss } from "@/components/tools/hooks";
import type { MockQ } from "@/content/mock/generators";
import { buildMock, scoreMock, scoreQuestion, type AnswerValue } from "@/content/mock/mocks";
import { THRESHOLDS } from "@/content/unt-config";
import { cn } from "@/lib/cn";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";
import { SYNC_EVENT, pushToAccount } from "@/lib/account";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);
export const HISTORY_KEY = "grantai:mock-history";
export type MockHistoryItem = { id: number; pair: string | null; total: number; max: number; at: string; per: { id: string; pts: number; max: number }[] };

function QuestionView({ q, value, onChange, review }: { q: MockQ; value?: AnswerValue; onChange: (v: AnswerValue) => void; review?: boolean }) {
  const l = useLocale();
  if (q.type === "matching" && q.pairs) {
    const m = (value as Record<number, number>) ?? {};
    const rights = [...q.pairs.map((p, i) => ({ i, label: p.right[l] }))].sort((a, b) => a.label.localeCompare(b.label));
    return (
      <div className="space-y-2">
        <p className="text-[13px] font-bold text-muted">{T(l, "Әр сол жақ элементке сәйкесін таңдаңыз (2 балл).", "Подберите соответствие к каждому элементу слева (2 балла).")}</p>
        {q.pairs.map((p, i) => {
          const ok = m[i] === i;
          return (
            <div key={i} className="flex flex-wrap items-center gap-3">
              <span className="min-w-28 text-[15px] font-extrabold text-ink">{p.left[l]}</span>
              <span aria-hidden className="text-muted">→</span>
              <PillSelect
                label={p.left[l]}
                value={m[i] !== undefined ? String(m[i]) : ""}
                onChange={(v) => !review && onChange({ ...m, [i]: v === "" ? -1 : Number(v) })}
                options={[{ value: "", label: "—" }, ...rights.map((r) => ({ value: String(r.i), label: r.label }))]}
                className={cn("min-w-48 flex-1", review && (ok ? "[&_select]:shadow-[inset_0_0_0_2px_var(--success)]" : "[&_select]:shadow-[inset_0_0_0_2px_var(--primary)]"))}
              />
              {review && !ok && <span className="text-[13px] font-bold text-success">✓ {p.right[l]}</span>}
            </div>
          );
        })}
      </div>
    );
  }
  const multi = q.type === "multi";
  const picked = (value as number[]) ?? [];
  const corr = q.correct ?? [];
  return (
    <div className="grid gap-2">
      {multi && <p className="text-[13px] font-bold text-muted">{T(l, "Бір немесе бірнеше дұрыс жауап (2 балл).", "Один или несколько правильных ответов (2 балла).")}</p>}
      {q.options?.map((o, i) => {
        const on = picked.includes(i);
        const state = review ? (corr.includes(i) ? "bg-[#E7F8EF] shadow-[inset_0_0_0_2px_var(--success)]" : on ? "bg-primary-tint shadow-[inset_0_0_0_2px_var(--primary)]" : "ring-line opacity-70") : on ? "bg-info-bg shadow-[inset_0_0_0_2px_var(--info)]" : "ring-line hover:bg-surface";
        return (
          <button
            key={i}
            type="button"
            role={multi ? "checkbox" : "radio"}
            aria-checked={on}
            disabled={review}
            onClick={() => onChange(multi ? (on ? picked.filter((x) => x !== i) : [...picked, i]) : [i])}
            className={cn("flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[15px] font-semibold text-ink transition-colors", state)}
          >
            <span className={cn("inline-flex size-6 shrink-0 items-center justify-center text-[12px] font-extrabold", multi ? "rounded-md ring-line" : "rounded-full ring-line", on && !review && "bg-info text-white")}>{String.fromCharCode(65 + i)}</span>
            <span className="flex-1">{o[l]}</span>
            {review && corr.includes(i) && <Check aria-hidden className="size-4 text-success" />}
            {review && on && !corr.includes(i) && <X aria-hidden className="size-4 text-primary" />}
          </button>
        );
      })}
    </div>
  );
}

function answerText(q: MockQ, v: AnswerValue | undefined, l: Locale) {
  if (v === undefined || (Array.isArray(v) && v.length === 0)) return T(l, "жауап берілмеген", "нет ответа");
  if (q.type === "matching" && q.pairs) {
    const m = v as Record<number, number>;
    return q.pairs.map((p, i) => `${p.left[l]} → ${m[i] !== undefined && m[i] >= 0 ? q.pairs![m[i]].right[l] : "—"}`).join("; ");
  }
  return (v as number[]).map((i) => q.options?.[i]?.[l] ?? "").join(", ");
}
function correctText(q: MockQ, l: Locale) {
  if (q.type === "matching" && q.pairs) return q.pairs.map((p) => `${p.left[l]} → ${p.right[l]}`).join("; ");
  return (q.correct ?? []).map((i) => q.options?.[i]?.[l] ?? "").join(", ");
}

/** Review explanation: your answer vs the right one, why, and the typical trap for this task type. */
function ReviewNote({ q, value }: { q: MockQ; value?: AnswerValue }) {
  const l = useLocale();
  const ok = scoreQuestion(q, value) > 0;
  const empty = value === undefined || (Array.isArray(value) && value.length === 0);
  const trap =
    q.type === "multi"
      ? T(l, "2 балл тек барлық дұрыс нұсқа таңдалса және бірде-бір қате нұсқа болмаса беріледі.", "2 балла даются, только если выбраны все верные варианты и ни одного лишнего.")
      : q.type === "matching"
        ? T(l, "Сәйкестікте бір жұп қате болса, 2 балл берілмейді — ең сенімді жұптан бастаңыз.", "В соответствии одна ошибочная пара — и 2 балла не засчитываются; начинайте с самой уверенной пары.")
        : null;
  return (
    <div className={cn("mt-4 space-y-2 rounded-xl p-3 text-[14px] leading-6", ok ? "bg-[#E7F8EF] text-[#0A6B3E]" : "bg-primary-tint text-primary-deep")}>
      <p>
        <strong>{ok ? T(l, "Дұрыс.", "Верно.") : empty ? T(l, "Жауап берілмеген.", "Нет ответа.") : T(l, "Қате.", "Неверно.")}</strong>{" "}
        {!ok && !empty && (
          <>
            {T(l, "Сіздің жауабыңыз: ", "Ваш ответ: ")}
            <strong>{answerText(q, value, l)}</strong>.{" "}
          </>
        )}
        {!ok && (
          <>
            {T(l, "Дұрыс жауап: ", "Правильный ответ: ")}
            <strong>{correctText(q, l)}</strong>.
          </>
        )}
      </p>
      {q.explain && (
        <p className="text-body">
          <strong className="text-ink">{T(l, "Неге: ", "Почему: ")}</strong>
          {q.explain[l]}
        </p>
      )}
      {!ok && trap && <p className="text-body">{trap}</p>}
    </div>
  );
}

export function MockRunner({ id }: { id: number }) {
  const l = useLocale();
  const [pair, setPair] = useState<string | null | undefined>(undefined);
  const [answers, setAnswers] = useState<Record<string, AnswerValue>>({});
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [now, setNow] = useState(Date.now());
  const [sec, setSec] = useState(0);
  const [qi, setQi] = useState(0);
  const [phase, setPhase] = useState<"test" | "confirm" | "result" | "review">("test");

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("pair");
    setPair(p && p !== "none" ? p : null);
  }, []);

  const mock = useMemo(() => (pair === undefined ? null : buildMock(id, pair)), [id, pair]);
  const key = `grantai:mock:${id}:${pair ?? "core"}`;

  useEffect(() => {
    if (!mock) return;
    try {
      const saved = JSON.parse(localStorage.getItem(key) || "null");
      if (saved) {
        setAnswers(saved.answers ?? {});
        setFlags(saved.flags ?? {});
        setStartedAt(saved.startedAt ?? Date.now());
        setFinishedAt(saved.finishedAt ?? null);
        if (saved.done) setPhase("result");
      } else setStartedAt(Date.now());
    } catch {
      setStartedAt(Date.now());
    }
  }, [mock, key]);

  useEffect(() => {
    if (!mock || startedAt === null) return;
    try {
      localStorage.setItem(key, JSON.stringify({ answers, flags, startedAt, finishedAt, done: phase === "result" || phase === "review" }));
    } catch {}
  }, [answers, flags, startedAt, finishedAt, phase, mock, key]);

  useEffect(() => {
    if (phase !== "test" && phase !== "confirm") return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [phase]);

  const left = mock && startedAt ? Math.max(0, mock.minutes * 60 - Math.floor((now - startedAt) / 1000)) : 0;

  const finish = useCallback(() => {
    if (!mock) return;
    const res = scoreMock(mock, answers);
    try {
      const hist: MockHistoryItem[] = JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]");
      hist.push({ id: mock.id, pair: mock.pair, total: res.total, max: res.max, at: new Date().toISOString(), per: res.per.map((p) => ({ id: p.id, pts: p.pts, max: p.max })) });
      localStorage.setItem(HISTORY_KEY, JSON.stringify(hist.slice(-50)));
      pushToAccount({ mockHistory: hist.slice(-50) });
    } catch {}
    setFinishedAt(Date.now());
    setPhase("result");
  }, [mock, answers]);

  useEffect(() => {
    if (phase === "test" && mock && startedAt && left === 0) finish();
  }, [left, phase, mock, startedAt, finish]);

  if (!mock) return <MinimalShell><div className="p-10 text-center text-muted">…</div></MinimalShell>;

  const section = mock.sections[sec];
  const q = section.qs[qi];
  const answeredIn = (s: typeof section) => s.qs.filter((x) => answers[x.id] !== undefined && (Array.isArray(answers[x.id]) ? (answers[x.id] as number[]).length > 0 : true)).length;
  const totalAnswered = mock.sections.reduce((a, s) => a + answeredIn(s), 0);
  const go = (d: number) => {
    const n = qi + d;
    if (n >= 0 && n < section.qs.length) setQi(n);
    else if (n >= section.qs.length && sec < mock.sections.length - 1) {
      setSec(sec + 1);
      setQi(0);
    } else if (n < 0 && sec > 0) {
      setSec(sec - 1);
      setQi(mock.sections[sec - 1].qs.length - 1);
    }
  };
  const restart = () => {
    try {
      localStorage.removeItem(key);
    } catch {}
    setAnswers({});
    setFlags({});
    setStartedAt(Date.now());
    setFinishedAt(null);
    setSec(0);
    setQi(0);
    setPhase("test");
  };

  const title = `${T(l, "Пробный тест", "Пробный тест")} №${mock.id}`;

  /* ───── Result ───── */
  if (phase === "result") {
    const res = scoreMock(mock, answers);
    const nat = THRESHOLDS.value.find((t) => t.id === "national")!.score;
    const oth = THRESHOLDS.value.find((t) => t.id === "other")!.score;
    return (
      <MinimalShell left={<span className="text-[14px] font-extrabold text-muted">{title}</span>}>
        <div className="mx-auto max-w-[860px] px-4 pb-16 pt-10">
          <p className="eyebrow text-primary-deep">{T(l, "Нәтиже", "Результат")}</p>
          <h1 className="mt-1 text-[30px] text-ink md:text-[40px]">
            {res.total} / {res.max}
          </h1>
          {!mock.pair && <p className="mt-2 text-[14px] text-muted">{T(l, "Тек міндетті бөлім (40 балл). Толық ҰБТ — 140 балл.", "Только обязательная часть (40 баллов). Полное ЕНТ — 140 баллов.")}</p>}
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {res.per.map((p) => (
              <div key={p.id} className={cn("rounded-2xl bg-card p-4 ring-line", !p.ok && "shadow-[inset_0_0_0_2px_var(--primary)]")}>
                <div className="text-[13px] font-bold text-muted">{p.name[l]}</div>
                <div className="font-display text-[26px] text-ink">
                  {p.pts}
                  <span className="text-[15px] text-muted"> / {p.max}</span>
                </div>
                <div className={cn("text-[12px] font-extrabold", p.ok ? "text-success" : "text-primary-deep")}>{p.ok ? T(l, `Минимум (${p.min}) ✓`, `Минимум (${p.min}) ✓`) : T(l, `Минимумға жетпеді (${p.min})`, `Минимум не набран (${p.min})`)}</div>
              </div>
            ))}
          </div>
          {mock.pair && (
            <div className="mt-6 rounded-2xl bg-info-bg p-4 text-[15px] text-body">
              {res.allMinimums ? (res.total >= nat ? T(l, `Ұлттық ЖОО шекті балынан (${nat}) өттіңіз.`, `Вы прошли порог национальных вузов (${nat}).`) : res.total >= oth ? T(l, `Басқа ЖОО шекті балынан (${oth}) өттіңіз, ұлттық ЖОО-ға (${nat}) ${nat - res.total} балл жетпейді.`, `Порог других вузов (${oth}) пройден, до национальных (${nat}) не хватает ${nat - res.total}.`) : T(l, `Шекті балға (${oth}) ${oth - res.total} балл жетпейді.`, `До порога (${oth}) не хватает ${oth - res.total}.`)) : T(l, "Бір немесе бірнеше пәннен минимум балл жиналмады — шектен өту үшін барлық минимумдар орындалуы керек.", "По одному или нескольким предметам не набран минимум — для прохождения порога нужны все минимумы.")}
            </div>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Button onClick={() => { setPhase("review"); setSec(0); setQi(0); }} arrow={false}>
              {T(l, "Жауаптарды талдау", "Разбор ответов")}
            </Button>
            <Button variant="secondary" arrow={false} onClick={restart}>
              {T(l, "Қайта тапсыру", "Пройти заново")}
            </Button>
            <Button href={lp(l, "/mock-tests")} variant="secondary">
              {T(l, "Барлық тесттер", "Все тесты")}
            </Button>
          </div>
          <MockAnalysis mock={mock} answers={answers} startedAt={startedAt} finishedAt={finishedAt} />
          {mock.pair && <ReachList score={res.total} pair={mock.pair} rural={false} />}
        </div>
      </MinimalShell>
    );
  }

  const review = phase === "review";
  const qPos = mock.sections.slice(0, sec).reduce((a, s) => a + s.qs.length, 0) + qi + 1;

  return (
    <MinimalShell
      left={
        <span className="text-[14px] font-extrabold text-muted">
          {title} · <span className="text-primary">{qPos}</span>/{mock.tasks}
        </span>
      }
      bar={
        <div className="h-[3px] w-full bg-line">
          <div className="h-full bg-primary transition-[width]" style={{ width: `${(totalAnswered / mock.tasks) * 100}%` }} />
        </div>
      }
    >
      <div className="mx-auto max-w-[1152px] px-4 pb-16 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="tablist" aria-label={T(l, "Пәндер", "Предметы")}>
            {mock.sections.map((s, i) => (
              <button key={s.id} role="tab" aria-selected={i === sec} type="button" onClick={() => { setSec(i); setQi(0); }} className={cn("min-h-10 shrink-0 whitespace-nowrap rounded-full px-3.5 text-[13px] font-bold", i === sec ? "bg-ink text-page" : "bg-card text-muted ring-line hover:text-ink")}>
                {s.name[l]} <span className="opacity-70">{answeredIn(s)}/{s.qs.length}</span>
              </button>
            ))}
          </div>
          {review ? (
            <Button size="sm" variant="secondary" arrow={false} onClick={() => setPhase("result")}>
              {T(l, "Нәтижеге оралу", "К результату")}
            </Button>
          ) : (
            <div className="flex items-center gap-3">
              <span className={cn("font-display text-[20px]", left < 600 ? "text-primary" : "text-ink")} role="timer" aria-label={T(l, "Қалған уақыт", "Оставшееся время")}>
                {Math.floor(left / 3600)}:{mmss(left % 3600)}
              </span>
              <Button size="sm" arrow={false} onClick={() => setPhase("confirm")}>
                {T(l, "Аяқтау", "Завершить")}
              </Button>
            </div>
          )}
        </div>

        <div className={cn("mt-5 grid gap-5", section.context ? "lg:grid-cols-[1fr_1fr]" : "lg:grid-cols-[1fr_260px]")}>
          {section.context && (
            <article className="max-h-[70vh] overflow-y-auto rounded-[20px] bg-card p-5 ring-line lg:sticky lg:top-20">
              <h2 className="text-[18px] text-ink">{section.context.title[l]}</h2>
              <p className="mt-3 text-[16px] leading-7 text-body">{section.context.text[l]}</p>
            </article>
          )}
          <div className="rounded-[20px] bg-card p-5 shadow-soft-ring">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-extrabold text-muted">
                {section.name[l]} · {qi + 1}/{section.qs.length} · {q.points} {T(l, "балл", "балл")}
              </span>
              {!review && (
                <button type="button" aria-pressed={!!flags[q.id]} onClick={() => setFlags((f) => ({ ...f, [q.id]: !f[q.id] }))} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold", flags[q.id] ? "bg-[#FFF4D9] text-[#8A6200]" : "text-muted ring-line")}>
                  <Flag className="size-3.5" aria-hidden /> {T(l, "Белгілеу", "Отметить")}
                </button>
              )}
            </div>
            {q.context && <p className="mt-3 rounded-xl bg-surface p-3 text-[15px] leading-6 text-body">{q.context[l]}</p>}
            <p className="mt-3 text-[18px] font-extrabold leading-7 text-ink">{q.prompt[l]}</p>
            <div className="mt-4">
              <QuestionView key={q.id + phase} q={q} value={answers[q.id]} review={review} onChange={(v) => setAnswers((a) => ({ ...a, [q.id]: v }))} />
            </div>
            {review && <ReviewNote q={q} value={answers[q.id]} />}
            <div className="mt-5 flex justify-between gap-3">
              <Button variant="secondary" size="sm" arrow={false} onClick={() => go(-1)} icon={<ChevronLeft className="size-4" aria-hidden />} disabled={sec === 0 && qi === 0}>
                {T(l, "Алдыңғы", "Назад")}
              </Button>
              <Button size="sm" arrow={false} onClick={() => go(1)} disabled={sec === mock.sections.length - 1 && qi === section.qs.length - 1}>
                {T(l, "Келесі", "Далее")} <ChevronRight className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
          {!section.context && (
            <aside className="rounded-[20px] bg-card p-4 ring-line">
              <p className="text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Сұрақтар", "Вопросы")}</p>
              <div className="mt-3 grid grid-cols-8 gap-1.5 lg:grid-cols-5">
                {section.qs.map((x, i) => {
                  const ans = answers[x.id] !== undefined && (!Array.isArray(answers[x.id]) || (answers[x.id] as number[]).length > 0);
                  const right = review && scoreQuestion(x, answers[x.id]) > 0;
                  return (
                    <button key={x.id} type="button" onClick={() => setQi(i)} aria-label={`${i + 1}`} className={cn("relative h-9 rounded-lg text-[12px] font-extrabold", i === qi ? "ring-2 ring-ink" : "", review ? (right ? "bg-[#E7F8EF] text-[#0A8A50]" : "bg-primary-tint text-primary-deep") : ans ? "bg-info text-white" : "bg-surface text-muted")}>
                      {i + 1}
                      {flags[x.id] && <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-star" aria-hidden />}
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-[11px] text-muted">{T(l, "Көк — жауап берілді, сары нүкте — белгіленген.", "Синий — отвечено, жёлтая точка — отмечено.")}</p>
            </aside>
          )}
        </div>
        {section.context && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {section.qs.map((x, i) => {
              const ans = answers[x.id] !== undefined;
              const right = review && scoreQuestion(x, answers[x.id]) > 0;
              return (
                <button key={x.id} type="button" onClick={() => setQi(i)} className={cn("h-9 w-9 rounded-lg text-[12px] font-extrabold", i === qi && "ring-2 ring-ink", review ? (right ? "bg-[#E7F8EF] text-[#0A8A50]" : "bg-primary-tint text-primary-deep") : ans ? "bg-info text-white" : "bg-surface text-muted")}>
                  {i + 1}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {phase === "confirm" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" role="dialog" aria-modal="true">
          <div className="pop-in w-full max-w-md rounded-[24px] bg-card p-6 shadow-soft">
            <h2 className="text-[20px] text-ink">{T(l, "Тестті аяқтайсыз ба?", "Завершить тест?")}</h2>
            <p className="mt-2 text-[15px] text-body">{T(l, `${mock.tasks} тапсырманың ${totalAnswered}-іне жауап бердіңіз.`, `Вы ответили на ${totalAnswered} из ${mock.tasks} заданий.`)}</p>
            <div className="mt-5 flex gap-3">
              <Button onClick={finish} arrow={false}>{T(l, "Аяқтау", "Завершить")}</Button>
              <Button variant="secondary" arrow={false} onClick={() => setPhase("test")}>{T(l, "Жалғастыру", "Продолжить")}</Button>
            </div>
          </div>
        </div>
      )}
    </MinimalShell>
  );
}

/** List of finished attempts (used on the mock list and plan page). */
export function MockHistory({ compact = false }: { compact?: boolean }) {
  const l = useLocale();
  const [hist, setHist] = useState<MockHistoryItem[]>([]);
  useEffect(() => {
    const load = () => {
      try {
        setHist(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
      } catch {}
    };
    load();
    window.addEventListener(SYNC_EVENT, load);
    return () => window.removeEventListener(SYNC_EVENT, load);
  }, []);
  if (!hist.length) return compact ? null : <p className="text-[14px] text-muted">{T(l, "Әзірге нәтиже жоқ. Бірінші тестті тапсырыңыз!", "Пока нет результатов. Пройдите первый тест!")}</p>;
  const last = hist.slice(-8);
  const maxv = Math.max(...last.map((h) => h.max));
  return (
    <div>
      <div className="flex h-32 items-end gap-2" aria-label={T(l, "Нәтижелер динамикасы", "Динамика результатов")}>
        {last.map((h, i) => (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <span className="text-[11px] font-extrabold text-ink">{h.total}</span>
            <div className="w-full rounded-t-lg bg-primary" style={{ height: `${Math.max(6, (h.total / maxv) * 100)}px` }} />
            <span className="text-[10px] text-muted">№{h.id}</span>
          </div>
        ))}
      </div>
      {!compact && (
        <ul className="mt-4 divide-y divide-line rounded-2xl ring-line">
          {[...hist].reverse().slice(0, 10).map((h, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-4 py-2.5 text-[14px]">
              <Link href={lp(l, `/mock/${h.id}${h.pair ? `?pair=${h.pair}` : ""}`)} className="font-bold text-ink hover:underline">
                {T(l, "Тест", "Тест")} №{h.id}
              </Link>
              <span className="text-muted">{new Date(h.at).toLocaleDateString(l === "kk" ? "kk-KZ" : "ru-RU")}</span>
              <span className="font-extrabold text-ink">
                {h.total}/{h.max}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
