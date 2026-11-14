"use client";

import { UserRound } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { lp } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

/** Shown instead of login/account pages in the static (no-server) build. */
export function StaticNotice() {
  const l = useLocale();
  const kk = l === "kk";
  return (
    <div className="bg-page px-4 pb-24 pt-10">
      <div className="mx-auto max-w-xl rounded-[24px] bg-card p-8 text-center shadow-soft-ring">
        <UserRound className="mx-auto size-10 text-primary" aria-hidden />
        <h1 className="mt-3 text-[24px] text-ink">{kk ? "Аккаунт бұл нұсқада жоқ" : "Аккаунтов в этой версии нет"}</h1>
        <p className="mt-2 text-muted">
          {kk
            ? "Сайттың бұл нұсқасы серверсіз жұмыс істейді. Жоспарыңыз, прогресіңіз және пробный тест нәтижелері осы браузерде сақталады."
            : "Эта версия сайта работает без сервера. Ваш план, прогресс и результаты пробных тестов сохраняются в этом браузере."}
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button href={lp(l, "/plan")}>{kk ? "Жоспарға өту" : "Перейти к плану"}</Button>
          <Button href={lp(l, "/mock-tests")} variant="secondary">
            {kk ? "Пробный тест" : "Пробный тест"}
          </Button>
        </div>
      </div>
    </div>
  );
}
