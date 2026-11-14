"use client";

import { Check, NotebookPen, Pause, Play, RotateCcw, Search, Share2, Shuffle, SkipForward, Volume2, VolumeX, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { PillSelect, SegmentedControl } from "@/components/ui/client";
import { UI } from "@/content/ui";
import { SUBJECTS } from "@/content/unt-config";
import { QUESTIONS, READING_QUESTIONS, READING_TEXT, READING_TYPE_LABEL, TOPICS, type QSubject, type Question } from "@/content/questions";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";
import { beep, mmss, useCopyLink } from "./hooks";

const PER_TASK = 120; // 240 min / 120 tasks
const SUBJECT_TABS: QSubject[] = ["history", "mathlit", "math", "physics", "geography", "biology", "chemistry"];
const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

const TYPE_LABEL: Record<Question["type"], { kk: string; ru: string }> = {
  single: { kk: "Бір дұрыс жауап", ru: "Один правильный ответ" },
  multi: { kk: "Бір немесе бірнеше дұрыс жауап", ru: "Один или несколько ответов" },
  matching: { kk: "Сәйкестікті анықтау", ru: "Установите соответствие" },
  context: { kk: "Контекст негізіндегі тапсырма", ru: "Задание на основе контекста" },
};

function TimerRing({ left, total }: { left: number; total: number }) {
  const r = 36;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-20 shrink-0">
      <svg viewBox="0 0 80 80" className="size-20 -rotate-90" aria-hidden>
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--border)" strokeWidth="6" />
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--info)" strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - left / total)} className="transition-[stroke-dashoffset] duration-1000 ease-linear" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-[16px] text-ink" role="timer">
        {mmss(left)}
      </span>
    </div>
  );
}

function Toggle({ on, onClick, label, icon }: { on: boolean; onClick: () => void; label: string; icon: React.ReactNode }) {
  return (
    <button type="button" aria-pressed={on} onClick={onClick} className={cn("inline-flex min-h-9 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold transition-colors", on ? "bg-info text-white" : "bg-card text-muted ring-line hover:text-ink")}>
      {icon}
      {label}
    </button>
  );
}

/* ───────────── Answer area per task type ───────────── */

function AnswerArea({ q, onResult, sound }: { q: Question; onResult: (ok: boolean) => void; sound: boolean }) {
  const l = useLocale();
  const [picked, setPicked] = useState<number[]>([]);
  const [match, setMatch] = useState<Record<number, string>>({});
  const [checked, setChecked] = useState(false);
  const rights = useMemo(() => (q.pairs ? [...q.pairs.map((p, i) => ({ i, label: p.right[l] }))].sort((a, b) => a.label.localeCompare(b.label)) : []), [q, l]);

  const finish = (ok: boolean) => {
    setChecked(true);
    if (sound) beep(ok ? 880 : 220);
    onResult(ok);
  };

  if (q.type === "matching" && q.pairs) {
    const ok = q.pairs.every((_, i) => match[i] === String(i));
    return (
      <div className="mt-4 space-y-2">
        {q.pairs.map((p, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-[15px] font-extrabold text-ink">{p.left[l]}</span>
            <span aria-hidden className="text-muted">→</span>
            <PillSelect
              label={p.left[l]}
              value={match[i] ?? ""}
              onChange={(v) => setMatch((m) => ({ ...m, [i]: v }))}
              options={[{ value: "", label: "—" }, ...rights.map((r) => ({ value: String(r.i), label: r.label }))]}
              className={cn("flex-1", checked && (match[i] === String(i) ? "[&_select]:shadow-[inset_0_0_0_2px_var(--success)]" : "[&_select]:shadow-[inset_0_0_0_2px_var(--primary)]"))}
            />
          </div>
        ))}
        {!checked && (
          <Button size="sm" variant="blue" arrow={false} className="mt-2" disabled={Object.keys(match).length < q.pairs.length} onClick={() => finish(ok)}>
            {T(l, "Тексеру", "Проверить")}
          </Button>
        )}
      </div>
    );
  }

  const multi = q.type === "multi";
  const correct = q.correct ?? [];
  const isRight = picked.length === correct.length && picked.every((p) => correct.includes(p));
  return (
    <div className="mt-4">
      <div className="grid gap-2">
        {q.options?.map((o, i) => {
          const on = picked.includes(i);
          const state = !checked ? (on ? "bg-info-bg shadow-[inset_0_0_0_2px_var(--info)]" : "ring-line hover:bg-surface") : correct.includes(i) ? "bg-[#E7F8EF] shadow-[inset_0_0_0_2px_var(--success)]" : on ? "bg-primary-tint shadow-[inset_0_0_0_2px_var(--primary)]" : "opacity-60 ring-line";
          return (
            <button
              key={i}
              type="button"
              role={multi ? "checkbox" : "radio"}
              aria-checked={on}
              disabled={checked}
              onClick={() => {
                if (multi) setPicked((p) => (p.includes(i) ? p.filter((x) => x !== i) : [...p, i]));
                else {
                  setPicked([i]);
                  setChecked(true);
                  const ok = correct.includes(i);
                  if (sound) beep(ok ? 880 : 220);
                  onResult(ok);
                }
              }}
              className={cn("flex min-h-11 items-center gap-3 rounded-xl px-4 py-2.5 text-left text-[15px] font-semibold text-ink transition-colors", state)}
            >
              <span className="w-5 font-extrabold text-muted">{String.fromCharCode(65 + i)}</span>
              <span className="flex-1">{o[l]}</span>
              {checked && correct.includes(i) && <Check aria-hidden className="size-4 text-success" />}
              {checked && on && !correct.includes(i) && <X aria-hidden className="size-4 text-primary" />}
            </button>
          );
        })}
      </div>
      {multi && !checked && (
        <Button size="sm" variant="blue" arrow={false} className="mt-3" disabled={!picked.length} onClick={() => finish(isRight)}>
          {T(l, "Тексеру", "Проверить")}
        </Button>
      )}
    </div>
  );
}

