"use client";

/**
 * «Базар күні» — maths-literacy game. The player is a market seller and must TYPE the exact amount
 * (change, unit price, discount, profit…). Random clicking cannot score: 3 wrong answers close the stall.
 * Every order's answer is computed from the numbers shown, so it is correct by construction.
 */
import { RotateCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { beep, mmss } from "@/components/tools/hooks";
import { UI } from "@/content/ui";
import { cn } from "@/lib/cn";
import type { L, Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";
import { StartScreen, type Difficulty } from "./AppFrame";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);
const both = (x: string): L => ({ kk: x, ru: x });
const s = (kk: string, ru: string): L => ({ kk, ru });
const rnd = (a: number, b: number) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = <X,>(a: X[]) => a[Math.floor(Math.random() * a.length)];
const tg = (n: number) => n.toLocaleString("ru-RU").replace(/ /g, " ");
const dec = (n: number) => String(n).replace(".", ",");

type Order = { who: string; text: L; answer: number; how: L };

const GOODS: { kk: string; ru: string; price: [number, number] }[] = [
  { kk: "алма", ru: "яблоки", price: [35, 70] },
  { kk: "қызанақ", ru: "помидоры", price: [40, 90] },
  { kk: "картоп", ru: "картофель", price: [15, 30] },
  { kk: "қара өрік", ru: "чернослив", price: [120, 250] },
  { kk: "ірімшік", ru: "сыр", price: [250, 400] },
  { kk: "жүзім", ru: "виноград", price: [60, 120] },
  { kk: "сәбіз", ru: "морковь", price: [15, 35] },
  { kk: "күріш", ru: "рис", price: [45, 80] },
];
const FACES = ["👵", "👨‍🦱", "👩", "🧑‍🎓", "👨‍🍳", "👧", "🧔", "👩‍🦳"];
const BILLS = [1000, 2000, 5000, 10000, 20000];

function makeOrder(level: number): Order {
  const g = pickOne(GOODS);
  const price = rnd(g.price[0], g.price[1]) * 10;
  const who = pickOne(FACES);
  const kinds = level === 1 ? [0, 1, 2, 3] : level === 2 ? [0, 1, 2, 3, 4, 5, 6] : [2, 4, 5, 6, 7, 8, 9];
  switch (pickOne(kinds)) {
    case 0: {
      const q = rnd(2, 5), total = q * price, bill = BILLS.find((b) => b > total)!;
      const how = both(`${q} × ${tg(price)} = ${tg(total)}; ${tg(bill)} − ${tg(total)} = ${tg(bill - total)} ₸`);
      return { who, answer: bill - total, how, text: s(`${q} кг ${g.kk} алайын. 1 кг — ${tg(price)} ₸. Міне, ${tg(bill)} ₸. Қайтарымы қанша?`, `Дайте ${q} кг, ${g.ru}. 1 кг — ${tg(price)} ₸. Вот ${tg(bill)} ₸. Сколько сдачи?`) };
    }
    case 1: {
      const g2 = pickOne(GOODS.filter((x) => x !== g)), p2 = rnd(g2.price[0], g2.price[1]) * 10, a = rnd(1, 4), b = rnd(1, 4), t = a * price + b * p2;
      return { who, answer: t, how: both(`${a} · ${tg(price)} + ${b} · ${tg(p2)} = ${tg(t)} ₸`), text: s(`${a} кг ${g.kk} (1 кг — ${tg(price)} ₸) және ${b} кг ${g2.kk} (1 кг — ${tg(p2)} ₸). Барлығы қанша?`, `${a} кг — ${g.ru} (1 кг — ${tg(price)} ₸) и ${b} кг — ${g2.ru} (1 кг — ${tg(p2)} ₸). Сколько всего?`) };
    }
    case 2: {
      const n = rnd(3, 6), pack = n * price;
      return { who, answer: price, how: both(`${tg(pack)} : ${n} = ${tg(price)} ₸`), text: s(`${n} кг ${g.kk} ${tg(pack)} ₸ тұрады. 1 кг бағасы қанша?`, `${n} кг — ${g.ru} — стоят ${tg(pack)} ₸. Сколько стоит 1 кг?`) };
    }
    case 3: {
      const budget = pickOne([1000, 2000, 3000, 5000]), n = Math.floor(budget / price);
      if (n < 1) return makeOrder(level);
      return { who, answer: n, how: both(`${tg(budget)} : ${tg(price)} ≈ ${dec(Math.floor((budget / price) * 100) / 100)} → ${n}`), text: s(`Менде ${tg(budget)} ₸ бар. 1 кг ${g.kk} — ${tg(price)} ₸. Ең көбі неше бүтін кг аламын?`, `У меня ${tg(budget)} ₸. 1 кг — ${g.ru} — ${tg(price)} ₸. Сколько максимум целых кг куплю?`) };
    }
    case 4: {
      const p = pickOne([10, 20, 25, 50]), base = pickOne([2000, 4000, 6000, 8000, 12000]), r = (base * (100 - p)) / 100;
      return { who, answer: r, how: both(`${tg(base)} × ${dec((100 - p) / 100)} = ${tg(r)} ₸`), text: s(`Бүгін бәріне ${p}% жеңілдік! Тауар ${tg(base)} ₸ еді. Енді қанша?`, `Сегодня скидка ${p}% на всё! Товар стоил ${tg(base)} ₸. Сколько теперь?`) };
    }
    case 5: {
      const gr = pickOne([250, 500, 750, 1500]), r = (price * gr) / 1000;
      if (!Number.isInteger(r)) return makeOrder(level);
      return { who, answer: r, how: both(`${gr} г = ${dec(gr / 1000)} кг; ${tg(price)} × ${dec(gr / 1000)} = ${tg(r)} ₸`), text: s(`${gr} г ${g.kk} өлшеп беріңізші. 1 кг — ${tg(price)} ₸. Қанша төлеймін?`, `Взвесьте ${gr} г — ${g.ru}. 1 кг — ${tg(price)} ₸. Сколько платить?`) };
    }
    case 6: {
      const n = pickOne([2, 3, 4, 5]), each = rnd(8, 30) * 100, t = n * each;
      return { who, answer: each, how: both(`${tg(t)} : ${n} = ${tg(each)} ₸`), text: s(`Біз ${n} доспыз, барлығы ${tg(t)} ₸. Әрқайсымыз қанша төлейміз?`, `Нас ${n} друзей, всего ${tg(t)} ₸. Сколько платит каждый?`) };
    }
    case 7: {
      const n = rnd(2, 6) * 10, buy = rnd(10, 40) * 10, sell = buy + rnd(3, 15) * 10, pr = n * (sell - buy);
      return { who: "📦", answer: pr, how: both(`${n} × (${tg(sell)} − ${tg(buy)}) = ${tg(pr)} ₸`), text: s(`Көтерме: ${n} дана тауарды ${tg(buy)} ₸-ден алып, ${tg(sell)} ₸-ден саттыңыз. Пайда қанша?`, `Опт: вы купили ${n} шт. по ${tg(buy)} ₸ и продали по ${tg(sell)} ₸. Какая прибыль?`) };
    }
    case 8: {
      const base = pickOne([5000, 10000, 20000]), r = (base * 81) / 100;
      return { who, answer: r, how: s(`${tg(base)} × 0,9 × 0,9 = ${tg(r)} ₸ (20% емес!)`, `${tg(base)} × 0,9 × 0,9 = ${tg(r)} ₸ (не 20%!)`), text: s(`Кеше ${tg(base)} ₸ тұрған затқа 10% жеңілдік болды, бүгін тағы 10%. Қазір бағасы қанша?`, `Вчера на вещь за ${tg(base)} ₸ была скидка 10%, сегодня ещё 10%. Сколько она стоит сейчас?`) };
    }
    default: {
      const was = pickOne([200, 400, 500, 800]), p = pickOne([10, 20, 25, 50]), now = (was * (100 + p)) / 100;
      return { who: "📈", answer: p, how: both(`(${tg(now)} − ${tg(was)}) : ${tg(was)} × 100% = ${p}%`), text: s(`1 кг ${g.kk} бағасы ${tg(was)} ₸-ден ${tg(now)} ₸-ге көтерілді. Неше пайызға өсті?`, `Цена 1 кг (${g.ru}) выросла с ${tg(was)} ₸ до ${tg(now)} ₸. На сколько процентов?`) };
    }
  }
}

export function Bazar({ sound }: { sound: boolean }) {
  const l = useLocale();
  const [screen, setScreen] = useState<"start" | "play" | "end">("start");
  const [diff, setDiff] = useState("2");
  const [dayLen, setDayLen] = useState("10");
  const [order, setOrder] = useState<Order | null>(null);
  const [val, setVal] = useState("");
  const [lives, setLives] = useState(3);
  const [served, setServed] = useState(0);
  const [coins, setCoins] = useState(0);
  const [streak, setStreak] = useState(0);
  const [best, setBest] = useState(0);
  const [left, setLeft] = useState(30);
  const [feedback, setFeedback] = useState<null | { ok: boolean; order: Order; given: string }>(null);
  const [mistakes, setMistakes] = useState<{ order: Order; given: string }[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const level = Number(diff);
  const perOrder = level === 1 ? 45 : level === 2 ? 35 : 30;
  const total = Number(dayLen);

  const nextOrder = useCallback(() => {
    setOrder(makeOrder(level));
    setVal("");
    setLeft(perOrder);
    setFeedback(null);
    setTimeout(() => inputRef.current?.focus(), 30);
  }, [level, perOrder]);

  const resolve = useCallback(
    (given: string) => {
      if (!order || feedback) return;
      const num = Number(given.replace(/\s/g, "").replace(",", "."));
      const ok = given.trim() !== "" && num === order.answer;
      setFeedback({ ok, order, given });
      setServed((x) => x + 1);
      if (ok) {
        const st = streak + 1;
        setStreak(st);
        setBest((b) => Math.max(b, st));
        setCoins((c) => c + 10 + left + (st >= 3 ? 10 : 0));
        if (sound) beep(880, 80);
      } else {
        setStreak(0);
        setLives((x) => x - 1);
        setMistakes((m) => [...m, { order, given }]);
        if (sound) beep(200, 160);
      }
    },
    [order, feedback, streak, left, sound],
  );

  useEffect(() => {
    if (screen !== "play" || feedback) return;
    const id = setInterval(() => setLeft((x) => (x <= 1 ? 0 : x - 1)), 1000);
    return () => clearInterval(id);
  }, [screen, feedback]);
  useEffect(() => {
    if (screen === "play" && left === 0 && !feedback) resolve("");
  }, [left, screen, feedback, resolve]);

  const over = lives <= 0 || served >= total;
  const proceed = () => (over ? setScreen("end") : nextOrder());

  const start = () => {
    setLives(3);
    setServed(0);
    setCoins(0);
    setStreak(0);
    setBest(0);
    setMistakes([]);
    setScreen("play");
    nextOrder();
  };

  const DIFF: Difficulty[] = [
    { id: "1", name: T(l, "Дүкенші", "Продавец"), level: "45 с", text: T(l, "Қайтарым, баға, саны", "Сдача, цена, количество"), bar: 33, color: "#12B76A" },
    { id: "2", name: T(l, "Базаршы", "Торговец"), level: "35 с", text: T(l, "+ жеңілдік, грамм, бөлу", "+ скидки, граммы, деление"), bar: 66, color: "#F3B105" },
    { id: "3", name: T(l, "Көпес", "Купец"), level: "30 с", text: T(l, "+ пайда, қос жеңілдік, өсім %", "+ прибыль, двойная скидка, рост %"), bar: 100, color: "#FF4B3C" },
  ];

  if (screen === "start")
    return (
      <StartScreen
        title={T(l, "Базар күні", "Базарный день")}
        instruction={T(l, "Сіз — базардағы сатушысыз. Әр сатып алушыға нақты соманы жазыңыз: қайтарым, баға, жеңілдік. Кездейсоқ басу көмектеспейді — 3 қатеден кейін базар жабылады.", "Вы — продавец на базаре. Каждому покупателю впишите точную сумму: сдачу, цену, скидку. Случайные нажатия не помогут — после 3 ошибок базар закрывается.")}
        theme="warm"
        difficulties={DIFF}
        difficulty={diff}
        setDifficulty={setDiff}
        topics={[
          { id: "10", label: T(l, "10 сатып алушы", "10 покупателей") },
          { id: "15", label: T(l, "15 сатып алушы", "15 покупателей") },
          { id: "20", label: T(l, "20 сатып алушы", "20 покупателей") },
        ]}
        topic={dayLen}
        setTopic={setDayLen}
        onPlay={start}
      />
    );

  if (screen === "end")
    return (
      <div className="mx-auto flex h-full max-w-[560px] flex-col items-center justify-center overflow-y-auto text-center">
        <p className="eyebrow text-[#5B6576]">{lives <= 0 ? T(l, "Базар жабылды", "Базар закрылся") : T(l, "Базар күні аяқталды!", "Базарный день окончен!")}</p>
        <p className="mt-2 font-display text-[56px] leading-none">🪙 {coins}</p>
        <p className="mt-2 text-[15px] text-[#5B6576]">
          {T(l, "Дұрыс", "Верно")}: {served - mistakes.length}/{served} · {T(l, "ең ұзын серия", "лучшая серия")}: {best}
        </p>
        {mistakes.length > 0 && (
          <div className="mt-5 w-full rounded-2xl bg-white/85 p-4 text-left">
            <p className="text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#5B6576]">{T(l, "Қателер талдауы", "Разбор ошибок")}</p>
            <ul className="mt-2 space-y-2 text-[14px] text-[#030A19]">
              {mistakes.map((m, i) => (
                <li key={i} className="border-t border-black/5 pt-2 first:border-0 first:pt-0">
                  <p>{m.order.text[l]}</p>
                  <p className="mt-0.5 text-[13px]">
                    <span className="text-[#C82E1E]">{m.given.trim() ? `${T(l, "Сіз", "Вы")}: ${m.given}` : T(l, "Уақыт бітті", "Время вышло")}</span> · <strong>{m.order.how[l]}</strong>
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button type="button" onClick={() => setScreen("start")} className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#030A19] px-6 text-[13px] font-extrabold uppercase tracking-[0.08em] text-white">
          <RotateCcw className="size-4" aria-hidden /> {UI.playAgain[l]}
        </button>
      </div>
    );

  const hearts = Math.max(lives, 0);
  return (
    <div className="mx-auto flex h-full max-w-[560px] flex-col">
      <div className="flex w-full items-center justify-between pr-12 text-[13px] font-extrabold text-[#5B6576]">
        <span aria-label={`${T(l, "Өмір", "Жизни")}: ${hearts}`}>{"❤️".repeat(hearts)}{"🤍".repeat(3 - hearts)}</span>
        <span>
          🪙 {coins} · {Math.min(served + (feedback ? 0 : 1), total)}/{total}
        </span>
        <span className={cn("font-display text-[18px]", left <= 8 ? "text-[#C82E1E]" : "text-[#030A19]")} role="timer">
          {mmss(left)}
        </span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
        <div className="h-full rounded-full bg-[#F3B105] transition-[width] duration-1000 ease-linear" style={{ width: `${(left / perOrder) * 100}%` }} />
      </div>
      {order && (
        <div className="mt-5 flex flex-1 flex-col">
          <div className="flex items-start gap-3">
            <span className="text-[44px] leading-none" aria-hidden>
              {order.who}
            </span>
            <div className="flex-1 rounded-[22px] rounded-tl-md bg-white/90 p-4 text-[17px] font-semibold leading-7 text-[#030A19] shadow-soft" aria-live="polite">
              {order.text[l]}
            </div>
          </div>
          {!feedback ? (
            <form
              className="mt-6 flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (val.trim()) resolve(val);
              }}
            >
              <label className="sr-only" htmlFor="bazar-answer">
                {T(l, "Жауап", "Ответ")}
              </label>
              <input
                id="bazar-answer"
                ref={inputRef}
                value={val}
                onChange={(e) => setVal(e.target.value.replace(/[^\d\s,.]/g, ""))}
                inputMode="decimal"
                autoComplete="off"
                placeholder={T(l, "Соманы жазыңыз", "Введите число")}
                className="min-h-14 min-w-0 flex-1 rounded-2xl bg-white px-4 font-display text-[24px] text-[#030A19] outline-none ring-2 ring-transparent focus:ring-[#F3B105]"
              />
              <button type="submit" disabled={!val.trim()} className="min-h-14 rounded-2xl bg-[#030A19] px-5 text-[14px] font-extrabold uppercase tracking-[0.06em] text-white disabled:opacity-40">
                {T(l, "Беру", "Отдать")}
              </button>
            </form>
          ) : (
            <div className={cn("pop-in mt-6 rounded-2xl p-4 text-[15px]", feedback.ok ? "bg-[#E7F8EF] text-[#0A6B3E]" : "bg-[#FFECE9] text-[#9A2214]")}>
              <p className="font-extrabold">
                {feedback.ok ? T(l, "Рақмет! Дәл өзі.", "Спасибо! Всё точно.") : feedback.given.trim() ? T(l, "Сатып алушы ренжіді — сома қате.", "Покупатель недоволен — сумма неверная.") : T(l, "Сатып алушы күтпей кетіп қалды.", "Покупатель ушёл, не дождавшись.")}
              </p>
              <p className="mt-1">{feedback.order.how[l]}</p>
              <button type="button" autoFocus onClick={proceed} className="mt-3 min-h-11 rounded-full bg-[#030A19] px-5 text-[13px] font-extrabold uppercase tracking-[0.08em] text-white">
                {over ? T(l, "Нәтиже", "Результат") : T(l, "Келесі сатып алушы", "Следующий покупатель")}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
