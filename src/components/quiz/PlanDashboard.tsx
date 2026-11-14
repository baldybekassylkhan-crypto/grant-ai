"use client";

import Link from "next/link";
import { CalendarDays, CheckCircle2, Info, Mail, Target } from "lucide-react";
import { useEffect, useState } from "react";
import { ReachList } from "@/components/tools/Reach";
import { MockHistory } from "@/components/mock/MockRunner";
import { SYNC_EVENT, pushToAccount, useAccount } from "@/lib/account";
import { Button } from "@/components/ui/Button";
import { SESSION_LABEL, SUBJECTS, THRESHOLDS, pairLabel, type SessionId } from "@/content/unt-config";
import { cn } from "@/lib/cn";
import { lp, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

type Answers = Record<string, string | string[] | number>;
const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);

export function PlanDashboard() {
  const l = useLocale();
  const account = useAccount();
  const [a, setA] = useState<Answers | null>(null);
  const [mail, setMail] = useState<{ email: string; ok: boolean; reason: string | null } | null>(null);

  const [done, setDone] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      const d = new URLSearchParams(window.location.search).get("d");
      if (d) {
        // restore from the emailed link and keep it on this device
        const json = decodeURIComponent(escape(atob(d.replace(/-/g, "+").replace(/_/g, "/"))));
        const restored = JSON.parse(json);
        if (restored && typeof restored === "object") {
          localStorage.setItem("grantai:unt-quiz", JSON.stringify(restored));
          pushToAccount({ plan: restored });
        }
        window.history.replaceState(null, "", window.location.pathname);
        window.dispatchEvent(new Event("grantai:plan"));
      }
    } catch {}
    try {
      setA(JSON.parse(localStorage.getItem("grantai:unt-quiz") || "null"));
      setMail(JSON.parse(sessionStorage.getItem("grantai:plan-email") || "null"));
      setDone(JSON.parse(localStorage.getItem("grantai:plan-progress") || "{}"));
    } catch {
      setA(null);
    }
  }, []);

  useEffect(() => {
    const reload = () => {
      try {
        setA(JSON.parse(localStorage.getItem("grantai:unt-quiz") || "null"));
        setDone(JSON.parse(localStorage.getItem("grantai:plan-progress") || "{}"));
      } catch {}
    };
    window.addEventListener(SYNC_EVENT, reload);
    return () => window.removeEventListener(SYNC_EVENT, reload);
  }, []);

  const toggle = (k: string) =>
    setDone((d) => {
      const n = { ...d, [k]: !d[k] };
      try {
        localStorage.setItem("grantai:plan-progress", JSON.stringify(n));
      } catch {}
      pushToAccount({ progress: n });
      return n;
    });

  const shareLink = async () => {
    if (!a) return;
    const json = JSON.stringify(a);
    const d = btoa(unescape(encodeURIComponent(json))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/${l}/plan?d=${d}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  if (a === null || !a.role)
    return (
      <div className="mx-auto max-w-xl rounded-[24px] bg-card p-8 text-center shadow-soft-ring">
        <h1 className="text-[24px] text-ink">{T(l, "Жоспар әлі жоқ", "Плана пока нет")}</h1>
        <p className="mt-2 text-muted">{T(l, "15 қысқа сұраққа жауап беріп, жеке жоспар алыңыз.", "Ответьте на 15 коротких вопросов и получите личный план.")}</p>
        <Button href={lp(l, "/quiz")} size="lg" className="mt-5">
          {T(l, "Сауалнаманы бастау", "Начать опрос")}
        </Button>
      </div>
    );

  const parent = a.role === "parent";
  const signedIn = !!account.user;
  const cur = Number(a.current ?? 0);
  const tgt = Number(a.target ?? 0);
  const gap = Math.max(0, tgt - cur);
  const th = THRESHOLDS.value.find((t) => t.id === a.field);
  const pair = typeof a.pair === "string" && a.pair !== "unsure" ? a.pair : null;
  const weekly = Number(a.hours ?? 2) * 7;
  const weak = (Array.isArray(a.weak) ? a.weak : []) as string[];
  const testDate = typeof a.date === "string" && a.date !== "none" ? new Date(a.date) : null;
  const days = testDate ? Math.max(0, Math.ceil((testDate.getTime() - Date.now()) / 86_400_000)) : null;
  const session = typeof a.session === "string" && a.session in SESSION_LABEL ? SESSION_LABEL[a.session as SessionId][l] : T(l, "Сессия таңдалмаған", "Сессия не выбрана");

  const parts = [
    { id: "history", name: SUBJECTS.history[l], w: 20 },
    { id: "mathlit", name: SUBJECTS.mathlit[l], w: 10 },
    { id: "reading", name: SUBJECTS.reading[l], w: 10 },
    { id: "p1", name: pair ? pairLabel(pair, l).split(" — ")[0] : T(l, "1-бейіндік пән", "1-й профильный"), w: 50 },
    { id: "p2", name: pair ? pairLabel(pair, l).split(" — ")[1] ?? "" : T(l, "2-бейіндік пән", "2-й профильный"), w: 50 },
  ].map((p) => ({ ...p, w: p.w * (weak.includes(p.id) ? 1.5 : 1) }));
  const totalW = parts.reduce((s, p) => s + p.w, 0);

  const weeks = [
    { t: T(l, "1-апта · Диагностика", "Неделя 1 · Диагностика"), d: T(l, "Толық форматтағы пробный тест (120 тапсырма, 240 минут). Қателер журналын бастаңыз.", "Пробный тест в полном формате (120 заданий, 240 минут). Заведите журнал ошибок.") },
    { t: T(l, "2–3-апта · Әлсіз пәндер", "Недели 2–3 · Слабые предметы"), d: T(l, "Күн сайын генератордан 20 сұрақ: ең әлсіз пәннен бастаңыз. 2 балдық тапсырмаларды бөлек жаттықтырыңыз.", "Каждый день 20 вопросов в генераторе, начиная с самого слабого предмета. Отдельно тренируйте 2-балльные задания.") },
    { t: T(l, "4-апта · Сауаттылықтар", "Неделя 4 · Грамотности"), d: T(l, "Оқу сауаттылығы жаттығуы (10 сұрақ, 20 минут) және «Дұрыс па?» ойыны — минимум 3 балды қамтамасыз етіңіз.", "Тренажёр чтения (10 вопросов, 20 минут) и игра «Верно?» — закрепите минимум в 3 балла.") },
    { t: T(l, "Әр 2 апта · Пробный", "Каждые 2 недели · Пробник"), d: T(l, "Толық пробный тест және нәтижені калькуляторға енгізу — қай ЖОО-ға жететініңізді бақылаңыз.", "Полный пробник и ввод результата в калькулятор — следите, куда вы проходите.") },
  ];

  return (
    <div className="space-y-8">
      {mail && (
        <div role="status" className={cn("flex items-start gap-3 rounded-2xl p-4 text-[15px]", mail.ok ? "bg-[#E7F8EF] text-[#0A6B3E]" : "bg-info-bg text-info-text")}>
          {mail.ok ? <Mail className="mt-0.5 size-5 shrink-0" aria-hidden /> : <Info className="mt-0.5 size-5 shrink-0" aria-hidden />}
          <p className="font-bold">
            {mail.ok
              ? T(l, `Жоспар ${mail.email} поштасына жіберілді. Хат келмесе, «Спам» бумасын тексеріңіз.`, `План отправлен на ${mail.email}. Если письма нет — проверьте «Спам».`)
              : T(l, "Хат жіберу сервисі әлі қосылмаған, сондықтан хат жіберілмеді. Жоспарыңыз осы бетте және браузерде сақталды.", "Сервис отправки писем ещё не подключён, поэтому письмо не отправлено. План сохранён на этой странице и в браузере.")}
          </p>
        </div>
      )}

      <header>
        <p className="eyebrow text-primary-deep">{parent ? T(l, "Ата-анаға арналған жоспар", "План для родителя") : T(l, "Жеке жоспар", "Личный план")}</p>
        <h1 className="mt-1 text-[28px] leading-tight text-ink md:text-[40px]">{parent ? T(l, "Балаңыздың ҰБТ-ға дайындық жоспары", "План подготовки ребёнка к ЕНТ") : T(l, "Сіздің ҰБТ-ға дайындық жоспарыңыз", "Ваш план подготовки к ЕНТ")}</h1>
        <p className="mt-2 text-[14px] text-muted">
          {signedIn
            ? T(l, `Жоспар, прогресс және пробный нәтижелері ${account.user!.email} аккаунтында сақталады — кез келген құрылғыдан кіріп жалғастыра аласыз.`, `План, прогресс и результаты пробников сохраняются в аккаунте ${account.user!.email} — продолжайте с любого устройства.`)
            : T(l, "Жоспар әзірге тек осы құрылғыда сақталған. Барлық құрылғыда сақталуы үшін аккаунт ашыңыз.", "Сейчас план сохранён только на этом устройстве. Чтобы сохранить на всех устройствах, создайте аккаунт.")}
          {!signedIn && (
            <>
              {" "}
              <Link href={`${lp(l, "/login")}?mode=register&next=/plan`} className="font-extrabold text-primary-deep underline underline-offset-4">
                {T(l, "Тіркелу →", "Зарегистрироваться →")}
              </Link>
            </>
          )}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 print:hidden">
          <Button size="sm" variant="secondary" arrow={false} onClick={shareLink}>
            {copied ? T(l, "Сілтеме көшірілді", "Ссылка скопирована") : T(l, "Жоспар сілтемесін көшіру", "Скопировать ссылку на план")}
          </Button>
          <Button size="sm" variant="secondary" arrow={false} onClick={() => window.print()}>
            {T(l, "Басып шығару / PDF", "Печать / PDF")}
          </Button>
          <Button size="sm" href={lp(l, "/mock-tests")}>{T(l, "Пробный тест тапсыру", "Пройти пробный тест")}</Button>
        </div>
      </header>

      <section className="rounded-[24px] bg-card p-6 shadow-soft-ring">
        <h2 className="text-[20px] text-ink">{T(l, "Пробный тест нәтижелері", "Результаты пробников")}</h2>
        <div className="mt-4">
          <MockHistory />
        </div>
      </section>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { icon: Target, k: T(l, "Қазір → мақсат", "Сейчас → цель"), v: `${cur} → ${tgt}`, sub: gap ? T(l, `+${gap} балл керек`, `нужно +${gap}`) : T(l, "Мақсатқа жеттіңіз!", "Цель достигнута!") },
          { icon: CheckCircle2, k: T(l, "Шекті балл", "Порог"), v: th ? String(th.score) : "—", sub: th ? `${th.label[l]}${cur >= th.score ? " ✓" : ` · −${th.score - cur}`}` : "" },
          { icon: CalendarDays, k: T(l, "Тестке дейін", "До теста"), v: days !== null ? `${days} ${T(l, "күн", "дн.")}` : "—", sub: days !== null ? session : `${session} · ${T(l, "2027 күндері әлі жарияланбаған", "даты 2027 ещё не объявлены")}` },
          { icon: CalendarDays, k: T(l, "Аптасына", "В неделю"), v: `${weekly} ${T(l, "сағ", "ч")}`, sub: pair ? pairLabel(pair, l) : T(l, "Пәндер таңдалмаған", "Предметы не выбраны") },
        ].map((c) => (
          <div key={c.k} className="rounded-[20px] bg-card p-5 shadow-soft-ring">
            <c.icon aria-hidden className="size-5 text-primary" />
            <div className="mt-2 text-[12px] font-bold text-muted">{c.k}</div>
            <div className="font-display text-[26px] leading-tight text-ink">{c.v}</div>
            <div className="mt-1 text-[13px] text-muted">{c.sub}</div>
          </div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-[24px] bg-card p-6 shadow-soft-ring">
          <h2 className="text-[20px] text-ink">{T(l, "Апталық кесте", "Расписание на неделю")}</h2>
          <p className="mt-1 text-[13px] text-muted">{T(l, "Пәндердің балына қарай бөлінген; әлсіз пәндерге ×1,5 уақыт қосылды.", "Распределено по весу предметов; слабым предметам добавлено ×1,5 времени.")}</p>
          <ul className="mt-4 space-y-3">
            {parts.map((p) => {
              const h = (weekly * p.w) / totalW;
              return (
                <li key={p.id}>
                  <div className="flex justify-between text-[14px]">
                    <span className="font-bold text-ink">
                      {p.name} {weak.includes(p.id) && <span className="ml-1 rounded-full bg-primary-tint-2 px-2 py-0.5 text-[11px] font-extrabold text-primary-nav">{T(l, "әлсіз", "слабый")}</span>}
                    </span>
                    <span className="font-extrabold text-ink">
                      {h.toFixed(1)} {T(l, "сағ", "ч")}
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-line">
                    <div className="h-2 rounded-full bg-primary" style={{ width: `${(p.w / totalW) * 100}%` }} />
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="rounded-[24px] bg-card p-6 shadow-soft-ring">
          <h2 className="text-[20px] text-ink">{T(l, "Жол картасы", "Дорожная карта")}</h2>
          <p className="mt-1 text-[13px] text-muted">
            {T(l, "Орындалған қадамды басып белгілеңіз — прогресс сақталады.", "Отмечайте выполненные шаги — прогресс сохраняется.")} {Object.values(done).filter(Boolean).length}/{weeks.length}
          </p>
          <ol className="mt-4 space-y-4">
            {weeks.map((w, i) => {
              const k = `w${i}`;
              return (
                <li key={i}>
                  <label className="flex cursor-pointer gap-3">
                    <input type="checkbox" checked={!!done[k]} onChange={() => toggle(k)} className="sr-only" />
                    <span aria-hidden className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full font-display text-[14px] text-white", done[k] ? "bg-success" : "bg-primary")}>{done[k] ? <CheckCircle2 className="size-4" /> : i + 1}</span>
                    <span>
                      <span className={cn("block text-[15px] font-extrabold", done[k] ? "text-muted line-through" : "text-ink")}>{w.t}</span>
                      <span className="block text-[14px] leading-6 text-body">{w.d}</span>
                    </span>
                  </label>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      <div className="-mt-2">
        <p className="text-[15px] font-bold text-muted">{T(l, `Төмендегі тізім — мақсатты ${tgt} балмен`, `Список ниже — для целевого балла ${tgt}`)}</p>
        <ReachList score={tgt} pair={pair} rural={false} />
      </div>

      <section aria-labelledby="next-h">
        <h2 id="next-h" className="text-[22px] text-ink md:text-[26px]">{T(l, "Бүгін бастаңыз", "Начните сегодня")}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { href: "/tools/question-generator", t: T(l, "Сұрақ генераторы", "Генератор вопросов"), d: T(l, "7 пән, 140+ сұрақ", "7 предметов, 140+ вопросов") },
            { href: "/tools/reading-drill", t: T(l, "Оқу сауаттылығы", "Грамотность чтения"), d: T(l, "10 сұрақ · 20 минут", "10 вопросов · 20 минут") },
            { href: "/games/hronologiya", t: T(l, "Хронология", "Хронология"), d: T(l, "Тарих күндерін ретімен қою", "Даты истории по порядку") },
            { href: "/universities", t: T(l, "Университеттер", "Вузы"), d: T(l, "125 ЖОО, грант балдары", "125 вузов, проходные баллы") },
          ].map((c) => (
            <Link key={c.href} href={lp(l, c.href)} className="group rounded-[20px] bg-card p-5 shadow-soft-ring transition-transform hover:-translate-y-0.5">
              <p className="font-display text-[17px] text-ink">{c.t}</p>
              <p className="mt-1 text-[14px] text-muted">{c.d}</p>
              <p className="mt-3 text-[13px] font-extrabold text-primary-deep group-hover:underline">{T(l, "Ашу →", "Открыть →")}</p>
            </Link>
          ))}
        </div>
      </section>

      <p className="text-center text-[13px]">
        <Link href={lp(l, "/quiz")} className="font-bold text-muted underline underline-offset-4">
          {T(l, "Жауаптарды өзгерту", "Изменить ответы")}
        </Link>
      </p>
    </div>
  );
}
