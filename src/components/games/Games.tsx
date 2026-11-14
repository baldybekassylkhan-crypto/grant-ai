"use client";

import { Check, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { beep, mmss } from "@/components/tools/hooks";
import { gameBySlug, type GameSlug } from "@/content/games";
import { UI } from "@/content/ui";
import { cn } from "@/lib/cn";
import type { L, Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";
import { AppFrame, StartScreen, type Difficulty } from "./AppFrame";
import { Bazar } from "./Bazar";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);
const s = (kk: string, ru = kk): L => ({ kk, ru });
const shuffle = <X,>(a: X[]) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

function Again({ onClick, dark }: { onClick: () => void; dark?: boolean }) {
  const l = useLocale();
  return (
    <button type="button" onClick={onClick} className={cn("inline-flex min-h-11 items-center gap-2 rounded-full px-6 text-[13px] font-extrabold uppercase tracking-[0.08em]", dark ? "bg-white text-[#030A19]" : "bg-[#030A19] text-white")}>
      <RotateCcw className="size-4" aria-hidden /> {UI.playAgain[l]}
    </button>
  );
}

/* ═════════════ 1. Хронология — order events in time ═════════════ */

type Ev = { year: number; label: L; era: "ancient" | "khanate" | "c19" | "c20" | "independence" | "world" };
const yearText = (y: number, l: Locale) => (y < 0 ? `${T(l, "б.з.д.", "до н. э.")} ${-y}` : String(y));
/** Verified dates (see history questions for sources/notes). */
const EVENTS: Ev[] = [
  { year: 552, label: s("Түрік қағанатының құрылуы", "Образование Тюркского каганата"), era: "ancient" },
  { year: 1219, label: s("Отырардың моңғолдарға қарсы қорғанысы", "Оборона Отрара от монголов"), era: "ancient" },
  { year: 1428, label: s("Әбілқайыр хандығының құрылуы", "Образование ханства Абулхаира"), era: "khanate" },
  { year: 1465, label: s("Қазақ хандығының құрылуы", "Образование Казахского ханства"), era: "khanate" },
  { year: 1711, label: s("Абылайдың дүниеге келуі", "Рождение Абылая"), era: "khanate" },
  { year: 1723, label: s("«Ақтабан шұбырынды» басталды", "Начало «Актабан шубырынды»"), era: "khanate" },
  { year: 1731, label: s("Кіші жүздің Ресей бодандығын қабылдауы", "Младший жуз принимает российское подданство"), era: "khanate" },
  { year: 1771, label: s("Абылайдың үш жүздің ханы болып сайлануы", "Абылай избран ханом трёх жузов"), era: "khanate" },
  { year: 1783, label: s("Сырым Датұлы көтерілісінің басталуы", "Начало восстания Сырыма Датова"), era: "c19" },
  { year: 1822, label: s("«Сібір қырғыздары туралы жарғы»", "«Устав о сибирских киргизах»"), era: "c19" },
  { year: 1836, label: s("Исатай мен Махамбет көтерілісінің басталуы", "Начало восстания Исатая и Махамбета"), era: "c19" },
  { year: 1837, label: s("Кенесары көтерілісінің басталуы", "Начало восстания Кенесары"), era: "c19" },
  { year: 1845, label: s("Абай Құнанбайұлының дүниеге келуі", "Рождение Абая Кунанбаева"), era: "c19" },
  { year: 1864, label: s("Ы. Алтынсарин Торғайда мектеп ашты", "И. Алтынсарин открыл школу в Тургае"), era: "c19" },
  { year: 1913, label: s("«Қазақ» газетінің шығуы", "Выход газеты «Казах»"), era: "c20" },
  { year: 1916, label: s("Ұлт-азаттық көтеріліс", "Национально-освободительное восстание"), era: "c20" },
  { year: 1917, label: s("Алаш автономиясының жариялануы", "Провозглашение автономии Алаш"), era: "c20" },
  { year: 1920, label: s("Қазақ (Қырғыз) АКСР-інің құрылуы", "Образование Казахской (Киргизской) АССР"), era: "c20" },
  { year: 1936, label: s("Қазақ КСР-інің құрылуы", "Образование Казахской ССР"), era: "c20" },
  { year: 1954, label: s("Тың игерудің басталуы", "Начало освоения целины"), era: "c20" },
  { year: 1961, label: s("Байқоңырдан алғашқы адамның ғарышқа ұшуы", "Первый полёт человека в космос с Байконура"), era: "c20" },
  { year: 1986, label: s("Желтоқсан оқиғасы", "Декабрьские события"), era: "c20" },
  { year: 1991, label: s("Тәуелсіздік туралы Конституциялық заң", "Конституционный закон о независимости"), era: "independence" },
  { year: 1992, label: s("Қазақстанның БҰҰ-ға кіруі", "Вступление Казахстана в ООН"), era: "independence" },
  { year: 1993, label: s("Ұлттық валюта — теңгенің енгізілуі", "Введение национальной валюты — тенге"), era: "independence" },
  { year: 1995, label: s("Қолданыстағы Конституцияның қабылдануы", "Принятие Конституции 1995 года"), era: "independence" },
  { year: 1997, label: s("Елорданың Ақмолаға көшірілуі", "Перенос столицы в Акмолу"), era: "independence" },
  { year: 2006, label: s("«Менің Қазақстаным» әнұран болып бекітілді", "«Менің Қазақстаным» утверждён гимном"), era: "independence" },
  { year: 1729, label: s("Аңырақай шайқасы", "Анракайская битва"), era: "khanate" },
  { year: 1868, label: s("Дала облыстарын басқару туралы уақытша ереже", "Временное положение об управлении степными областями"), era: "c19" },
  { year: 1949, label: s("Семей полигонындағы алғашқы ядролық сынақ", "Первое ядерное испытание на Семипалатинском полигоне"), era: "c20" },
  { year: 1989, label: s("«Невада–Семей» қозғалысының құрылуы", "Создание движения «Невада–Семипалатинск»"), era: "c20" },
  { year: 1998, label: s("Ақмола Астана болып өзгертілді", "Акмола переименована в Астану"), era: "independence" },
  { year: 2017, label: s("Латын әліпбиіне көшу туралы Жарлық", "Указ о переходе на латинский алфавит"), era: "independence" },
  { year: -490, label: s("Марафон шайқасы", "Марафонская битва"), era: "world" },
  { year: -27, label: s("Октавиан Август — Рим империясының басы", "Октавиан Август — начало Римской империи"), era: "world" },
  { year: 476, label: s("Батыс Рим империясының құлауы", "Падение Западной Римской империи"), era: "world" },
  { year: 1096, label: s("Бірінші крест жорығы", "Первый крестовый поход"), era: "world" },
  { year: 1215, label: s("Ұлы бостандықтар хартиясы", "Великая хартия вольностей"), era: "world" },
  { year: 1453, label: s("Константинопольдің құлауы", "Падение Константинополя"), era: "world" },
  { year: 1492, label: s("Колумб Америкаға жетті", "Колумб достиг Америки"), era: "world" },
  { year: 1517, label: s("Лютердің 95 тезисі", "95 тезисов Лютера"), era: "world" },
  { year: 1776, label: s("АҚШ Тәуелсіздік декларациясы", "Декларация независимости США"), era: "world" },
  { year: 1789, label: s("Француз революциясы", "Французская революция"), era: "world" },
  { year: 1815, label: s("Ватерлоо шайқасы", "Битва при Ватерлоо"), era: "world" },
  { year: 1914, label: s("Бірінші дүниежүзілік соғыстың басталуы", "Начало Первой мировой войны"), era: "world" },
  { year: 1939, label: s("Екінші дүниежүзілік соғыстың басталуы", "Начало Второй мировой войны"), era: "world" },
  { year: 1945, label: s("БҰҰ-ның құрылуы", "Создание ООН"), era: "world" },
  { year: 1957, label: s("Алғашқы жасанды Жер серігі ұшырылды", "Запущен первый искусственный спутник Земли"), era: "world" },
  { year: 1969, label: s("Адамның Айға алғаш қонуы", "Первая высадка человека на Луну"), era: "world" },
  { year: 1990, label: s("Германияның бірігуі", "Объединение Германии"), era: "world" },
];

function Chronology({ sound }: { sound: boolean }) {
  const l = useLocale();
  const [screen, setScreen] = useState<"start" | "play" | "end">("start");
  const [diff, setDiff] = useState("mid");
  const [era, setEra] = useState("all");
  const [round, setRound] = useState(0);
  const [cards, setCards] = useState<Ev[]>([]);
  const [picked, setPicked] = useState<number[]>([]);
  const [checked, setChecked] = useState(false);
  const [score, setScore] = useState(0);
  const used = useRef<Set<string>>(new Set());
  const ROUNDS = 5;
  const size = diff === "easy" ? 3 : diff === "mid" ? 4 : 5;

  const DIFF: Difficulty[] = [
    { id: "easy", name: T(l, "Жеңіл", "Легко"), level: "3", text: T(l, "3 оқиға", "3 события"), bar: 33, color: "#12B76A" },
    { id: "mid", name: T(l, "Стандарт", "Стандарт"), level: "4", text: T(l, "4 оқиға", "4 события"), bar: 66, color: "#F3B105" },
    { id: "hard", name: T(l, "Сарапшы", "Эксперт"), level: "5", text: T(l, "5 оқиға", "5 событий"), bar: 100, color: "#FF4B3C" },
  ];

  const deal = useCallback(() => {
    const pool = EVENTS.filter((e) => (era === "mixed" ? true : era === "all" ? e.era !== "world" : e.era === era || (era === "khanate" && e.era === "ancient")));
    let fresh = pool.filter((e) => !used.current.has(e.label.kk));
    if (fresh.length < size) {
      used.current.clear();
      fresh = pool;
    }
    // one event per year in a hand, so the order is never ambiguous
    const hand: Ev[] = [];
    for (const e of shuffle(fresh)) {
      if (hand.length >= size) break;
      if (!hand.some((h) => h.year === e.year)) hand.push(e);
    }
    hand.forEach((e) => used.current.add(e.label.kk));
    setCards(hand);
    setPicked([]);
    setChecked(false);
  }, [era, size]);

  const start = () => {
    used.current.clear();
    setRound(0);
    setScore(0);
    deal();
    setScreen("play");
  };

  const sorted = useMemo(() => [...cards].sort((a, b) => a.year - b.year), [cards]);
  const tap = (i: number) => {
    if (checked || picked.includes(i)) return;
    const next = [...picked, i];
    setPicked(next);
    if (next.length === cards.length) {
      setChecked(true);
      const correct = next.filter((idx, pos) => cards[idx].year === sorted[pos].year).length;
      setScore((x) => x + correct);
      if (sound) beep(correct === cards.length ? 880 : 330);
    }
  };
  const next = () => {
    if (round + 1 >= ROUNDS) setScreen("end");
    else {
      setRound(round + 1);
      deal();
    }
  };

  if (screen === "start")
    return (
      <StartScreen
        title={T(l, "Хронология", "Хронология")}
        instruction={T(l, "Оқиғаларды ең ертесінен бастап ретімен басыңыз. 5 раунд.", "Нажимайте события по порядку — от самого раннего. 5 раундов.")}
        theme="dark"
        difficulties={DIFF}
        difficulty={diff}
        setDifficulty={setDiff}
        topics={[
          { id: "all", label: T(l, "Барлық кезең", "Все эпохи") },
          { id: "khanate", label: T(l, "Ежелгі дәуір — XVIII ғ.", "Древность — XVIII в.") },
          { id: "c19", label: T(l, "XVIII–XIX ғ.", "XVIII–XIX вв.") },
          { id: "c20", label: T(l, "XX ғасыр", "XX век") },
          { id: "independence", label: T(l, "Тәуелсіздік", "Независимость") },
          { id: "world", label: T(l, "Дүниежүзі тарихы", "Всемирная история") },
          { id: "mixed", label: T(l, "Қазақстан + әлем", "Казахстан + мир") },
        ]}
        topic={era}
        setTopic={setEra}
        onPlay={start}
      />
    );

  if (screen === "end") {
    const max = ROUNDS * size;
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="eyebrow text-white/60">{T(l, "Нәтиже", "Результат")}</p>
        <p className="mt-2 font-display text-[64px] leading-none">
          {score}
          <span className="text-[28px] text-white/50"> / {max}</span>
        </p>
        <p className="mt-3 text-[15px] text-white/75">{T(l, "орнында тұрған оқиға", "событий на своём месте")}</p>
        <div className="mt-6">
          <Again dark onClick={() => setScreen("start")} />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-full max-w-[640px] flex-col">
      <div className="flex items-center justify-between pr-12 text-[13px] font-extrabold text-white/80">
        <span>
          {T(l, "Раунд", "Раунд")} {round + 1}/{ROUNDS}
        </span>
        <span>
          {T(l, "Ұпай", "Очки")} {score}
        </span>
      </div>
      <p className="mt-3 text-center text-[14px] text-white/70">{checked ? T(l, "Дұрыс реті:", "Правильный порядок:") : T(l, "Ең ерте оқиғадан бастап басыңыз", "Нажмите самое раннее событие")}</p>
      <div className="relative mt-4 flex-1">
        {!checked ? (
          <ul className="grid gap-2.5">
            {cards.map((c, i) => {
              const pos = picked.indexOf(i);
              return (
                <li key={c.label.kk}>
                  <button type="button" onClick={() => tap(i)} disabled={pos >= 0} className={cn("flex min-h-12 w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-[15px] font-semibold transition-colors", pos >= 0 ? "bg-white/25" : "bg-white/10 hover:bg-white/20")}>
                    <span className={cn("inline-flex size-8 shrink-0 items-center justify-center rounded-full font-display text-[14px]", pos >= 0 ? "bg-success text-white" : "bg-white/10 text-white/50")}>{pos >= 0 ? pos + 1 : "?"}</span>
                    {c.label[l]}
                  </button>
                </li>
              );
            })}
          </ul>
        ) : (
          <ol className="relative ml-4 border-l-2 border-white/20 pl-6" aria-live="polite">
            {sorted.map((c, pos) => {
              const ok = cards[picked[pos]].year === c.year;
              return (
                <li key={c.label.kk} className="pop-in relative mb-3">
                  <span className={cn("absolute -left-[35px] top-1 inline-flex size-6 items-center justify-center rounded-full", ok ? "bg-success" : "bg-primary")}>{ok ? <Check className="size-3.5" /> : <X className="size-3.5" />}</span>
                  <span className="font-display text-[20px] text-star">{yearText(c.year, l)}</span>
                  <span className="ml-2 text-[15px]">{c.label[l]}</span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
      {checked && (
        <button type="button" onClick={next} className="mt-3 min-h-11 self-center rounded-full bg-white px-6 text-[13px] font-extrabold uppercase tracking-[0.08em] text-[#030A19]">
          {round + 1 >= ROUNDS ? T(l, "Нәтиже", "Результат") : T(l, "Келесі раунд", "Следующий раунд")}
        </button>
      )}
    </div>
  );
}

/* ═════════════ 2. Жұп тап — memory match ═════════════ */

const SETS: Record<string, { name: L; pairs: [L, L][] }> = {
  history: {
    name: s("Тарих: жыл ↔ оқиға", "История: год ↔ событие"),
    pairs: [
      [s("1465"), s("Қазақ хандығы", "Казахское ханство")],
      [s("1723"), s("Ақтабан шұбырынды", "Актабан шубырынды")],
      [s("1916"), s("Ұлт-азаттық көтеріліс", "Нац.-освободительное восстание")],
      [s("1917"), s("Алаш автономиясы", "Автономия Алаш")],
      [s("1986"), s("Желтоқсан оқиғасы", "Желтоқсан")],
      [s("1991"), s("Тәуелсіздік", "Независимость")],
      [s("1993"), s("Теңге енгізілді", "Введён тенге")],
      [s("1995"), s("Конституция", "Конституция")],
    ],
  },
  literature: {
    name: s("Әдебиет: автор ↔ шығарма", "Литература: автор ↔ произведение"),
    pairs: [
      [s("Абай", "Абай"), s("«Қара сөздер»", "«Слова назидания»")],
      [s("М. Әуезов", "М. Ауэзов"), s("«Абай жолы»", "«Путь Абая»")],
      [s("А. Байтұрсынұлы", "А. Байтурсынов"), s("«Маса»", "«Маса»")],
      [s("М. Дулатұлы", "М. Дулатов"), s("«Оян, қазақ!»", "«Оян, казах!»")],
      [s("М. Жұмабаев", "М. Жумабаев"), s("«Батыр Баян»", "«Батыр Баян»")],
      [s("Махмұд Қашқари", "Махмуд Кашгари"), s("«Диуани лұғат ат-түрк»", "«Диван лугат ат-турк»")],
      [s("Ж. Баласағұни", "Ю. Баласагуни"), s("«Құтадғу біліг»", "«Кутадгу билиг»")],
      [s("Ы. Алтынсарин", "И. Алтынсарин"), s("«Қазақ хрестоматиясы»", "«Киргизская хрестоматия»")],
    ],
  },
  physics: {
    name: s("Физика: шама ↔ бірлік", "Физика: величина ↔ единица"),
    pairs: [
      [s("Күш", "Сила"), s("Ньютон")],
      [s("Жұмыс", "Работа"), s("Джоуль")],
      [s("Қуат", "Мощность"), s("Ватт")],
      [s("Қысым", "Давление"), s("Паскаль")],
      [s("Кедергі", "Сопротивление"), s("Ом")],
      [s("Жиілік", "Частота"), s("Герц")],
      [s("Ток күші", "Сила тока"), s("Ампер")],
      [s("Кернеу", "Напряжение"), s("Вольт")],
    ],
  },
  chemistry: {
    name: s("Химия: элемент ↔ таңба", "Химия: элемент ↔ символ"),
    pairs: [
      [s("Темір", "Железо"), s("Fe")],
      [s("Натрий", "Натрий"), s("Na")],
      [s("Калий", "Калий"), s("K")],
      [s("Мыс", "Медь"), s("Cu")],
      [s("Күміс", "Серебро"), s("Ag")],
      [s("Алтын", "Золото"), s("Au")],
      [s("Сынап", "Ртуть"), s("Hg")],
      [s("Қорғасын", "Свинец"), s("Pb")],
    ],
  },
  math: {
    name: s("Математика: атауы ↔ формула", "Математика: название ↔ формула"),
    pairs: [
      [s("Шеңбер ауданы", "Площадь круга"), s("πr²")],
      [s("Пифагор теоремасы", "Теорема Пифагора"), s("a² + b² = c²")],
      [s("Дискриминант", "Дискриминант"), s("b² − 4ac")],
      [s("Қосынды квадраты", "Квадрат суммы"), s("a² + 2ab + b²")],
      [s("Арифм. прогрессия aₙ", "Арифм. прогрессия aₙ"), s("a₁ + (n − 1)d")],
      [s("Үшбұрыш ауданы", "Площадь треугольника"), s("½ · a · h")],
      [s("Негізгі тригоном. тепе-теңдік", "Основное тригоном. тождество"), s("sin²x + cos²x = 1")],
      [s("Геом. прогрессия bₙ", "Геом. прогрессия bₙ"), s("b₁ · qⁿ⁻¹")],
    ],
  },
  informatics: {
    name: s("Информатика: екілік ↔ ондық", "Информатика: двоичное ↔ десятичное"),
    pairs: [
      [s("1010₂"), s("10")],
      [s("1111₂"), s("15")],
      [s("10000₂"), s("16")],
      [s("111₂"), s("7")],
      [s("11001₂"), s("25")],
      [s("FF₁₆"), s("255")],
      [s("1 байт"), s("8 бит")],
      [s("1 Кбайт"), s("1024 байт")],
    ],
  },
  english: {
    name: s("Ағылшын: V1 ↔ V2", "Английский: V1 ↔ V2"),
    pairs: [
      [s("go"), s("went")],
      [s("see"), s("saw")],
      [s("take"), s("took")],
      [s("write"), s("wrote")],
      [s("buy"), s("bought")],
      [s("teach"), s("taught")],
      [s("begin"), s("began")],
      [s("speak"), s("spoke")],
    ],
  },
  geography: {
    name: s("География: ел ↔ астана", "География: страна ↔ столица"),
    pairs: [
      [s("Түркия", "Турция"), s("Анкара")],
      [s("Канада"), s("Оттава")],
      [s("Аустралия", "Австралия"), s("Канберра")],
      [s("Бразилия"), s("Бразилиа")],
      [s("Жапония", "Япония"), s("Токио")],
      [s("Египет"), s("Каир")],
      [s("Үндістан", "Индия"), s("Нью-Дели")],
      [s("Өзбекстан", "Узбекистан"), s("Ташкент")],
    ],
  },
  worldhistory: {
    name: s("Дүниежүзі тарихы: жыл ↔ оқиға", "Всемирная история: год ↔ событие"),
    pairs: [
      [s("476"), s("Батыс Римнің құлауы", "Падение Западного Рима")],
      [s("1453"), s("Константинопольдің құлауы", "Падение Константинополя")],
      [s("1492"), s("Колумб Америкада", "Колумб в Америке")],
      [s("1517"), s("Реформация басы", "Начало Реформации")],
      [s("1789"), s("Француз революциясы", "Французская революция")],
      [s("1914"), s("I дүниежүзілік соғыс", "Первая мировая война")],
      [s("1945"), s("БҰҰ құрылды", "Создана ООН")],
      [s("1969"), s("Айға қону", "Высадка на Луну")],
    ],
  },
  biology: {
    name: s("Биология: құрылым ↔ қызметі", "Биология: структура ↔ функция"),
    pairs: [
      [s("Эритроцит"), s("O₂ тасымалдау", "Перенос O₂")],
      [s("Лейкоцит"), s("Иммунитет")],
      [s("Тромбоцит"), s("Қан ұюы", "Свёртывание крови")],
      [s("Альвеола"), s("Газ алмасу", "Газообмен")],
      [s("Нефрон"), s("Зәр түзу", "Образование мочи")],
      [s("Хлоропласт"), s("Фотосинтез")],
      [s("Митохондрия"), s("АТФ синтезі", "Синтез АТФ")],
      [s("Инсулин"), s("Қантты төмендетеді", "Снижает сахар")],
    ],
  },
  russianlit: {
    name: s("Орыс әдебиеті: автор ↔ шығарма", "Русская литература: автор ↔ произведение"),
    pairs: [
      [s("Пушкин"), s("«Евгений Онегин»")],
      [s("Лермонтов"), s("«Герой нашего времени»")],
      [s("Гоголь"), s("«Мёртвые души»")],
      [s("Тургенев"), s("«Отцы и дети»")],
      [s("Достоевский"), s("«Преступление и наказание»")],
      [s("Л. Толстой"), s("«Война и мир»")],
      [s("Чехов"), s("«Вишнёвый сад»")],
      [s("Булгаков"), s("«Мастер и Маргарита»")],
    ],
  },
};

type Card = { id: number; pair: number; text: string; side: 0 | 1 };

function MemoryMatch({ sound }: { sound: boolean }) {
  const l = useLocale();
  const [screen, setScreen] = useState<"start" | "play" | "end">("start");
  const [diff, setDiff] = useState("6");
  const [set, setSet] = useState("history");
  const [cards, setCards] = useState<Card[]>([]);
  const [open, setOpen] = useState<number[]>([]);
  const [done, setDone] = useState<Set<number>>(new Set());
  const [moves, setMoves] = useState(0);
  const [secs, setSecs] = useState(0);
  const n = Number(diff);

  useEffect(() => {
    if (screen !== "play") return;
    const id = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [screen]);

  const DIFF: Difficulty[] = [
    { id: "4", name: T(l, "Жеңіл", "Легко"), level: "4×2", text: T(l, "4 жұп", "4 пары"), bar: 33, color: "#12B76A" },
    { id: "6", name: T(l, "Стандарт", "Стандарт"), level: "6×2", text: T(l, "6 жұп", "6 пар"), bar: 66, color: "#135EF2" },
    { id: "8", name: T(l, "Сарапшы", "Эксперт"), level: "8×2", text: T(l, "8 жұп", "8 пар"), bar: 100, color: "#FF4B3C" },
  ];

  const start = () => {
    const pairs = shuffle(SETS[set].pairs).slice(0, n);
    const deck: Card[] = shuffle(pairs.flatMap((p, i) => [{ id: i * 2, pair: i, text: p[0][l], side: 0 as const }, { id: i * 2 + 1, pair: i, text: p[1][l], side: 1 as const }]));
    setCards(deck);
    setOpen([]);
    setDone(new Set());
    setMoves(0);
    setSecs(0);
    setScreen("play");
  };

  const openRef = useRef<number[]>([]);
  useEffect(() => {
    openRef.current = open;
  }, [open]);
  const flip = (idx: number) => {
    const cur = openRef.current;
    if (cur.length === 2 || cur.includes(idx) || done.has(cards[idx].pair)) return;
    const next = [...cur, idx];
    openRef.current = next;
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [a, b] = next.map((i) => cards[i]);
      if (a.pair === b.pair) {
        if (sound) beep(880);
        const nd = new Set(done).add(a.pair);
        setTimeout(() => {
          setDone(nd);
          setOpen([]);
          if (nd.size === n) setScreen("end");
        }, 450);
      } else {
        if (sound) beep(220);
        setTimeout(() => setOpen([]), 900);
      }
    }
  };

  if (screen === "start")
    return (
      <StartScreen
        title={T(l, "Жұп тап", "Найди пару")}
        instruction={T(l, "Екі карточканы ашып, сәйкес жұпты табыңыз. Барлық жұпты аз жүріспен табыңыз.", "Открывайте по две карточки и находите пары. Найдите все за минимум ходов.")}
        theme="light"
        difficulties={DIFF}
        difficulty={diff}
        setDifficulty={setDiff}
        topics={Object.entries(SETS).map(([k, v]) => ({ id: k, label: v.name[l] }))}
        topic={set}
        setTopic={setSet}
        onPlay={start}
      />
    );

  if (screen === "end")
    return (
      <div className="flex h-full flex-col items-center justify-center text-center">
        <p className="eyebrow text-muted">{T(l, "Барлық жұп табылды!", "Все пары найдены!")}</p>
        <p className="mt-2 font-display text-[44px] leading-none">
          {moves} {T(l, "жүріс", "ходов")}
        </p>
        <p className="mt-2 text-[15px] text-muted">
          {T(l, "Уақыт", "Время")}: {mmss(secs)} · {T(l, "Ең жақсы нәтиже", "Идеал")}: {n} {T(l, "жүріс", "ходов")}
        </p>
        <div className="mt-6">
          <Again onClick={() => setScreen("start")} />
        </div>
      </div>
    );

  return (
    <div className="mx-auto flex h-full max-w-[720px] flex-col">
      <div className="flex items-center justify-between pr-12 text-[13px] font-extrabold text-muted">
        <span>{SETS[set].name[l]}</span>
        <span>
          {moves} {T(l, "жүріс", "ходов")} · {mmss(secs)}
        </span>
      </div>
      <ul className={cn("mt-4 grid flex-1 content-center gap-2.5", n <= 4 ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-3 sm:grid-cols-4")}>
        {cards.map((c, i) => {
          const shown = open.includes(i) || done.has(c.pair);
          const matched = done.has(c.pair);
          return (
            <li key={c.id} className="[perspective:800px]">
              <button
                type="button"
                onClick={() => flip(i)}
                aria-label={shown ? c.text : T(l, "Жабық карточка", "Закрытая карточка")}
                className={cn("relative h-20 w-full rounded-2xl transition-transform duration-300 [transform-style:preserve-3d] sm:h-24", shown && "[transform:rotateY(180deg)]")}
              >
                <span className="absolute inset-0 flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#135EF2,#049AEE)] text-[22px] font-display text-white [backface-visibility:hidden]">?</span>
                <span className={cn("absolute inset-0 flex items-center justify-center rounded-2xl p-2 text-center text-[13px] font-extrabold leading-tight [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-[14px]", matched ? "bg-[#E7F8EF] text-[#0A8A50] ring-2 ring-[#12B76A]" : c.side === 0 ? "bg-white text-ink ring-line" : "bg-[#FFF4D9] text-ink ring-line")}>
                  {c.text}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function GameApp({ slug }: { slug: GameSlug }) {
  const l = useLocale();
  const g = gameBySlug(slug)!;
  const [sound, setSound] = useState(false);
  return (
    <AppFrame title={g.title[l]} dot={g.dot} theme={g.theme} sound={sound} onSound={() => setSound((x) => !x)}>
      {slug === "hronologiya" && <Chronology sound={sound} />}
      {slug === "zhup-tap" && <MemoryMatch sound={sound} />}
      {slug === "bazar" && <Bazar sound={sound} />}
    </AppFrame>
  );
}
