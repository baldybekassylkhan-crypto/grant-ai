"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, ClipboardList, LogOut, Target, Trash2, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { MockHistory } from "@/components/mock/MockRunner";
import { Button } from "@/components/ui/Button";
import { KEYS, SYNC_EVENT, logout, useAccount } from "@/lib/account";
import { pairLabel } from "@/content/unt-config";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);
type Plan = Record<string, string | string[] | number>;
type Hist = { total: number; max: number }[];

export function AccountCabinet() {
  const l = useLocale();
  const router = useRouter();
  const { user, loading } = useAccount();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [hist, setHist] = useState<Hist>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    const load = () => {
      try {
        setPlan(JSON.parse(localStorage.getItem(KEYS.plan) || "null"));
        setProgress(JSON.parse(localStorage.getItem(KEYS.progress) || "{}"));
        setHist(JSON.parse(localStorage.getItem(KEYS.history) || "[]"));
      } catch {}
    };
    load();
    window.addEventListener(SYNC_EVENT, load);
    return () => window.removeEventListener(SYNC_EVENT, load);
  }, []);

  if (loading) return <p className="py-20 text-center text-muted">…</p>;

  if (!user)
    return (
      <div className="mx-auto max-w-xl rounded-[24px] bg-card p-8 text-center shadow-soft-ring">
        <UserRound className="mx-auto size-10 text-primary" aria-hidden />
        <h1 className="mt-3 text-[24px] text-ink">{T(l, "Жеке кабинет", "Личный кабинет")}</h1>
        <p className="mt-2 text-muted">{T(l, "Жоспар, прогресс және пробный нәтижелерін барлық құрылғыда сақтау үшін кіріңіз немесе тіркеліңіз.", "Войдите или зарегистрируйтесь, чтобы сохранять план, прогресс и результаты на всех устройствах.")}</p>
        <div className="mt-5 flex justify-center gap-3">
          <Button href={`${lp(l, "/login")}?next=/account`}>{T(l, "Кіру", "Войти")}</Button>
          <Button href={`${lp(l, "/login")}?mode=register&next=/account`} variant="secondary">
            {T(l, "Тіркелу", "Регистрация")}
          </Button>
        </div>
      </div>
    );

  const steps = 4;
  const doneSteps = Object.values(progress).filter(Boolean).length;
  const best = hist.length ? Math.max(...hist.map((h) => h.total)) : null;
  const last = hist.length ? hist[hist.length - 1].total : null;
  const pair = typeof plan?.pair === "string" && plan.pair !== "unsure" ? pairLabel(plan.pair, l) : null;

  const del = async () => {
    await fetch("/api/me", { method: "DELETE" }).catch(() => {});
    await logout();
    router.push(lp(l));
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="eyebrow text-primary-deep">{T(l, "Жеке кабинет", "Личный кабинет")}</p>
          <h1 className="mt-1 text-[28px] leading-tight text-ink md:text-[40px]">{user.name || user.email}</h1>
          <p className="mt-1 text-[14px] text-muted">
            {user.email} · {user.role === "parent" ? T(l, "Ата-ана", "Родитель") : T(l, "Оқушы", "Ученик")}
          </p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          arrow={false}
          icon={<LogOut className="size-4" aria-hidden />}
          onClick={async () => {
            await logout();
            router.push(lp(l));
          }}
        >
          {T(l, "Шығу", "Выйти")}
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: ClipboardList, k: T(l, "Жоспар", "План"), v: plan?.role ? T(l, "Бар", "Есть") : T(l, "Жоқ", "Нет"), sub: pair ?? T(l, "Сауалнамадан өтіңіз", "Пройдите опрос") },
          { icon: Target, k: T(l, "Мақсат", "Цель"), v: plan?.target ? String(plan.target) : "—", sub: plan?.current !== undefined ? T(l, `Қазір: ${plan.current}`, `Сейчас: ${plan.current}`) : "" },
          { icon: CheckCircle2, k: T(l, "Жол картасы", "Дорожная карта"), v: `${doneSteps}/${steps}`, sub: T(l, "орындалған қадам", "шагов выполнено") },
          { icon: Target, k: T(l, "Пробный тесттер", "Пробники"), v: String(hist.length), sub: best !== null ? T(l, `Ең жақсы: ${best} · соңғы: ${last}`, `Лучший: ${best} · последний: ${last}`) : T(l, "Әлі жоқ", "Пока нет") },
        ].map((c) => (
          <div key={c.k} className="rounded-[20px] bg-card p-5 shadow-soft-ring">
            <c.icon aria-hidden className="size-5 text-primary" />
            <div className="mt-2 text-[12px] font-bold text-muted">{c.k}</div>
            <div className="font-display text-[26px] leading-tight text-ink">{c.v}</div>
            <div className="mt-1 text-[13px] text-muted">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button href={lp(l, plan?.role ? "/plan" : "/quiz")}>{plan?.role ? T(l, "Жоспарды ашу", "Открыть план") : T(l, "Жоспар құру", "Составить план")}</Button>
        <Button href={lp(l, "/mock-tests")} variant="secondary">
          {T(l, "Пробный тест", "Пробный тест")}
        </Button>
        <Button href={lp(l, "/guides")} variant="secondary">
          {T(l, "Сабақтар", "Уроки")}
        </Button>
      </div>

      <section className="rounded-[24px] bg-card p-6 shadow-soft-ring">
        <h2 className="text-[20px] text-ink">{T(l, "Пробный тест нәтижелері", "Результаты пробников")}</h2>
        <div className="mt-4">
          <MockHistory />
        </div>
      </section>

      <section className="rounded-[24px] bg-surface p-6">
        <h2 className="text-[18px] text-ink">{T(l, "Аккаунт", "Аккаунт")}</h2>
        <p className="mt-2 text-[14px] text-muted">{T(l, "Деректеріңіз тек жоспарды, прогресті және нәтижелерді сақтау үшін қолданылады.", "Данные используются только для хранения плана, прогресса и результатов.")} <Link href={lp(l, "/privacy")} className="underline">{T(l, "Құпиялылық", "Конфиденциальность")}</Link></p>
        {!confirmDelete ? (
          <button type="button" onClick={() => setConfirmDelete(true)} className="mt-4 inline-flex min-h-10 items-center gap-2 text-[14px] font-bold text-primary-deep">
            <Trash2 className="size-4" aria-hidden /> {T(l, "Аккаунтты жою", "Удалить аккаунт")}
          </button>
        ) : (
          <div className="mt-4 rounded-2xl bg-card p-4 ring-line">
            <p className="text-[14px] font-bold text-ink">{T(l, "Аккаунт пен барлық деректер біржола жойылады. Бұл әрекетті қайтару мүмкін емес.", "Аккаунт и все данные будут удалены навсегда. Это действие нельзя отменить.")}</p>
            <div className="mt-3 flex gap-2">
              <Button size="sm" arrow={false} onClick={del}>
                {T(l, "Иә, жою", "Да, удалить")}
              </Button>
              <Button size="sm" variant="secondary" arrow={false} onClick={() => setConfirmDelete(false)}>
                {T(l, "Болдырмау", "Отмена")}
              </Button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
