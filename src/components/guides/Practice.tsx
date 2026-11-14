"use client";

import Link from "next/link";
import { Check, X } from "lucide-react";
import { useMemo, useState } from "react";
import { QUESTIONS, type QSubject } from "@/content/questions";
import { cn } from "@/lib/cn";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

/** Inline practice inside a lesson: single-choice questions from the bank for one subject/topic. */
export function Practice({ subject, topic, limit = 5 }: { subject: QSubject; topic?: string; limit?: number }) {
  const l = useLocale();
  const qs = useMemo(() => QUESTIONS.filter((q) => q.subject === subject && (!topic || q.topic === topic) && q.type !== "matching" && q.type !== "multi").slice(0, limit), [subject, topic, limit]);
  const [picked, setPicked] = useState<Record<string, number>>({});
  if (!qs.length) return null;
  const done = Object.keys(picked).length;
  const right = qs.filter((q) => q.correct?.includes(picked[q.id])).length;
  return (
    <section className="mt-10 rounded-[24px] bg-surface p-5 ring-line-15 md:p-6" aria-label={T(l, "Жаттығу", "Практика")}>
      <p className="eyebrow text-info-text">{T(l, "Өзіңізді тексеріңіз", "Проверьте себя")}</p>
      <ol className="mt-4 space-y-6">
        {qs.map((q, n) => {
          const p = picked[q.id];
          const answered = p !== undefined;
          return (
            <li key={q.id}>
              {q.context && <p className="mb-2 rounded-xl bg-card p-3 text-[15px] text-body">{q.context[l]}</p>}
              <p className="text-[16px] font-extrabold text-ink">
                {n + 1}. {q.prompt[l]}
              </p>
              <div className="mt-2 grid gap-1.5">
                {q.options?.map((o, i) => {
                  const correct = q.correct?.includes(i);
                  const state = !answered ? "bg-card ring-line hover:bg-info-bg" : correct ? "bg-[#E7F8EF] shadow-[inset_0_0_0_2px_var(--success)]" : p === i ? "bg-primary-tint shadow-[inset_0_0_0_2px_var(--primary)]" : "bg-card opacity-60 ring-line";
                  return (
                    <button key={i} type="button" disabled={answered} onClick={() => setPicked((x) => ({ ...x, [q.id]: i }))} className={cn("flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-left text-[15px] text-ink", state)}>
                      <span className="w-5 font-extrabold text-muted">{String.fromCharCode(65 + i)}</span>
                      <span className="flex-1">{o[l]}</span>
                      {answered && correct && <Check className="size-4 text-success" aria-hidden />}
                      {answered && p === i && !correct && <X className="size-4 text-primary" aria-hidden />}
                    </button>
                  );
                })}
              </div>
              {answered && <p className="pop-in mt-2 text-[14px] leading-6 text-body">{q.explain[l]}</p>}
            </li>
          );
        })}
      </ol>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
        <span className="text-[14px] font-extrabold text-ink" aria-live="polite">
          {done ? T(l, `Нәтиже: ${right} / ${qs.length}`, `Результат: ${right} / ${qs.length}`) : T(l, `${qs.length} сұрақ`, `${qs.length} вопросов`)}
        </span>
        <Link href={lp(l, "/tools/question-generator")} className="text-[14px] font-extrabold text-info-text underline underline-offset-4">
          {T(l, "Көбірек жаттығу →", "Больше практики →")}
        </Link>
      </div>
    </section>
  );
}