/* ───────────── Question generator ───────────── */

function QuestionGenerator() {
  const l = useLocale();
  const [subject, setSubject] = useState<QSubject>("history");
  const [topic, setTopic] = useState("all");
  const [qid, setQid] = useState(QUESTIONS[0].id);
  const [round, setRound] = useState(0);
  const [left, setLeft] = useState(PER_TASK);
  const [running, setRunning] = useState(false);
  const [answered, setAnswered] = useState<null | boolean>(null);
  const [showExplain, setShowExplain] = useState(false);
  const [score, setScore] = useState({ right: 0, total: 0 });
  const [sound, setSound] = useState(false);
  const [autoNext, setAutoNext] = useState(false);
  const [notesOn, setNotesOn] = useState(false);
  const [notes, setNotes] = useState("");
  const [q2, setQ2] = useState("");
  const { copied, copy } = useCopyLink();

  const q = QUESTIONS.find((x) => x.id === qid) ?? QUESTIONS[0];

  const load = useCallback((id: string) => {
    setQid(id);
    setRound((r) => r + 1);
    setLeft(PER_TASK);
    setRunning(true);
    setAnswered(null);
    setShowExplain(false);
  }, []);

  const seen = useRef<Set<string>>(new Set());
  const shuffle = useCallback(() => {
    const all = QUESTIONS.filter((x) => x.subject === subject && (topic === "all" || x.topic === topic) && x.id !== qid);
    let pool = all.filter((x) => !seen.current.has(x.id));
    if (!pool.length) {
      // every question in this set has been shown — start a new cycle
      all.forEach((x) => seen.current.delete(x.id));
      pool = all;
    }
    const next = pool[Math.floor(Math.random() * pool.length)] ?? QUESTIONS.find((x) => x.subject === subject)!;
    seen.current.add(next.id);
    load(next.id);
  }, [subject, topic, qid, load]);

  useEffect(() => {
    if (q.subject !== subject || (topic !== "all" && q.topic !== topic)) shuffle();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subject, topic]);

  useEffect(() => {
    if (!running || answered !== null) return;
    const id = setInterval(() => setLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(id);
  }, [running, answered]);

  useEffect(() => {
    if (left === 0 && answered === null) {
      setAnswered(false);
      setScore((s) => ({ ...s, total: s.total + 1 }));
      if (sound) beep(440, 300);
      if (autoNext) setTimeout(shuffle, 1200);
    }
  }, [left, answered, sound, autoNext, shuffle]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("input, textarea, select")) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        shuffle();
      } else if (e.key === " " && e.target === document.body) {
        e.preventDefault();
        setRunning((r) => !r);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shuffle]);

  const onResult = (ok: boolean) => {
    setAnswered(ok);
    setScore((s) => ({ right: s.right + (ok ? 1 : 0), total: s.total + 1 }));
    if (autoNext) setTimeout(shuffle, 1500);
  };

  const topicName = TOPICS[q.subject].find((t) => t.id === q.topic)?.label[l];
  const status = answered === null ? (running ? T(l, "Уақыт жүріп жатыр", "Время идёт") : T(l, "Пауза", "Пауза")) : answered ? T(l, "Дұрыс!", "Верно!") : left === 0 ? T(l, "Уақыт бітті", "Время вышло") : T(l, "Қате", "Ошибка");

  const indexItems = QUESTIONS.filter((x) => !q2 || x.prompt[l].toLowerCase().includes(q2.toLowerCase()));
  const groups = new Map<string, Question[]>();
  indexItems.forEach((x) => {
    const key = `${SUBJECTS[x.subject][l]} · ${TOPICS[x.subject].find((t) => t.id === x.topic)?.label[l]}`;
    groups.set(key, [...(groups.get(key) ?? []), x]);
  });
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  return (
    <>
      <div className="rounded-[24px] bg-card p-5 shadow-soft-ring">
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl label={T(l, "Пән", "Предмет")} value={subject} onChange={(v) => { setSubject(v); setTopic("all"); }} options={SUBJECT_TABS.map((s) => ({ value: s, label: SUBJECTS[s][l] }))} className="no-scrollbar max-w-full overflow-x-auto" />
          <PillSelect label={UI.topic[l]} value={topic} onChange={setTopic} options={[{ value: "all", label: T(l, "Барлық тақырып", "Все темы") }, ...TOPICS[subject].map((t) => ({ value: t.id, label: t.label[l] }))]} />
          <Button variant="dark" onClick={shuffle} arrow={false} icon={<Shuffle className="size-4" aria-hidden />} className="ml-auto">
            {T(l, "Жаңа сұрақ", "Новый вопрос")}
          </Button>
        </div>
        <p className="mt-2 text-right text-[11px] font-semibold text-muted">
          <kbd className="rounded bg-surface px-1">N</kbd> {T(l, "жаңа сұрақ", "новый вопрос")} · <kbd className="rounded bg-surface px-1">Space</kbd> {T(l, "пауза", "пауза")}
        </p>

        <div className="mt-4 grid gap-5 md:grid-cols-[1fr_300px]">
          <div className="rounded-2xl p-5 shadow-[inset_0_0_0_1.5px_var(--ink)]" aria-live="polite">
            <div className="eyebrow border-b border-dashed border-line pb-2 text-muted">
              {SUBJECTS[q.subject][l]} · {topicName} · {TYPE_LABEL[q.type][l]}
            </div>
            {q.context && <p className="mt-4 rounded-xl bg-surface p-3 text-[15px] leading-6 text-body">{q.context[l]}</p>}
            <p className="mt-4 text-[19px] font-extrabold leading-7 text-ink">{q.prompt[l]}</p>
            <AnswerArea key={`${q.id}-${round}`} q={q} onResult={onResult} sound={sound} />
            {(showExplain || answered !== null) && <p className="pop-in mt-4 rounded-xl bg-info-bg p-4 text-[14px] leading-6 text-body">{q.explain[l]}</p>}
            <div className="mt-5 flex flex-wrap gap-4 text-[13px] font-extrabold">
              <button type="button" onClick={() => setShowExplain((s) => !s)} className="min-h-9 text-info-text underline underline-offset-4">
                {T(l, "Түсіндірмені көрсету", "Показать объяснение")}
              </button>
              <button type="button" onClick={() => copy({ share: true })} className="inline-flex min-h-9 items-center gap-1 text-muted hover:text-ink">
                <Share2 className="size-3.5" aria-hidden /> {copied ? UI.copied[l] : UI.share[l]}
              </button>
            </div>
          </div>

          <div className="rounded-[20px] bg-info-bg p-5">
            <div className="flex items-center gap-4">
              <TimerRing left={left} total={PER_TASK} />
              <div>
                <div className="text-[15px] font-extrabold text-ink">{status}</div>
                <p className="mt-1 text-[13px] leading-5 text-muted">{T(l, "ҰБТ-да бір тапсырмаға орта есеппен 2 минут.", "На ЕНТ в среднем 2 минуты на задание.")}</p>
              </div>
            </div>
            <div className="mt-3 text-[13px] font-bold text-ink">
              {T(l, "Нәтиже", "Счёт")}: {score.right} / {score.total}
            </div>
            <div className="mt-3 flex gap-2">
              <Button variant="blue" arrow={false} className="flex-1" onClick={() => (answered !== null ? shuffle() : setRunning((r) => !r))} icon={answered !== null ? <RotateCcw className="size-4" aria-hidden /> : running ? <Pause className="size-4" aria-hidden /> : <Play className="size-4 fill-white" aria-hidden />}>
                {answered !== null ? T(l, "Келесі", "Дальше") : running ? T(l, "Пауза", "Пауза") : T(l, "Бастау", "Старт")}
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <Toggle on={autoNext} onClick={() => setAutoNext((s) => !s)} label={T(l, "Авто-келесі", "Авто-далее")} icon={<SkipForward className="size-3.5" aria-hidden />} />
              <Toggle on={sound} onClick={() => setSound((s) => !s)} label={T(l, "Дыбыс", "Звук")} icon={sound ? <Volume2 className="size-3.5" aria-hidden /> : <VolumeX className="size-3.5" aria-hidden />} />
              <Toggle on={notesOn} onClick={() => setNotesOn((s) => !s)} label={T(l, "Жазба", "Заметки")} icon={<NotebookPen className="size-3.5" aria-hidden />} />
            </div>
            {notesOn && (
              <label className="mt-3 block">
                <span className="sr-only">{T(l, "Жазба", "Заметки")}</span>
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} className="w-full rounded-2xl bg-card p-3 text-[14px] ring-line" placeholder={T(l, "Есептеу, жазбалар…", "Черновик, заметки…")} />
              </label>
            )}
          </div>
        </div>
      </div>

      <section className="mt-14" aria-labelledby="all-q">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <h2 id="all-q" className="text-[24px] text-ink md:text-[28px]">
            {T(l, "Барлық сұрақ", "Все вопросы")}
          </h2>
          <label className="relative block md:w-80">
            <span className="sr-only">{UI.search[l]}</span>
            <Search aria-hidden className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted" />
            <input type="search" value={q2} onChange={(e) => setQ2(e.target.value)} placeholder={UI.search[l]} className="h-11 w-full rounded-full bg-card pl-10 pr-4 text-[14px] font-semibold shadow-soft-ring placeholder:text-muted" />
          </label>
        </div>
        <div className="mt-6 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {[...groups.entries()].map(([g, list]) => {
            const open = expanded[g] || q2.length > 0;
            return (
              <div key={g}>
                <h3 className="text-[14px] font-extrabold text-ink">{g}</h3>
                <ul className="mt-2 space-y-2">
                  {(open ? list : list.slice(0, 3)).map((x) => (
                    <li key={x.id}>
                      <button type="button" onClick={() => { setSubject(x.subject); setTopic("all"); load(x.id); document.getElementById("tool")?.scrollIntoView(); }} className="text-left text-[14px] font-semibold leading-5 text-muted underline-offset-4 hover:text-ink hover:underline">
                        {x.prompt[l]}
                      </button>
                    </li>
                  ))}
                </ul>
                {list.length > 3 && !q2 && (
                  <button type="button" aria-expanded={open} onClick={() => setExpanded((s) => ({ ...s, [g]: !s[g] }))} className="mt-2 min-h-9 text-[13px] font-extrabold text-info-text">
                    {open ? UI.showFewer[l] : `${UI.showAll[l]} (${list.length})`}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>
    </>
  );
}

/* ───────────── Reading literacy drill (exam-paper flavour) ───────────── */

const READING_TIME = 20 * 60; // 10 tasks × 2 min

function ReadingDrill() {
  const l = useLocale();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [left, setLeft] = useState(READING_TIME);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!running || done) return;
    const id = setInterval(() => setLeft((x) => (x <= 1 ? 0 : x - 1)), 1000);
    return () => clearInterval(id);
  }, [running, done]);
  useEffect(() => {
    if (left === 0) setDone(true);
  }, [left]);

  const score = READING_QUESTIONS.reduce((a, q, i) => a + (answers[i] === q.correct ? 1 : 0), 0);
  const reset = () => {
    setAnswers({});
    setLeft(READING_TIME);
    setRunning(false);
    setDone(false);
  };

  return (
    <div className="rounded-[24px] bg-card p-5 shadow-soft-ring">
      <div className="rounded-2xl bg-page p-5 shadow-[inset_0_0_0_1.5px_var(--ink)] md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-line pb-3">
          <span className="eyebrow text-muted">{SUBJECTS.reading[l]} · 10 {T(l, "тапсырма", "заданий")}</span>
          <div className="flex items-center gap-3">
            <span className={cn("font-display text-[20px]", left < 120 ? "text-primary" : "text-ink")} role="timer">
              {mmss(left)}
            </span>
            {!done && (
              <Button size="sm" variant="secondary" arrow={false} onClick={() => setRunning((r) => !r)}>
                {running ? T(l, "Пауза", "Пауза") : T(l, "Бастау", "Начать")}
              </Button>
            )}
          </div>
        </div>
        <h2 className="mt-5 text-[20px] text-ink">{READING_TEXT.title[l]}</h2>
        <p className="mt-3 text-[16px] leading-7 text-body">{READING_TEXT.body[l]}</p>

        <ol className="mt-8 space-y-6">
          {READING_QUESTIONS.map((q, i) => (
            <li key={i}>
              <fieldset>
                <legend className="text-[16px] font-extrabold text-ink">
                  {i + 1}. {q.prompt[l]} <span className="ml-1 rounded-full bg-surface px-2 py-0.5 text-[11px] font-bold text-muted">{READING_TYPE_LABEL[q.type][l]}</span>
                </legend>
                <div className="mt-2 grid gap-1.5">
                  {q.options.map((o, j) => {
                    const on = answers[i] === j;
                    const show = done ? (j === q.correct ? "bg-[#E7F8EF] shadow-[inset_0_0_0_2px_var(--success)]" : on ? "bg-primary-tint shadow-[inset_0_0_0_2px_var(--primary)]" : "opacity-60 ring-line") : on ? "bg-info-bg shadow-[inset_0_0_0_2px_var(--info)]" : "ring-line hover:bg-surface";
                    return (
                      <label key={j} className={cn("flex min-h-10 cursor-pointer items-center gap-3 rounded-xl px-3 py-2 text-[15px] text-ink", show)}>
                        <input
                          type="radio"
                          name={`rq-${i}`}
                          className="accent-[var(--info)]"
                          checked={on}
                          disabled={done}
                          onChange={() => {
                            setAnswers((a) => ({ ...a, [i]: j }));
                            if (!running) setRunning(true);
                          }}
                        />
                        <span className="w-4 font-extrabold text-muted">{String.fromCharCode(65 + j)}</span>
                        {o[l]}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>

        {done ? (
          <div className="pop-in mt-8 rounded-2xl bg-info-bg p-5" role="status">
            <p className="font-display text-[28px] text-ink">{score} / 10</p>
            <p className="mt-1 text-[15px] font-bold text-body">
              {score >= 3 ? T(l, "Пәндік минимум (3 балл) орындалды.", "Минимум по предмету (3 балла) выполнен.") : T(l, "Пәндік минимумға (3 балл) жетпеді.", "Минимум по предмету (3 балла) не набран.")}
            </p>
            <Button className="mt-4" variant="secondary" arrow={false} onClick={reset} icon={<RotateCcw className="size-4" aria-hidden />}>
              {T(l, "Қайта бастау", "Начать заново")}
            </Button>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button variant="blue" onClick={() => setDone(true)} disabled={Object.keys(answers).length === 0}>
              {T(l, "Аяқтау", "Завершить")}
            </Button>
            <span className="text-[13px] font-bold text-muted">
              {Object.keys(answers).length} / 10 {T(l, "жауап берілді", "отвечено")}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function GeneratorTool({ flavour }: { flavour?: "paper" }) {
  return flavour === "paper" ? <ReadingDrill /> : <QuestionGenerator />;
}
