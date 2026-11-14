"use client";

import { ArrowLeft, Check, Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { pushToAccount } from "@/lib/account";
import { MinimalShell } from "@/components/shell/MinimalShell";
import { Button } from "@/components/ui/Button";
import { Mascot } from "@/components/ui/Logo";
import { QUIZ, type Step } from "@/content/quiz";
import { THRESHOLDS } from "@/content/unt-config";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

type Answer = string | string[] | number;
type Answers = Record<string, Answer>;
const KEY = "grantai:unt-quiz";
const TOTAL = QUIZ.length;
const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

export function QuizProgress({ step }: { step: number }) {
  const l = useLocale();
  return (
    <div className="h-[3px] w-full bg-line" role="progressbar" aria-label={T(l, "Сауалнама барысы", "Прогресс опроса")} aria-valuemin={1} aria-valuemax={TOTAL} aria-valuenow={step}>
      <div className="h-full bg-primary transition-[width] duration-300" style={{ width: `${(step / TOTAL) * 100}%` }} />
    </div>
  );
}

function TilesStep({ step, value, onPick }: { step: Extract<Step, { type: "tiles" }>; value?: Answer; onPick: (v: string) => void }) {
  const l = useLocale();
  return (
    <div className="grid gap-3">
      {step.tiles.map((t) => (
        <div key={t.value} className={cn("rounded-2xl p-4 ring-line", value === t.value && "bg-primary-tint shadow-[inset_0_0_0_2px_var(--primary)]")}>
          <div className="flex items-center gap-4">
            <span className="flex size-16 shrink-0 items-center justify-center rounded-2xl" style={{ background: t.color + "1f" }} aria-hidden>
              <Mascot size={26} bg={t.color} />
            </span>
            <div className="min-w-0">
              <span className="text-[11px] font-extrabold uppercase tracking-[1.2px]" style={{ color: t.color }}>
                {t.tag[l]}
              </span>
              <h2 className="font-sans text-[17px] font-extrabold tracking-normal text-ink">{t.title[l]}</h2>
              <p className="text-[13px] leading-5 text-muted">{t.text[l]}</p>
            </div>
          </div>
          <Button className="mt-3 w-full" onClick={() => onPick(t.value)}>
            {t.cta[l]}
          </Button>
        </div>
      ))}
    </div>
  );
}

function SingleStep({ step, value, onPick }: { step: Extract<Step, { type: "single" }>; value?: Answer; onPick: (v: string) => void }) {
  const l = useLocale();
  return (
    <div role="radiogroup" aria-label={step.question[l]} className="grid gap-2">
      {step.options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={on}
            onClick={() => onPick(o.value)}
            className={cn("flex min-h-12 items-center justify-between gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-bold text-ink transition-[box-shadow,background-color] duration-150", on ? "bg-primary-tint shadow-[inset_0_0_0_2px_var(--primary)]" : "ring-line hover:bg-surface")}
          >
            <span>
              {o.label[l]}
              {o.hint && <span className="block text-[12px] font-semibold text-muted">{o.hint[l]}</span>}
            </span>
            <span aria-hidden className={cn("inline-flex size-5 shrink-0 items-center justify-center rounded-full", on ? "bg-primary" : "ring-line")}>
              {on && <Check className="size-3 text-white" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function MultiStep({ step, value, onDone }: { step: Extract<Step, { type: "multi" }>; value?: Answer; onDone: (v: string[]) => void }) {
  const l = useLocale();
  const [sel, setSel] = useState<string[]>(Array.isArray(value) ? value : []);
  const toggle = (v: string) => setSel((x) => (x.includes(v) ? x.filter((y) => y !== v) : [...x, v]));
  return (
    <>
      <div className="flex flex-wrap gap-2" role="group" aria-label={step.question[l]}>
        {step.options.map((o) => {
          const on = sel.includes(o.value);
          return (
            <button key={o.value} type="button" aria-pressed={on} onClick={() => toggle(o.value)} className={cn("min-h-11 rounded-full px-4 text-[14px] font-bold transition-[box-shadow,background-color]", on ? "bg-primary-tint text-ink shadow-[inset_0_0_0_2px_var(--primary)]" : "text-ink ring-line hover:bg-surface")}>
              {on && <Check aria-hidden className="mr-1 inline size-3.5" strokeWidth={3} />}
              {o.label[l]}
            </button>
          );
        })}
      </div>
      <Button className="mt-5 w-full" size="lg" disabled={sel.length === 0} onClick={() => onDone(sel)}>
        {T(l, "Жалғастыру", "Продолжить")}
      </Button>
    </>
  );
}

function DateStep({ value, onDone }: { value?: Answer; onDone: (v: string) => void }) {
  const l = useLocale();
  const [d, setD] = useState(typeof value === "string" && value !== "none" ? value : "");
  const today = new Date().toISOString().slice(0, 10);
  return (
    <>
      <label className="block">
        <span className="text-[13px] font-extrabold text-ink">{T(l, "Тест күні", "Дата теста")}</span>
        <input type="date" min={today} value={d} onChange={(e) => setD(e.target.value)} className="mt-2 h-12 w-full rounded-2xl bg-card px-4 text-[16px] font-semibold text-ink ring-line" />
      </label>
      <Button className="mt-4 w-full" size="lg" disabled={!d} onClick={() => onDone(d)}>
        {T(l, "Жалғастыру", "Продолжить")}
      </Button>
      <Button className="mt-2 w-full" variant="secondary" arrow={false} onClick={() => onDone("none")}>
        {T(l, "Әлі белгісіз", "Пока неизвестна")}
      </Button>
    </>
  );
}

function SliderStep({ step, value, onDone }: { step: Extract<Step, { type: "slider" }>; value?: Answer; onDone: (v: number) => void }) {
  const l = useLocale();
  const [v, setV] = useState(typeof value === "number" ? value : step.def);
  return (
    <>
      <div className="text-center">
        <div className="font-display text-[44px] leading-none text-ink">{v}</div>
        <div className="mt-1 text-[14px] font-extrabold text-primary-deep">
          / {step.max} · {Math.round((v / step.max) * 100)}%
        </div>
      </div>
      <label className="mt-5 block">
        <span className="sr-only">{step.question[l]}</span>
        <input type="range" min={step.min} max={step.max} value={v} onChange={(e) => setV(Number(e.target.value))} className="h-11 w-full accent-[var(--primary)]" />
      </label>
      <div className="flex justify-between text-[11px] font-bold text-muted">
        <span>{step.min}</span>
        <span>{step.max}</span>
      </div>
      <Button className="mt-5 w-full" size="lg" onClick={() => onDone(v)}>
        {T(l, "Жалғастыру", "Продолжить")}
      </Button>
    </>
  );
}

function LoaderStep({ step, onDone }: { step: Extract<Step, { type: "loader" }>; onDone: () => void }) {
  const l = useLocale();
  const [n, setN] = useState(0);
  const done = useRef(onDone);
  done.current = onDone;
  useEffect(() => {
    const fast = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const id = setInterval(() => setN((x) => x + 1), fast ? 150 : 750);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (n > step.checklist.length) {
      const t = setTimeout(() => done.current(), 300);
      return () => clearTimeout(t);
    }
  }, [n, step.checklist.length]);
  return (
    <ul className="space-y-3" aria-live="polite">
      {step.checklist.map((c, i) => (
        <li key={i} className={cn("flex items-center gap-3 text-[15px] font-bold transition-opacity", i <= n ? "opacity-100" : "opacity-40")}>
          <span className={cn("inline-flex size-6 items-center justify-center rounded-full", i < n ? "bg-success" : "ring-line")}>
            {i < n ? <Check className="size-3.5 text-white" strokeWidth={3} /> : i === n ? <Loader2 className="size-3.5 animate-spin text-muted" /> : null}
          </span>
          <span className={i < n ? "text-ink" : "text-muted"}>{c[l]}</span>
        </li>
      ))}
    </ul>
  );
}

const labelOf = (id: string, v: Answer | undefined, l: Locale) => {
  const st = QUIZ.find((q) => q.id === id);
  if (!st || v == null) return "—";
  if ("options" in st) {
    const vals = Array.isArray(v) ? v : [String(v)];
    return vals.map((x) => st.options.find((o) => o.value === x)?.label[l] ?? x).join(", ");
  }
  if (st.type === "tiles") return st.tiles.find((t) => t.value === v)?.title[l] ?? String(v);
  if (st.type === "date") return v === "none" ? T(l, "Белгісіз", "Неизвестна") : new Date(String(v)).toLocaleDateString(l === "kk" ? "kk-KZ" : "ru-RU", { day: "numeric", month: "long", year: "numeric" });
  return String(v);
};

export const PLAN_KEY = "grantai:unt-quiz";

/** Compact, URL-safe encoding of the quiz answers so the emailed link restores the plan on any device. */
export function encodePlan(a: Answers) {
  const json = JSON.stringify(a);
  return btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function FinalStep({ answers, onRestart }: { answers: Answers; onRestart: () => void }) {
  const l = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "error">("idle");
  const [error, setError] = useState("");
  const isParent = answers.role === "parent";
  const cur = Number(answers.current ?? 0);
  const tgt = Number(answers.target ?? 0);
  const th = THRESHOLDS.value.find((t) => t.id === answers.field);
  const hours = Number(answers.hours ?? 2) * 7;
  const rows: [string, string][] = [
    [T(l, "Комбинация", "Комбинация"), labelOf("pair", answers.pair, l)],
    [T(l, "Сессия", "Сессия"), labelOf("session", answers.session, l)],
    [T(l, "Тест күні", "Дата теста"), labelOf("date", answers.date, l)],
    [T(l, "Қазір → мақсат", "Сейчас → цель"), `${cur} → ${tgt} (+${Math.max(0, tgt - cur)})`],
    [T(l, "Шекті балл", "Порог"), th ? `${th.label[l]}: ${th.score}${cur < th.score ? ` (−${th.score - cur})` : " ✓"}` : "—"],
    [T(l, "Аптасына", "В неделю"), `${hours} ${T(l, "сағат", "ч")}`],
    [T(l, "Әлсіз пәндер", "Слабые предметы"), labelOf("weak", answers.weak, l)],
  ];
  const steps = [
    T(l, "Толық форматтағы диагностикалық тест (120 тапсырма)", "Диагностический тест в полном формате (120 заданий)"),
    T(l, "Ең әлсіз пәннен 20 сұрақ — генератор арқылы", "20 вопросов по самому слабому предмету в генераторе"),
    T(l, "Оқу сауаттылығы жаттығуы: 10 сұрақ, 20 минут", "Тренажёр чтения: 10 вопросов, 20 минут"),
  ];

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/send-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, locale: l, parent: isParent, rows, steps, planUrl: `${window.location.origin}/${l}/plan?d=${encodePlan(answers)}` }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; reason?: string };
      try {
        sessionStorage.setItem("grantai:plan-email", JSON.stringify({ email, ok: !!data.ok, reason: data.reason ?? null }));
      } catch {}
      if (data.ok || data.reason === "not_configured") {
        router.push(`/${l}/plan`);
        return;
      }
      setState("error");
      setError(data.reason === "invalid_email" ? T(l, "Пошта адресі қате сияқты.", "Похоже, адрес почты указан с ошибкой.") : T(l, "Хат жіберілмеді. Кейінірек қайталап көріңіз.", "Письмо не отправилось. Попробуйте позже."));
    } catch {
      setState("error");
      setError(T(l, "Желі қатесі. Қайталап көріңіз.", "Ошибка сети. Попробуйте ещё раз."));
    }
  };

  return (
    <>
      <dl className="divide-y divide-line rounded-2xl ring-line">
        {rows.map(([k, v]) => (
          <div key={k} className="flex justify-between gap-4 px-4 py-3 text-[14px]">
            <dt className="font-semibold text-muted">{k}</dt>
            <dd className="text-right font-extrabold text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      <div className="mt-5 rounded-2xl bg-primary-tint p-4">
        <p className="text-[13px] font-extrabold uppercase tracking-[1px] text-primary-deep">{T(l, "Алғашқы үш қадам", "Первые три шага")}</p>
        <ol className="mt-2 list-decimal space-y-1 pl-5 text-[14px] font-semibold text-ink">
          {steps.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ol>
      </div>
      <form className="mt-5" onSubmit={send}>
        <label className="block text-[13px] font-extrabold text-ink" htmlFor="quiz-email">
          {T(l, "Электрондық пошта", "Электронная почта")}
        </label>
        <input id="quiz-email" type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.kz" className="mt-2 h-12 w-full rounded-2xl bg-card px-4 text-[16px] ring-line" />
        {state === "error" && (
          <p role="alert" className="mt-2 text-[13px] font-bold text-primary-deep">
            {error}
          </p>
        )}
        <Button type="submit" className="mt-3 w-full" size="lg" disabled={state === "sending"}>
          {state === "sending" ? T(l, "Жіберіліп жатыр…", "Отправляем…") : T(l, "Жоспарды поштаға жіберу", "Отправить план на почту")}
        </Button>
      </form>
      <button type="button" onClick={onRestart} className="mt-4 w-full text-center text-[13px] font-bold text-muted underline underline-offset-4">
        {T(l, "Қайта бастау", "Начать заново")}
      </button>
    </>
  );
}

export function QuizShell() {
  const l = useLocale();
  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState<Answers>({});
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let saved: Answers = {};
    try {
      saved = JSON.parse(localStorage.getItem(KEY) || "{}");
    } catch {}
    const p = new URLSearchParams(window.location.search);
    QUIZ.forEach((q) => {
      const raw = p.get(q.id);
      if (raw == null) return;
      if (q.type === "multi") saved[q.id] = raw.split(",");
      else if (q.type === "slider") saved[q.id] = Number(raw);
      else saved[q.id] = raw;
    });
    setAnswers(saved);
    const n = Number(p.get("step"));
    setStep(n >= 1 && n <= TOTAL ? n : 1);
    setReady(true);
    const onPop = () => {
      const x = Number(new URLSearchParams(window.location.search).get("step")) || 1;
      setDir("prev");
      setStep(Math.min(TOTAL, Math.max(1, x)));
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(answers));
      window.dispatchEvent(new Event("grantai:plan"));
      if (answers.role) pushToAccount({ plan: answers });
    } catch {}
  }, [answers, ready]);

  const go = useCallback((n: number, push = true) => {
    const next = Math.min(TOTAL, Math.max(1, n));
    setStep((cur) => {
      setDir(next >= cur ? "next" : "prev");
      return next;
    });
    const p = new URLSearchParams(window.location.search);
    p.set("step", String(next));
    const url = `${window.location.pathname}?${p.toString()}`;
    if (push) window.history.pushState(null, "", url);
    else window.history.replaceState(null, "", url);
    window.scrollTo({ top: 0 });
  }, []);

  const st = QUIZ[step - 1];
  const value = answers[st.id];
  const isParent = answers.role === "parent";
  const answer = (v: Answer, delay = 0) => {
    setAnswers((a) => ({ ...a, [st.id]: v }));
    if (delay) setTimeout(() => go(step + 1), delay);
    else go(step + 1);
  };
  const restart = () => {
    setAnswers({});
    try {
      localStorage.removeItem(KEY);
    } catch {}
    window.history.replaceState(null, "", window.location.pathname);
    setDir("prev");
    setStep(1);
  };

  return (
    <MinimalShell
      left={
        <div className="flex items-center gap-1">
          {step > 1 && (
            <button type="button" onClick={() => go(step - 1)} aria-label={T(l, "Алдыңғы сұрақ", "Предыдущий вопрос")} className="-ml-2 inline-flex size-11 items-center justify-center rounded-full hover:bg-surface">
              <ArrowLeft className="size-5" />
            </button>
          )}
          <span className="text-[14px] font-extrabold text-muted" aria-label={T(l, `${TOTAL} сұрақтың ${step}-сі`, `Вопрос ${step} из ${TOTAL}`)}>
            <span className="text-primary">{step}</span> / {TOTAL}
          </span>
        </div>
      }
      bar={<QuizProgress step={step} />}
    >
      <div className="mx-auto max-w-[440px] px-4 pt-12">
        {ready && (
          <div key={step} className={dir === "next" ? "slide-next" : "slide-prev"}>
            <h1 className="text-center text-[21px] leading-tight text-ink">{(isParent && st.questionParent ? st.questionParent : st.question)[l]}</h1>
            {(isParent && st.helperParent ? st.helperParent : st.helper) && <p className="mt-2 text-center text-[15px] text-muted">{(isParent && st.helperParent ? st.helperParent : st.helper)![l]}</p>}
            <div className="mt-6 rounded-[24px] bg-card p-4 shadow-soft-ring">
              {st.type === "tiles" && <TilesStep step={st} value={value} onPick={(v) => answer(v)} />}
              {st.type === "single" && <SingleStep step={st} value={value} onPick={(v) => answer(v, 220)} />}
              {st.type === "multi" && <MultiStep step={st} value={value} onDone={(v) => answer(v)} />}
              {st.type === "date" && <DateStep value={value} onDone={(v) => answer(v)} />}
              {st.type === "slider" && <SliderStep step={st} value={value} onDone={(v) => answer(v)} />}
              {st.type === "loader" && <LoaderStep step={st} onDone={() => go(step + 1, false)} />}
              {st.type === "final" && <FinalStep answers={answers} onRestart={restart} />}
            </div>
          </div>
        )}
      </div>
    </MinimalShell>
  );
}
