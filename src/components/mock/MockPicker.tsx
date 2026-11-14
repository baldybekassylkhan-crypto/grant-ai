"use client";

import Link from "next/link";
import { Clock, ListChecks } from "lucide-react";
import { useEffect, useState } from "react";
import { PillSelect } from "@/components/ui/client";
import { MOCK_COUNT, MOCK_PAIRS } from "@/content/mock/mocks";
import { pairLabel } from "@/content/unt-config";
import { cn } from "@/lib/cn";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";
import { HISTORY_KEY, MockHistory, type MockHistoryItem } from "./MockRunner";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

export function MockPicker() {
  const l = useLocale();
  const [pair, setPair] = useState("math-physics");
  const [hist, setHist] = useState<MockHistoryItem[]>([]);
  useEffect(() => {
    try {
      setHist(JSON.parse(localStorage.getItem(HISTORY_KEY) || "[]"));
      const q = JSON.parse(localStorage.getItem("grantai:unt-quiz") || "null");
      if (q?.pair && MOCK_PAIRS.some((p) => p.id === q.pair)) setPair(q.pair);
    } catch {}
  }, []);
  const full = pair !== "none";

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-4 rounded-[24px] bg-card p-5 shadow-soft-ring md:flex-row md:items-end md:justify-between">
        <div className="max-w-md flex-1">
          <div className="mb-1.5 text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Бейіндік пәндер", "Профильные предметы")}</div>
          <PillSelect
            label={T(l, "Бейіндік пәндер", "Профильные предметы")}
            value={pair}
            onChange={setPair}
            className="w-full"
            options={[...MOCK_PAIRS.map((p) => ({ value: p.id, label: pairLabel(p.id, l) })), { value: "none", label: T(l, "Тек міндетті бөлім (40 тапсырма)", "Только обязательная часть (40 заданий)") }]}
          />
        </div>
        <div className="flex gap-4 text-[14px] font-bold text-body">
          <span className="inline-flex items-center gap-1.5"><ListChecks className="size-4 text-primary" aria-hidden /> {full ? T(l, "120 тапсырма · 140 балл", "120 заданий · 140 баллов") : T(l, "40 тапсырма · 40 балл", "40 заданий · 40 баллов")}</span>
          <span className="inline-flex items-center gap-1.5"><Clock className="size-4 text-primary" aria-hidden /> {full ? "240 мин" : "80 мин"}</span>
        </div>
      </div>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {Array.from({ length: MOCK_COUNT }, (_, i) => i + 1).map((n) => {
          const best = hist.filter((h) => h.id === n && (h.pair ?? "none") === pair).reduce<number | null>((m, h) => (m === null || h.total > m ? h.total : m), null);
          return (
            <li key={n}>
              <Link href={lp(l, `/mock/${n}?pair=${pair}`)} className={cn("group flex h-full flex-col rounded-[20px] bg-card p-5 shadow-soft-ring transition-transform hover:-translate-y-0.5")}>
                <span className="text-[12px] font-extrabold uppercase tracking-wider text-muted">{T(l, "Нұсқа", "Вариант")}</span>
                <span className="font-display text-[34px] leading-none text-ink">№{n}</span>
                <span className="mt-3 text-[13px] text-muted">{best !== null ? T(l, `Ең жақсы нәтиже: ${best}`, `Лучший результат: ${best}`) : T(l, "Әлі тапсырылмаған", "Ещё не пройден")}</span>
                <span className="mt-4 text-[13px] font-extrabold text-primary-deep group-hover:underline">{T(l, "Бастау →", "Начать →")}</span>
              </Link>
            </li>
          );
        })}
      </ul>

      <section aria-labelledby="hist-h" className="rounded-[24px] bg-card p-6 shadow-soft-ring">
        <h2 id="hist-h" className="text-[20px] text-ink">{T(l, "Менің нәтижелерім", "Мои результаты")}</h2>
        <div className="mt-4">
          <MockHistory />
        </div>
      </section>
    </div>
  );
}
