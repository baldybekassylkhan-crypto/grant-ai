/**
 * Seeded generators for computational subjects. Every answer is computed from the generated
 * parameters, so correctness is guaranteed by construction. The same seed always yields the same test.
 */
import type { L } from "@/lib/i18n";

export type MockType = "single" | "multi" | "matching" | "context";
export type MockQ = {
  id: string;
  type: MockType;
  points: 1 | 2;
  context?: L;
  prompt: L;
  options?: L[];
  correct?: number[];
  pairs?: { left: L; right: L }[];
  explain?: L;
  /** Topic id used for weak-topic analysis (history period, maths-literacy topic, reading skill, or profile task type). */
  topic?: string;
};

/* ───────── RNG helpers ───────── */
export function rng(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
type R = () => number;
export const int = (r: R, a: number, b: number) => a + Math.floor(r() * (b - a + 1));
export const pick = <X,>(r: R, arr: readonly X[]) => arr[Math.floor(r() * arr.length)];
export const shuffled = <X,>(r: R, arr: readonly X[]) => {
  const b = [...arr];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};
const s = (kk: string, ru = kk): L => ({ kk, ru });
const num = (n: number) => (Number.isInteger(n) ? String(n) : String(Math.round(n * 100) / 100).replace(".", ","));
const sp = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

/** Build a numeric single-choice question with unique distractors around the correct value. */
function numeric(r: R, correct: number, count: number, steps: number[], unit = ""): { options: L[]; correct: number[] } {
  const set = new Set<number>([correct]);
  let guard = 0;
  while (set.size < count && guard++ < 200) {
    const d = pick(r, steps) * (r() < 0.5 ? -1 : 1) * int(r, 1, 3);
    const v = Math.round((correct + d) * 100) / 100;
    if (v !== correct && (correct < 0 || v >= 0)) set.add(v);
  }
  let k = 1;
  while (set.size < count) set.add(correct + 1000 * k++);
  const vals = shuffled(r, [...set]);
  return { options: vals.map((v) => s(`${Number.isInteger(v) ? sp(v) : num(v)}${unit}`)), correct: [vals.indexOf(correct)] };
}
/** Single choice from string options (first = correct). */
function choice(r: R, correct: L, wrong: L[]): { options: L[]; correct: number[] } {
  const all = shuffled(r, [correct, ...wrong]);
  return { options: all, correct: [all.indexOf(correct)] };
}

/* ═════════ Mathematical literacy (10 tasks, 5 options) ═════════ */
export function genMathLit(seed: number): MockQ[] {
  const r = rng(seed);
  const T: (() => MockQ)[] = [
    () => {
      const p = pick(r, [10, 15, 20, 25, 30, 40]), price = int(r, 4, 30) * 1000, ans = price * (1 - p / 100);
      const o = numeric(r, ans, 5, [500, 1000, 250], " ₸");
      return { id: "", type: "single", points: 1, prompt: s(`${sp(price)} ₸ тұратын тауарға ${p}% жеңілдік жасалды. Жаңа баға:`, `На товар за ${sp(price)} ₸ сделали скидку ${p}%. Новая цена:`), ...o, explain: s(`${sp(price)} × ${1 - p / 100} = ${sp(ans)} ₸`) };
    },
    () => {
      const unit = int(r, 2, 9) * 50, a = int(r, 2, 5), b = int(r, 6, 12), ans = unit * b;
      const o = numeric(r, ans, 5, [unit, 50, 100], " ₸");
      return { id: "", type: "single", points: 1, prompt: s(`${a} дәптер ${sp(unit * a)} ₸ тұрады. ${b} дәптер қанша тұрады?`, `${a} тетради стоят ${sp(unit * a)} ₸. Сколько стоят ${b} тетрадей?`), ...o, explain: s(`1 дәптер = ${unit} ₸; ${b} × ${unit} = ${sp(ans)} ₸`, `1 тетрадь = ${unit} ₸; ${b} × ${unit} = ${sp(ans)} ₸`) };
    },
    () => {
      const v = pick(r, [40, 50, 60, 70, 80, 90]), t = pick(r, [1.5, 2, 2.5, 3, 3.5, 4]), d = v * t;
      const o = numeric(r, d, 5, [10, 20, 30], " км");
      return { id: "", type: "single", points: 1, prompt: s(`Көлік ${v} км/сағ жылдамдықпен ${num(t)} сағат жүрді. Жүрген жолы:`, `Машина ехала ${num(t)} ч со скоростью ${v} км/ч. Пройденный путь:`), ...o, explain: s(`${v} × ${num(t)} = ${d} км`) };
    },
    () => {
      const n = 5, vals = Array.from({ length: n }, () => int(r, 2, 5)), sum = vals.reduce((a, b) => a + b, 0);
      const fix = (5 - (sum % 5)) % 5; vals[0] += fix > 3 ? fix - 5 : fix; vals[0] = Math.min(5, Math.max(1, vals[0]));
      const total = vals.reduce((a, b) => a + b, 0); const avg = total / n;
      const o = numeric(r, avg, 5, [0.2, 0.4, 0.6]);
      return { id: "", type: "single", points: 1, prompt: s(`Оқушының бағалары: ${vals.join(", ")}. Орташа баға:`, `Оценки ученика: ${vals.join(", ")}. Средняя оценка:`), ...o, explain: s(`${total} : ${n} = ${num(avg)}`) };
    },
    () => {
      const vals = shuffled(r, Array.from({ length: 5 }, () => int(r, 1, 30))); const sorted = [...vals].sort((a, b) => a - b); const med = sorted[2];
      const o = numeric(r, med, 5, [1, 2, 3]);
      return { id: "", type: "single", points: 1, prompt: s(`${vals.join(", ")} сандарының медианасы:`, `Медиана чисел ${vals.join(", ")}:`), ...o, explain: s(`${sorted.join(", ")} → ${med}`) };
    },
    () => {
      const a = int(r, 3, 15), b = int(r, 3, 15), ar = a * b;
      const o = numeric(r, ar, 5, [a, b, 2], " м²");
      return { id: "", type: "single", points: 1, prompt: s(`Бөлменің ұзындығы ${a} м, ені ${b} м. Еденнің ауданы:`, `Комната ${a} м на ${b} м. Площадь пола:`), ...o, explain: s(`${a} × ${b} = ${ar} м²`) };
    },
    () => {
      const scale = pick(r, [10000, 25000, 50000, 100000, 200000]), cm = int(r, 2, 9), km = (scale * cm) / 100000;
      const o = numeric(r, km, 5, [km / 2 || 0.5, 1, 0.5], " км");
      return { id: "", type: "single", points: 1, prompt: s(`Масштабы 1 : ${sp(scale)} картада ${cm} см. Нақты қашықтық:`, `На карте масштаба 1 : ${sp(scale)} — ${cm} см. Реальное расстояние:`), ...o, explain: s(`${cm} × ${sp(scale)} см = ${num(km)} км`) };
    },
    () => {
      const h = int(r, 8, 20), m = pick(r, [0, 10, 15, 20, 30, 40, 45, 50]), dur = int(r, 35, 150);
      const end = h * 60 + m + dur; const fmt = (x: number) => `${String(Math.floor(x / 60) % 24).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`;
      const opts = [end, end + 10, end - 10, end + 60, end - 15].map(fmt);
      const o = choice(r, s(opts[0]), [...new Set(opts.slice(1))].filter((x) => x !== opts[0]).slice(0, 4).map((x) => s(x)));
      return { id: "", type: "single", points: 1, prompt: s(`Сабақ ${fmt(h * 60 + m)}-та басталып, ${dur} минутқа созылды. Аяқталу уақыты:`, `Занятие началось в ${fmt(h * 60 + m)} и длилось ${dur} минут. Время окончания:`), ...o, explain: s(`${fmt(h * 60 + m)} + ${dur} мин = ${fmt(end)}`) };
    },
    () => {
      const w = int(r, 2, 8), d = int(r, 2, 8) * 2; const total = w * d; const w2 = pick(r, [1, 2, 4].map((k) => w * k).filter((x) => total % x === 0 && x !== w).concat([w * 2])); const ans = total / w2;
      const o = numeric(r, ans, 5, [1, 2]);
      return { id: "", type: "single", points: 1, prompt: s(`${w} жұмысшы жұмысты ${d} күнде бітіреді. ${w2} жұмысшы осы жұмысты неше күнде бітіреді?`, `${w} рабочих выполняют работу за ${d} дней. За сколько дней её выполнят ${w2} рабочих?`), ...o, explain: s(`${w} × ${d} : ${w2} = ${num(ans)}`) };
    },
    () => {
      const p = pick(r, [10, 20, 25, 50]), base = pick(r, [1000, 2000, 4000, 5000]), ans = base * (1 - p / 100) * (1 - p / 100);
      const o = numeric(r, ans, 5, [base * 0.01, base * 0.05], " ₸");
      return { id: "", type: "single", points: 1, prompt: s(`${sp(base)} ₸ тауар алдымен ${p}%-ға, сосын тағы ${p}%-ға арзандады. Соңғы баға:`, `Товар за ${sp(base)} ₸ подешевел на ${p}%, затем ещё на ${p}%. Итоговая цена:`), ...o, explain: s(`${sp(base)} × ${1 - p / 100} × ${1 - p / 100} = ${num(ans)} ₸`) };
    },
    () => {
      const t1 = int(r, -15, -1), t2 = int(r, 1, 20), ans = t2 - t1;
      const o = numeric(r, ans, 5, [1, 2, Math.abs(t1)]);
      return { id: "", type: "single", points: 1, prompt: s(`Таңертең ${t1} °C, түсте +${t2} °C болды. Температура неше градусқа өсті?`, `Утром было ${t1} °C, днём +${t2} °C. На сколько градусов выросла температура?`), ...o, explain: s(`${t2} − (${t1}) = ${ans}`) };
    },
    () => {
      const total = pick(r, [20, 25, 30, 40, 50]), p = pick(r, [20, 40, 60]), girls = (total * p) / 100, boys = total - girls;
      const o = numeric(r, boys, 5, [1, 2, 5]);
      return { id: "", type: "single", points: 1, prompt: s(`Сыныпта ${total} оқушы, олардың ${p}%-ы — қыздар. Ұлдар саны:`, `В классе ${total} учеников, ${p}% из них — девочки. Сколько мальчиков?`), ...o, explain: s(`${total} − ${girls} = ${boys}`) };
    },
  ];
  const TOPIC = ["percent", "ratio", "motion", "stats", "stats", "geometry", "geometry", "motion", "ratio", "percent", "stats", "percent"];
  const idx = shuffled(r, T.map((_, i) => i)).slice(0, 10);
  return idx.map((k, i) => ({ ...T[k](), id: `ml-${seed}-${i}`, topic: TOPIC[k] }));
}

/* ═════════ Profile: mathematics (40 tasks: 25 single, 5 context, 5 matching, 5 multi) ═════════ */
const TRIG: [string, string][] = [["sin 30°", "1/2"], ["cos 60°", "1/2"], ["sin 90°", "1"], ["cos 0°", "1"], ["tg 45°", "1"], ["sin 0°", "0"], ["cos 90°", "0"], ["cos 30°", "√3/2"], ["sin 60°", "√3/2"], ["sin 45°", "√2/2"]];
const TRIG_VALUES = ["0", "1/2", "√2/2", "√3/2", "1"];
const isPrime = (n: number) => n > 1 && Array.from({ length: Math.floor(Math.sqrt(n)) - 1 }, (_, i) => i + 2).every((d) => n % d !== 0);

export function genMath(seed: number): MockQ[] {
  const r = rng(seed);
  const single: (() => MockQ)[] = [
    () => { const a = int(r, 2, 9), x = int(r, -9, 12), b = int(r, -20, 20), c = a * x + b; const o = numeric(r, x, 4, [1, 2, 3]); return { id: "", type: "single", points: 1, prompt: s(`Теңдеуді шешіңіз: ${a}x ${b >= 0 ? "+" : "−"} ${Math.abs(b)} = ${c}`, `Решите уравнение: ${a}x ${b >= 0 ? "+" : "−"} ${Math.abs(b)} = ${c}`), ...o, explain: s(`${a}x = ${c - b}, x = ${x}`) }; },
    () => { const r1 = pick(r, [-6, -5, -4, -3, -2, -1, 1, 2, 3, 4, 5]), r2 = pick(r, [1, 2, 3, 4, 5, 6, 7].map((d) => r1 + d).filter((x) => x !== 0 && x !== -r1)), S = r1 + r2, P = r1 * r2; const o = numeric(r, r2, 4, [1, 2]); return { id: "", type: "single", points: 1, prompt: s(`x² ${S >= 0 ? "−" : "+"} ${Math.abs(S)}x ${P >= 0 ? "+" : "−"} ${Math.abs(P)} = 0 теңдеуінің үлкен түбірі:`, `Больший корень уравнения x² ${S >= 0 ? "−" : "+"} ${Math.abs(S)}x ${P >= 0 ? "+" : "−"} ${Math.abs(P)} = 0:`), ...o, explain: s(`Виет: x₁ + x₂ = ${S}, x₁x₂ = ${P} → ${r1}; ${r2}`, `Виет: x₁ + x₂ = ${S}, x₁x₂ = ${P} → ${r1}; ${r2}`) }; },
    () => { const m = int(r, 2, 6), n = int(r, 2, 6); const o = numeric(r, m + n, 4, [1, 2]); return { id: "", type: "single", points: 1, prompt: s(`3^${m} · 3^${n} = 3^k. k = ?`), ...o, explain: s(`k = ${m} + ${n} = ${m + n}`) }; },
    () => { const k = int(r, 11, 25); const o = numeric(r, k, 4, [1, 2]); return { id: "", type: "single", points: 1, prompt: s(`√${k * k} = ?`), ...o, explain: s(`${k}² = ${k * k}`) }; },
    () => { const a1 = int(r, -5, 10), d = int(r, 2, 7), n = int(r, 8, 15), an = a1 + (n - 1) * d; const o = numeric(r, an, 4, [d, 1]); return { id: "", type: "single", points: 1, prompt: s(`Арифметикалық прогрессия: a₁ = ${a1}, d = ${d}. a${n} = ?`, `Арифметическая прогрессия: a₁ = ${a1}, d = ${d}. a${n} = ?`), ...o, explain: s(`a${n} = ${a1} + ${n - 1} · ${d} = ${an}`) }; },
    () => { const b1 = int(r, 1, 4), q = int(r, 2, 3), n = int(r, 3, 5), bn = b1 * q ** (n - 1); const o = numeric(r, bn, 4, [b1, q, 2]); return { id: "", type: "single", points: 1, prompt: s(`Геометриялық прогрессия: b₁ = ${b1}, q = ${q}. b${n} = ?`, `Геометрическая прогрессия: b₁ = ${b1}, q = ${q}. b${n} = ?`), ...o, explain: s(`b${n} = ${b1} · ${q}^${n - 1} = ${bn}`) }; },
    () => { const b = pick(r, [2, 3, 5]), k = int(r, 2, b === 2 ? 7 : 4); const o = numeric(r, k, 4, [1]); return { id: "", type: "single", points: 1, prompt: s(`log${b === 2 ? "₂" : b === 3 ? "₃" : "₅"} ${b ** k} = ?`), ...o, explain: s(`${b}^${k} = ${b ** k}`) }; },
    () => { const a = int(r, 2, 6), n = int(r, 2, 3), x0 = int(r, 1, 3), v = a * n * x0 ** (n - 1); const o = numeric(r, v, 4, [a, n, 2]); return { id: "", type: "single", points: 1, prompt: s(`f(x) = ${a}x${n === 2 ? "²" : "³"}. f′(${x0}) = ?`), ...o, explain: s(`f′(x) = ${a * n}x${n === 3 ? "²" : ""} → ${v}`) }; },
    () => { const [k, v] = pick(r, TRIG); const o = choice(r, s(v), TRIG_VALUES.filter((x) => x !== v).slice(0, 3).map((x) => s(x))); return { id: "", type: "single", points: 1, prompt: s(`${k} мәні:`, `Значение ${k}:`), ...o, explain: s(`${k} = ${v}`) }; },
    () => { const p = pick(r, [5, 10, 15, 20, 25, 40, 60, 75]), n = pick(r, [40, 60, 80, 120, 200, 240, 400]), v = (p * n) / 100; const o = numeric(r, v, 4, [5, 10, 2]); return { id: "", type: "single", points: 1, prompt: s(`${n} санының ${p}%-ы:`, `${p}% от ${n}:`), ...o, explain: s(`${n} · ${p / 100} = ${num(v)}`) }; },
    () => { const [a, b, c] = pick(r, [[3, 4, 5], [5, 12, 13], [8, 15, 17], [6, 8, 10], [9, 12, 15]]); const o = numeric(r, c, 4, [1, 2]); return { id: "", type: "single", points: 1, prompt: s(`Тікбұрышты үшбұрыштың катеттері ${a} және ${b}. Гипотенузасы:`, `Катеты прямоугольного треугольника ${a} и ${b}. Гипотенуза:`), ...o, explain: s(`√(${a * a} + ${b * b}) = ${c}`) }; },
    () => { const S = int(r, 5, 30), D = int(r, 1, 10) * 2 * (S % 2 === 0 ? 1 : 1); const x = (S + (S % 2 === D % 2 ? D : D + 1)) / 2; const Dd = 2 * x - S; const o = numeric(r, x, 4, [1, 2]); return { id: "", type: "single", points: 1, prompt: s(`x + y = ${S}, x − y = ${Dd}. x = ?`), ...o, explain: s(`2x = ${S + Dd}, x = ${x}`) }; },
    () => { const a = int(r, 2, 6), k = int(r, -5, 8), b = a * k; const opts = [k, k + 1, k - 1, -k === k ? k + 2 : -k].map((v) => s(`x > ${v}`)); const o = choice(r, opts[0], opts.slice(1)); return { id: "", type: "single", points: 1, prompt: s(`${a}x > ${b} теңсіздігінің шешімі:`, `Решение неравенства ${a}x > ${b}:`), ...o, explain: s(`x > ${b} : ${a} = ${k}`) }; },
    () => { const a = int(r, 1, 3), b = int(r, -4, 4), c = int(r, -5, 5), x0 = int(r, -3, 3), v = a * x0 * x0 + b * x0 + c; const o = numeric(r, v, 4, [1, 2, 3]); return { id: "", type: "single", points: 1, prompt: s(`f(x) = ${a === 1 ? "" : a}x² ${b >= 0 ? "+" : "−"} ${Math.abs(b)}x ${c >= 0 ? "+" : "−"} ${Math.abs(c)}. f(${x0}) = ?`), ...o, explain: s(`f(${x0}) = ${v}`) }; },
    () => { const rr = int(r, 2, 9); const o = choice(r, s(`${rr * rr}π`), [s(`${2 * rr}π`), s(`${rr * rr * 2}π`), s(`${rr}π`)]); return { id: "", type: "single", points: 1, prompt: s(`Радиусы ${rr} дөңгелектің ауданы:`, `Площадь круга радиусом ${rr}:`), ...o, explain: s(`S = πr² = ${rr * rr}π`) }; },
  ];
  const context: (() => MockQ)[] = [
    () => { const a = int(r, 6, 20), b = int(r, 4, 15); const o = numeric(r, 2 * (a + b), 4, [2, 4]); return { id: "", type: "context", points: 1, context: s(`Тіктөртбұрыш пішінді бақшаның ұзындығы ${a} м, ені ${b} м. Бақшаны шарбақпен қоршау керек.`, `Длина прямоугольного огорода ${a} м, ширина ${b} м. Огород нужно обнести забором.`), prompt: s("Шарбақтың ұзындығы қанша?", "Какой длины нужен забор?"), ...o, explain: s(`P = 2(${a} + ${b}) = ${2 * (a + b)} м`) }; },
    () => { const k = int(r, 5, 15); const o = numeric(r, 4 * k, 4, [4, 2]); return { id: "", type: "context", points: 1, context: s(`Шаршы пішінді алаңның ауданы ${k * k} м².`, `Площадь квадратной площадки ${k * k} м².`), prompt: s("Алаңның периметрі қанша?", "Каков периметр площадки?"), ...o, explain: s(`a = ${k} м, P = ${4 * k} м`) }; },
    () => { const v = pick(r, [60, 72, 80, 90]), t = pick(r, [2, 3, 4, 5]); const o = numeric(r, v * t, 4, [10, 20]); return { id: "", type: "context", points: 1, context: s(`Пойыз екі қаланың арасын ${t} сағатта жүріп өтеді. Оның орташа жылдамдығы ${v} км/сағ.`, `Поезд проходит путь между городами за ${t} ч со средней скоростью ${v} км/ч.`), prompt: s("Қалалар арасындағы қашықтық:", "Расстояние между городами:"), ...o, explain: s(`${v} · ${t} = ${v * t} км`) }; },
    () => { const n = int(r, 12, 30), d = int(r, 3, 9); const o = numeric(r, n * d, 4, [n, d, 5]); return { id: "", type: "context", points: 1, context: s(`Шебер күніне ${n} бөлшек жасайды және демалыссыз жұмыс істейді.`, `Мастер делает ${n} деталей в день и работает без выходных.`), prompt: s(`${d} күнде неше бөлшек жасайды?`, `Сколько деталей он сделает за ${d} дней?`), ...o, explain: s(`${n} · ${d} = ${n * d}`) }; },
    () => { const P = int(r, 4, 20) * 1000, p = pick(r, [10, 20, 25, 30]); const o = numeric(r, P * (1 - p / 100), 4, [500, 1000]); return { id: "", type: "context", points: 1, context: s(`Дүкенде барлық тауарға ${p}% жеңілдік жарияланды. Курткасының бастапқы бағасы ${sp(P)} ₸.`, `В магазине скидка ${p}% на все товары. Начальная цена куртки ${sp(P)} ₸.`), prompt: s("Жеңілдікпен баға:", "Цена со скидкой:"), ...o, explain: s(`${sp(P)} · ${1 - p / 100} = ${sp(P * (1 - p / 100))} ₸`) }; },
  ];
  const DERIV: [string, string][] = [["x²", "2x"], ["x³", "3x²"], ["sin x", "cos x"], ["cos x", "−sin x"], ["eˣ", "eˣ"], ["ln x", "1/x"]];
  const matching: (() => MockQ)[] = [
    () => { const xs = shuffled(r, [2, 3, 4, 5, 6, 7, 8, 9, 11, 12]).slice(0, 3); return { id: "", type: "matching", points: 2, prompt: s("Санды оның квадратымен сәйкестендіріңіз.", "Сопоставьте число и его квадрат."), pairs: xs.map((x) => ({ left: s(String(x)), right: s(String(x * x)) })) }; },
    () => { const d = shuffled(r, DERIV).slice(0, 3); return { id: "", type: "matching", points: 2, prompt: s("Функцияны оның туындысымен сәйкестендіріңіз.", "Сопоставьте функцию и её производную."), pairs: d.map(([a, b]) => ({ left: s(a), right: s(b) })) }; },
    () => { const used = new Set<string>(); const t = shuffled(r, TRIG).filter(([, v]) => (used.has(v) ? false : (used.add(v), true))).slice(0, 3); return { id: "", type: "matching", points: 2, prompt: s("Өрнекті оның мәнімен сәйкестендіріңіз.", "Сопоставьте выражение и его значение."), pairs: t.map(([a, b]) => ({ left: s(a), right: s(b) })) }; },
    () => { const L2: [string, string][] = [["log₂ 8", "3"], ["log₃ 9", "2"], ["lg 10000", "4"], ["log₅ 5", "1"], ["log₂ 32", "5"]]; const t = shuffled(r, L2).slice(0, 3); return { id: "", type: "matching", points: 2, prompt: s("Логарифмді оның мәнімен сәйкестендіріңіз.", "Сопоставьте логарифм и его значение."), pairs: t.map(([a, b]) => ({ left: s(a), right: s(b) })) }; },
    () => { const ns = shuffled(r, [6, 8, 10, 12, 15, 20]).slice(0, 3); return { id: "", type: "matching", points: 2, prompt: s("Көпбұрышты оның ішкі бұрыштарының қосындысымен сәйкестендіріңіз.", "Сопоставьте многоугольник и сумму его внутренних углов."), pairs: ns.map((n) => ({ left: s(`${n}-бұрыш`, `${n}-угольник`), right: s(`${(n - 2) * 180}°`) })) }; },
  ];
  const multi: (() => MockQ)[] = [
    () => { const nums = shuffled(r, [2, 3, 4, 9, 11, 15, 17, 21, 23, 25, 27, 29]).slice(0, 6); return { id: "", type: "multi", points: 2, prompt: s("Жай сандарды таңдаңыз:", "Выберите простые числа:"), options: nums.map((n) => s(String(n))), correct: nums.map((n, i) => (isPrime(n) ? i : -1)).filter((i) => i >= 0) }; },
    () => { const r1 = pick(r, [-5, -4, -3, -2, -1, 1, 2, 3, 4]), r2 = pick(r, [1, 2, 3, 4, 5].map((d) => r1 + d).filter((x) => x !== 0 && x !== -r1)); const pool = shuffled(r, [r1, r2, r1 - 1, r2 + 1, -r2 === r1 ? r2 + 2 : -r2, r1 + r2 === r1 || r1 + r2 === r2 ? r2 + 3 : r1 + r2]); const opts = [...new Set(pool)].slice(0, 6); return { id: "", type: "multi", points: 2, prompt: s(`x² ${-(r1 + r2) >= 0 ? "+" : "−"} ${Math.abs(r1 + r2)}x ${r1 * r2 >= 0 ? "+" : "−"} ${Math.abs(r1 * r2)} = 0 теңдеуінің түбірлерін таңдаңыз:`, `Выберите корни уравнения x² ${-(r1 + r2) >= 0 ? "+" : "−"} ${Math.abs(r1 + r2)}x ${r1 * r2 >= 0 ? "+" : "−"} ${Math.abs(r1 * r2)} = 0:`), options: opts.map((n) => s(String(n))), correct: opts.map((n, i) => (n === r1 || n === r2 ? i : -1)).filter((i) => i >= 0) }; },
    () => { const N = pick(r, [12, 18, 20, 24, 30, 36]); const cand = shuffled(r, [2, 3, 4, 5, 6, 7, 8, 9, 10, 11]).slice(0, 6); return { id: "", type: "multi", points: 2, prompt: s(`${N} санының бөлгіштерін таңдаңыз:`, `Выберите делители числа ${N}:`), options: cand.map((n) => s(String(n))), correct: cand.map((n, i) => (N % n === 0 ? i : -1)).filter((i) => i >= 0) }; },
    () => { const cand = shuffled(r, [16, 18, 25, 32, 36, 45, 49, 50, 64, 72, 81]).slice(0, 6); return { id: "", type: "multi", points: 2, prompt: s("Толық квадрат сандарды таңдаңыз:", "Выберите точные квадраты:"), options: cand.map((n) => s(String(n))), correct: cand.map((n, i) => (Number.isInteger(Math.sqrt(n)) ? i : -1)).filter((i) => i >= 0) }; },
    () => { const cand = shuffled(r, [12, 14, 21, 25, 27, 32, 33, 40, 42, 44, 51]).slice(0, 6); return { id: "", type: "multi", points: 2, prompt: s("3-ке қалдықсыз бөлінетін сандарды таңдаңыз:", "Выберите числа, кратные 3:"), options: cand.map((n) => s(String(n))), correct: cand.map((n, i) => (n % 3 === 0 ? i : -1)).filter((i) => i >= 0) }; },
  ];
  return assemble(r, seed, "m", single, context, matching, multi);
}

/* ═════════ Profile: physics ═════════ */
const UNITS: [L, string][] = [[s("Күш", "Сила"), "Н"], [s("Жұмыс", "Работа"), "Дж"], [s("Қуат", "Мощность"), "Вт"], [s("Қысым", "Давление"), "Па"], [s("Кедергі", "Сопротивление"), "Ом"], [s("Жиілік", "Частота"), "Гц"], [s("Ток күші", "Сила тока"), "А"], [s("Кернеу", "Напряжение"), "В"], [s("Заряд", "Заряд"), "Кл"]];
const VECTORS: [L, boolean][] = [[s("Жылдамдық", "Скорость"), true], [s("Күш", "Сила"), true], [s("Үдеу", "Ускорение"), true], [s("Орын ауыстыру", "Перемещение"), true], [s("Импульс", "Импульс"), true], [s("Масса", "Масса"), false], [s("Уақыт", "Время"), false], [s("Энергия", "Энергия"), false], [s("Температура", "Температура"), false], [s("Жұмыс", "Работа"), false]];

export function genPhysics(seed: number): MockQ[] {
  const r = rng(seed);
  const g = s("(g = 10 м/с²)");
  const single: (() => MockQ)[] = [
    () => { const m = int(r, 2, 20), a = int(r, 2, 9); const o = numeric(r, m * a, 4, [m, a, 2], " Н"); return { id: "", type: "single", points: 1, prompt: s(`Массасы ${m} кг дене ${a} м/с² үдеумен қозғалады. Күш:`, `Тело массой ${m} кг движется с ускорением ${a} м/с². Сила:`), ...o, explain: s(`F = ma = ${m * a} Н`) }; },
    () => { const U = pick(r, [6, 12, 24, 36, 48, 120, 220]), R = pick(r, [2, 3, 4, 6, 12]).valueOf(); const I = U / R; if (!Number.isInteger(I)) return single[1](); const o = numeric(r, I, 4, [1, 2], " А"); return { id: "", type: "single", points: 1, prompt: s(`Кернеу ${U} В, кедергі ${R} Ом. Ток күші:`, `Напряжение ${U} В, сопротивление ${R} Ом. Сила тока:`), ...o, explain: s(`I = U/R = ${I} А`) }; },
    () => { const t = pick(r, [10, 20, 30, 40, 60]), P = pick(r, [5, 10, 20, 25, 50]); const o = numeric(r, P, 4, [5, 10], " Вт"); return { id: "", type: "single", points: 1, prompt: s(`${t} с ішінде ${P * t} Дж жұмыс атқарылды. Қуат:`, `За ${t} с совершена работа ${P * t} Дж. Мощность:`), ...o, explain: s(`P = A/t = ${P} Вт`) }; },
    () => { const m = int(r, 1, 6) * 2, v = int(r, 2, 8); const E = (m * v * v) / 2; const o = numeric(r, E, 4, [m, v, 4], " Дж"); return { id: "", type: "single", points: 1, prompt: s(`Массасы ${m} кг дене ${v} м/с жылдамдықпен қозғалады. Кинетикалық энергиясы:`, `Тело массой ${m} кг движется со скоростью ${v} м/с. Кинетическая энергия:`), ...o, explain: s(`E = mv²/2 = ${E} Дж`) }; },
    () => { const m = int(r, 1, 10), h = int(r, 2, 20); const o = numeric(r, m * 10 * h, 4, [10, 20, 50], " Дж"); return { id: "", type: "single", points: 1, prompt: { kk: `${m} кг дене ${h} м биіктікте тұр ${g.kk}. Потенциалдық энергиясы:`, ru: `Тело массой ${m} кг на высоте ${h} м ${g.ru}. Потенциальная энергия:` }, ...o, explain: s(`E = mgh = ${m * 10 * h} Дж`) }; },
    () => { const V = pick(r, [2, 4, 5, 10]), rho = pick(r, [800, 1000, 2700, 7800]); const o = numeric(r, rho, 4, [100, 200, 500], " кг/м³"); return { id: "", type: "single", points: 1, prompt: s(`Көлемі ${V} м³ дененің массасы ${sp(rho * V)} кг. Тығыздығы:`, `Масса тела объёмом ${V} м³ равна ${sp(rho * V)} кг. Плотность:`), ...o, explain: s(`ρ = m/V = ${rho} кг/м³`) }; },
    () => { const F = pick(r, [100, 200, 400, 600, 1000]), S = pick(r, [0.5, 2, 4, 5]); const p = F / S; const o = numeric(r, p, 4, [10, 50, 100], " Па"); return { id: "", type: "single", points: 1, prompt: s(`${F} Н күш ${num(S)} м² ауданға әсер етеді. Қысым:`, `Сила ${F} Н действует на площадь ${num(S)} м². Давление:`), ...o, explain: s(`p = F/S = ${num(p)} Па`) }; },
    () => { const F = int(r, 5, 50), d = int(r, 2, 20); const o = numeric(r, F * d, 4, [F, d, 10], " Дж"); return { id: "", type: "single", points: 1, prompt: s(`${F} Н күш денені ${d} м-ге орын ауыстырды (күш бағытымен). Жұмыс:`, `Сила ${F} Н переместила тело на ${d} м (по направлению силы). Работа:`), ...o, explain: s(`A = Fs = ${F * d} Дж`) }; },
    () => { const I = int(r, 2, 10), t = int(r, 5, 60); const o = numeric(r, I * t, 4, [I, t, 5], " Кл"); return { id: "", type: "single", points: 1, prompt: s(`Ток күші ${I} А, уақыты ${t} с. Өткен заряд:`, `Сила тока ${I} А, время ${t} с. Прошедший заряд:`), ...o, explain: s(`q = It = ${I * t} Кл`) }; },
    () => { const lam = pick(r, [0.5, 1, 2, 4, 5]), nu = pick(r, [10, 20, 50, 100]); const v = lam * nu; const o = numeric(r, v, 4, [5, 10, 20], " м/с"); return { id: "", type: "single", points: 1, prompt: s(`Толқын ұзындығы ${num(lam)} м, жиілігі ${nu} Гц. Толқынның таралу жылдамдығы:`, `Длина волны ${num(lam)} м, частота ${nu} Гц. Скорость волны:`), ...o, explain: s(`v = λν = ${num(v)} м/с`) }; },
    () => { const m = int(r, 2, 80); const o = numeric(r, m * 10, 4, [10, 20, 50], " Н"); return { id: "", type: "single", points: 1, prompt: { kk: `Массасы ${m} кг дененің салмағы ${g.kk}:`, ru: `Вес тела массой ${m} кг ${g.ru}:` }, ...o, explain: s(`P = mg = ${m * 10} Н`) }; },
    () => { const [q, u] = pick(r, UNITS); const wrong = shuffled(r, UNITS.filter(([, x]) => x !== u)).slice(0, 3).map(([, x]) => s(x)); const o = choice(r, s(u), wrong); return { id: "", type: "single", points: 1, prompt: { kk: `«${q.kk}» шамасының SI бірлігі:`, ru: `Единица величины «${q.ru}» в СИ:` }, ...o, explain: { kk: `${q.kk} — ${u}`, ru: `${q.ru} — ${u}` } }; },
    () => { const s1 = pick(r, [36, 54, 72, 90, 108]); const o = numeric(r, s1 / 3.6, 4, [5, 10], " м/с"); return { id: "", type: "single", points: 1, prompt: s(`${s1} км/сағ жылдамдық неше м/с-қа тең?`, `Скорость ${s1} км/ч равна:`), ...o, explain: s(`${s1} : 3,6 = ${s1 / 3.6} м/с`) }; },
  ];
  const context: (() => MockQ)[] = [
    () => { const v = pick(r, [10, 15, 20, 25]), t = pick(r, [10, 20, 30, 60]); const o = numeric(r, v * t, 4, [10, 50, 100], " м"); return { id: "", type: "context", points: 1, context: s(`Велосипедші түзу жолмен ${v} м/с тұрақты жылдамдықпен қозғалып келеді.`, `Велосипедист едет по прямой с постоянной скоростью ${v} м/с.`), prompt: s(`${t} с ішінде қанша жол жүреді?`, `Какой путь он проедет за ${t} с?`), ...o, explain: s(`s = vt = ${v * t} м`) }; },
    () => { const P = pick(r, [500, 1000, 1500, 2000]), t = pick(r, [60, 120, 300, 600]); const o = numeric(r, P * t, 4, [P, 1000, 10000], " Дж"); return { id: "", type: "context", points: 1, context: s(`Электр шәйнегінің қуаты ${P} Вт.`, `Мощность электрочайника ${P} Вт.`), prompt: s(`${t} с ішінде қанша энергия жұмсайды?`, `Сколько энергии он потребит за ${t} с?`), ...o, explain: s(`E = Pt = ${sp(P * t)} Дж`) }; },
    () => { const R1 = pick(r, [2, 3, 4, 5]), R2 = pick(r, [6, 8, 10]); const o = numeric(r, R1 + R2, 4, [1, 2], " Ом"); return { id: "", type: "context", points: 1, context: s(`Тізбекке ${R1} Ом және ${R2} Ом резисторлар тізбектей қосылған.`, `В цепь последовательно включены резисторы ${R1} Ом и ${R2} Ом.`), prompt: s("Жалпы кедергі:", "Общее сопротивление:"), ...o, explain: s(`R = ${R1} + ${R2} = ${R1 + R2} Ом`) }; },
    () => { const v0 = 0, a = pick(r, [1, 2, 3, 4]), t = pick(r, [5, 10, 15]); const o = numeric(r, v0 + a * t, 4, [a, 5], " м/с"); return { id: "", type: "context", points: 1, context: s(`Автомобиль тыныштық күйден ${a} м/с² тұрақты үдеумен қозғала бастады.`, `Автомобиль начал движение из состояния покоя с постоянным ускорением ${a} м/с².`), prompt: s(`${t} с-тан кейінгі жылдамдығы:`, `Скорость через ${t} с:`), ...o, explain: s(`v = at = ${a * t} м/с`) }; },
    () => { const h = pick(r, [5, 20, 45, 80]); const t = Math.sqrt((2 * h) / 10); const o = numeric(r, t, 4, [1], " с"); return { id: "", type: "context", points: 1, context: { kk: `Тас ${h} м биіктіктен бастапқы жылдамдықсыз құлайды ${g.kk}, ауа кедергісі ескерілмейді.`, ru: `Камень падает без начальной скорости с высоты ${h} м ${g.ru}, сопротивлением воздуха пренебречь.` }, prompt: s("Құлау уақыты:", "Время падения:"), ...o, explain: s(`t = √(2h/g) = ${t} с`) }; },
  ];
  const matching: (() => MockQ)[] = Array.from({ length: 5 }, (_, k) => () => {
    if (k % 2 === 0) { const t = shuffled(r, UNITS).slice(0, 3); return { id: "", type: "matching" as const, points: 2 as const, prompt: s("Шаманы оның SI бірлігімен сәйкестендіріңіз.", "Сопоставьте величину и её единицу СИ."), pairs: t.map(([q, u]) => ({ left: q, right: s(u) })) }; }
    const F: [L, string][] = [[s("Күш", "Сила"), "F = ma"], [s("Жылдамдық", "Скорость"), "v = s/t"], [s("Ток күші", "Сила тока"), "I = U/R"], [s("Қуат", "Мощность"), "P = A/t"], [s("Тығыздық", "Плотность"), "ρ = m/V"], [s("Қысым", "Давление"), "p = F/S"]];
    const t = shuffled(r, F).slice(0, 3); return { id: "", type: "matching" as const, points: 2 as const, prompt: s("Шаманы оның формуласымен сәйкестендіріңіз.", "Сопоставьте величину и её формулу."), pairs: t.map(([q, f]) => ({ left: q, right: s(f) })) };
  });
  const multi: (() => MockQ)[] = Array.from({ length: 5 }, (_, k) => () => {
    if (k % 2 === 0) { const vs = shuffled(r, VECTORS.filter((x) => x[1])).slice(0, int(r, 2, 3)); const sc = shuffled(r, VECTORS.filter((x) => !x[1])).slice(0, 6 - vs.length); const all = shuffled(r, [...vs, ...sc]); return { id: "", type: "multi" as const, points: 2 as const, prompt: s("Векторлық шамаларды таңдаңыз:", "Выберите векторные величины:"), options: all.map((x) => x[0]), correct: all.map((x, i) => (x[1] ? i : -1)).filter((i) => i >= 0) }; }
    const E: [L, boolean][] = [[s("Мыс", "Медь"), true], [s("Алюминий", "Алюминий"), true], [s("Күміс", "Серебро"), true], [s("Темір", "Железо"), true], [s("Шыны", "Стекло"), false], [s("Резеңке", "Резина"), false], [s("Құрғақ ағаш", "Сухое дерево"), false], [s("Пластмасса", "Пластмасса"), false]];
    const all = shuffled(r, E).slice(0, 6); if (!all.some((x) => x[1])) all[0] = E[0]; return { id: "", type: "multi" as const, points: 2 as const, prompt: s("Электр тогын жақсы өткізетін заттарды таңдаңыз:", "Выберите хорошие проводники электрического тока:"), options: all.map((x) => x[0]), correct: all.map((x, i) => (x[1] ? i : -1)).filter((i) => i >= 0) };
  });
  return assemble(r, seed, "p", single, context, matching, multi);
}

/* ═════════ Profile: informatics ═════════ */
export function genInformatics(seed: number): MockQ[] {
  const r = rng(seed);
  const single: (() => MockQ)[] = [
    () => { const n = int(r, 9, 127); const o = numeric(r, n, 4, [1, 2, 4, 8]); return { id: "", type: "single", points: 1, prompt: s(`${n.toString(2)}₂ екілік санын ондық жүйеге аударыңыз:`, `Переведите двоичное число ${n.toString(2)}₂ в десятичную систему:`), ...o, explain: s(`${n.toString(2)}₂ = ${n}`) }; },
    () => { const n = int(r, 9, 63); const right = n.toString(2); const wrong = [n + 1, n - 1, n + 2].map((x) => s(x.toString(2))); const o = choice(r, s(right), wrong); return { id: "", type: "single", points: 1, prompt: s(`${n} санының екілік жазылуы:`, `Двоичная запись числа ${n}:`), ...o, explain: s(`${n} = ${right}₂`) }; },
    () => { const n = int(r, 17, 255); const o = numeric(r, n, 4, [1, 16, 2]); return { id: "", type: "single", points: 1, prompt: s(`${n.toString(16).toUpperCase()}₁₆ санын ондық жүйеге аударыңыз:`, `Переведите ${n.toString(16).toUpperCase()}₁₆ в десятичную систему:`), ...o, explain: s(`${n.toString(16).toUpperCase()}₁₆ = ${n}`) }; },
    () => { const b = int(r, 2, 64); const o = numeric(r, b * 8, 4, [8, 2, 4], " бит"); return { id: "", type: "single", points: 1, prompt: s(`${b} байт неше битке тең?`, `Сколько бит в ${b} байтах?`), ...o, explain: s(`1 байт = 8 бит → ${b * 8}`) }; },
    () => { const k = int(r, 2, 16); const o = numeric(r, k * 1024, 4, [1024, 24, 1000], " байт"); return { id: "", type: "single", points: 1, prompt: s(`${k} Кбайт неше байтқа тең?`, `Сколько байт в ${k} Кбайт?`), ...o, explain: s(`1 Кбайт = 1024 байт → ${sp(k * 1024)}`) }; },
    () => { const n = int(r, 3, 10); const o = numeric(r, 2 ** n, 4, [2, 4, n]); return { id: "", type: "single", points: 1, prompt: s(`${n} битпен неше түрлі мән кодтауға болады?`, `Сколько различных значений можно закодировать ${n} битами?`), ...o, explain: s(`2^${n} = ${2 ** n}`) }; },
    () => { const n = int(r, 5, 20); const o = numeric(r, (n * (n + 1)) / 2, 4, [1, n, 2]); return { id: "", type: "single", points: 1, prompt: s(`s = 0; i = 1-ден ${n}-ге дейін: s = s + i. Цикл соңында s = ?`, `s = 0; для i от 1 до ${n}: s = s + i. Чему равно s после цикла?`), ...o, explain: s(`1 + 2 + … + ${n} = ${(n * (n + 1)) / 2}`) }; },
    () => { const x0 = int(r, 1, 5); let x = x0; for (let i = 0; i < 3; i++) x = x * 2 + 1; const o = numeric(r, x, 4, [1, 2, 4]); return { id: "", type: "single", points: 1, prompt: s(`x = ${x0}. «x = x · 2 + 1» командасы 3 рет орындалды. x = ?`, `x = ${x0}. Команда «x = x · 2 + 1» выполнена 3 раза. x = ?`), ...o, explain: s(`${x0} → ${x0 * 2 + 1} → ${(x0 * 2 + 1) * 2 + 1} → ${x}`) }; },
    () => { const n = int(r, 20, 250); const ones = n.toString(2).split("").filter((c) => c === "1").length; const o = numeric(r, ones, 4, [1, 2]); return { id: "", type: "single", points: 1, prompt: s(`${n.toString(2)}₂ санында неше бірлік бар?`, `Сколько единиц в записи ${n.toString(2)}₂?`), ...o, explain: s(`${ones}`) }; },
    () => { const chars = pick(r, [64, 128, 256, 512, 1024]); const o = numeric(r, chars, 4, [8, 64, chars / 2]); return { id: "", type: "single", points: 1, prompt: s(`Әр символ 8 битпен кодталған ${chars} символдан тұратын мәтіннің көлемі (байт):`, `Объём текста из ${chars} символов, каждый кодируется 8 битами (в байтах):`), ...o, explain: s(`${chars} · 8 бит = ${chars} байт`) }; },
  ];
  const context: (() => MockQ)[] = Array.from({ length: 5 }, (_, k) => () => {
    if (k % 2 === 0) { const w = pick(r, [64, 128, 256]), h = pick(r, [64, 128]), bits = pick(r, [1, 2, 4, 8]); const bytes = (w * h * bits) / 8; const o = numeric(r, bytes, 4, [bytes / 2, 512, 1024], " байт"); return { id: "", type: "context" as const, points: 1 as const, context: s(`Растрлық сурет ${w}×${h} пиксельден тұрады, әр пиксель ${bits} битпен кодталады (${2 ** bits} түс).`, `Растровое изображение ${w}×${h} пикселей, каждый пиксель кодируется ${bits} битами (${2 ** bits} цветов).`), prompt: s("Суреттің көлемі:", "Объём изображения:"), ...o, explain: s(`${w} · ${h} · ${bits} / 8 = ${sp(bytes)} байт`) }; }
    const size = pick(r, [256, 512, 1024, 2048]), speed = pick(r, [32, 64, 128, 256]); const t = size / speed; const o = numeric(r, t, 4, [1, 2, 4], " с"); return { id: "", type: "context" as const, points: 1 as const, context: s(`Файлдың көлемі ${size} Кбайт. Байланыс арнасының жылдамдығы ${speed} Кбайт/с.`, `Размер файла ${size} Кбайт. Скорость канала ${speed} Кбайт/с.`), prompt: s("Файл неше секундта жіберіледі?", "За сколько секунд передастся файл?"), ...o, explain: s(`${size} : ${speed} = ${t} с`) };
  });
  const matching: (() => MockQ)[] = Array.from({ length: 5 }, () => () => { const ns = shuffled(r, Array.from({ length: 30 }, (_, i) => i + 3)).slice(0, 3); return { id: "", type: "matching" as const, points: 2 as const, prompt: s("Екілік санды оның ондық мәнімен сәйкестендіріңіз.", "Сопоставьте двоичное число и его десятичное значение."), pairs: ns.map((n) => ({ left: s(`${n.toString(2)}₂`), right: s(String(n)) })) }; });
  const multi: (() => MockQ)[] = Array.from({ length: 5 }, (_, k) => () => {
    const ns = shuffled(r, Array.from({ length: 60 }, (_, i) => i + 4)).slice(0, 6);
    if (k % 2 === 0) return { id: "", type: "multi" as const, points: 2 as const, prompt: s("Жұп сандарды таңдаңыз (екілік жазылуы 0-мен аяқталады):", "Выберите чётные числа (двоичная запись оканчивается на 0):"), options: ns.map((n) => s(`${n.toString(2)}₂`)), correct: ns.map((n, i) => (n % 2 === 0 ? i : -1)).filter((i) => i >= 0).concat(ns.some((n) => n % 2 === 0) ? [] : []) };
    const pool = shuffled(r, [2, 4, 8, 16, 32, 64, 6, 10, 12, 20, 24, 48]).slice(0, 6); if (!pool.some((n) => (n & (n - 1)) === 0)) pool[0] = 16; return { id: "", type: "multi" as const, points: 2 as const, prompt: s("2-нің дәрежесі болатын сандарды таңдаңыз:", "Выберите числа, являющиеся степенями двойки:"), options: pool.map((n) => s(String(n))), correct: pool.map((n, i) => ((n & (n - 1)) === 0 ? i : -1)).filter((i) => i >= 0) };
  });
  return assemble(r, seed, "i", single, context, matching, multi);
}

/* ═════════ Profile: chemistry ═════════ */
const COMPOUNDS: [string, number, L][] = [["H₂O", 18, s("су", "вода")], ["CO₂", 44, s("көмірқышқыл газы", "углекислый газ")], ["NaCl", 58.5, s("ас тұзы", "поваренная соль")], ["H₂SO₄", 98, s("күкірт қышқылы", "серная кислота")], ["NaOH", 40, s("натрий гидроксиді", "гидроксид натрия")], ["CaCO₃", 100, s("кальций карбонаты", "карбонат кальция")], ["HCl", 36.5, s("тұз қышқылы", "соляная кислота")], ["NH₃", 17, s("аммиак", "аммиак")], ["CH₄", 16, s("метан", "метан")], ["O₂", 32, s("оттек", "кислород")], ["HNO₃", 63, s("азот қышқылы", "азотная кислота")], ["MgO", 40, s("магний оксиді", "оксид магния")], ["KOH", 56, s("калий гидроксиді", "гидроксид калия")], ["Fe₂O₃", 160, s("темір(III) оксиді", "оксид железа(III)")]];
const ELEMENTS: [L, string, number][] = [[s("Сутек", "Водород"), "H", 1], [s("Гелий", "Гелий"), "He", 2], [s("Көміртек", "Углерод"), "C", 6], [s("Азот", "Азот"), "N", 7], [s("Оттек", "Кислород"), "O", 8], [s("Натрий", "Натрий"), "Na", 11], [s("Магний", "Магний"), "Mg", 12], [s("Алюминий", "Алюминий"), "Al", 13], [s("Күкірт", "Сера"), "S", 16], [s("Хлор", "Хлор"), "Cl", 17], [s("Калий", "Калий"), "K", 19], [s("Кальций", "Кальций"), "Ca", 20], [s("Темір", "Железо"), "Fe", 26], [s("Мыс", "Медь"), "Cu", 29]];
const FRACTIONS: [string, L, number][] = [["CH₄", s("сутектің", "водорода"), 25], ["MgO", s("оттектің", "кислорода"), 40], ["CaCO₃", s("кальцийдің", "кальция"), 40], ["SO₃", s("күкірттің", "серы"), 40], ["Fe₂O₃", s("темірдің", "железа"), 70], ["CuO", s("мыстың", "меди"), 80], ["NaOH", s("натрийдің", "натрия"), 57.5]];
const METALS = new Set(["Na", "Mg", "Al", "K", "Ca", "Fe", "Cu"]);

export function genChemistry(seed: number): MockQ[] {
  const r = rng(seed);
  const single: (() => MockQ)[] = [
    () => { const [f, M] = pick(r, COMPOUNDS); const o = numeric(r, M, 4, [2, 4, 16], " г/моль"); return { id: "", type: "single", points: 1, prompt: s(`${f} молярлық массасы:`, `Молярная масса ${f}:`), ...o, explain: s(`M(${f}) = ${num(M)} г/моль`) }; },
    () => { const [f, M] = pick(r, COMPOUNDS.filter((c) => Number.isInteger(c[1]))); const n = int(r, 2, 5); const o = numeric(r, n, 4, [1, 0.5]); return { id: "", type: "single", points: 1, prompt: s(`${sp(n * M)} г ${f} неше моль?`, `Сколько моль составляют ${sp(n * M)} г ${f}?`), ...o, explain: s(`n = m/M = ${n * M}/${M} = ${n} моль`) }; },
    () => { const [f, el, w] = pick(r, FRACTIONS); const o = numeric(r, w, 4, [5, 10], "%"); return { id: "", type: "single", points: 1, prompt: { kk: `${f} құрамындағы ${el.kk} массалық үлесі:`, ru: `Массовая доля ${el.ru} в ${f}:` }, ...o, explain: s(`ω = ${num(w)}%`) }; },
    () => { const [n, sym, z] = pick(r, ELEMENTS); const o = numeric(r, z, 4, [1, 2]); return { id: "", type: "single", points: 1, prompt: { kk: `${n.kk} (${sym}) атомының ядросындағы протон саны:`, ru: `Число протонов в ядре атома ${n.ru} (${sym}):` }, ...o, explain: s(`Z(${sym}) = ${z}`) }; },
    () => { const [n, sym] = pick(r, ELEMENTS); const wrong = shuffled(r, ELEMENTS.filter((e) => e[1] !== sym)).slice(0, 3).map((e) => s(e[1])); const o = choice(r, s(sym), wrong); return { id: "", type: "single", points: 1, prompt: { kk: `${n.kk} элементінің химиялық таңбасы:`, ru: `Химический символ элемента ${n.ru}:` }, ...o, explain: s(sym) }; },
    () => { const pH = pick(r, [1, 2, 3, 4, 5, 7, 9, 10, 11, 12, 13]); const right = pH < 7 ? s("Қышқылдық", "Кислая") : pH === 7 ? s("Бейтарап", "Нейтральная") : s("Сілтілік", "Щелочная"); const all = [s("Қышқылдық", "Кислая"), s("Бейтарап", "Нейтральная"), s("Сілтілік", "Щелочная")]; const o = choice(r, right, [...all.filter((x) => x.kk !== right.kk), s("Анықтау мүмкін емес", "Определить нельзя")]); return { id: "", type: "single", points: 1, prompt: s(`pH = ${pH} болатын ерітіндінің ортасы:`, `Среда раствора с pH = ${pH}:`), ...o, explain: s("pH < 7 — қышқылдық, 7 — бейтарап, > 7 — сілтілік", "pH < 7 — кислая, 7 — нейтральная, > 7 — щелочная") }; },
    () => { const [f, , name] = pick(r, COMPOUNDS); const wrong = shuffled(r, COMPOUNDS.filter((c) => c[0] !== f)).slice(0, 3).map((c) => s(c[0])); const o = choice(r, s(f), wrong); return { id: "", type: "single", points: 1, prompt: { kk: `«${name.kk}» затының формуласы:`, ru: `Формула вещества «${name.ru}»:` }, ...o, explain: s(f) }; },
    () => { const m = pick(r, [100, 200, 250, 400, 500]), w = pick(r, [5, 10, 20, 25]); const o = numeric(r, (m * w) / 100, 4, [5, 10], " г"); return { id: "", type: "single", points: 1, prompt: s(`${m} г ${w}%-дық ерітіндідегі еріген заттың массасы:`, `Масса растворённого вещества в ${m} г ${w}%-ного раствора:`), ...o, explain: s(`${m} · ${w / 100} = ${(m * w) / 100} г`) }; },
  ];
  const context: (() => MockQ)[] = Array.from({ length: 5 }, (_, k) => () => {
    if (k % 2 === 0) { const m = pick(r, [150, 200, 300]), w1 = pick(r, [10, 20]), add = pick(r, [50, 100]); const solute = (m * w1) / 100; const w2 = Math.round((solute / (m + add)) * 1000) / 10; const o = numeric(r, w2, 4, [1, 2, 5], "%"); return { id: "", type: "context" as const, points: 1 as const, context: s(`${m} г ${w1}%-дық тұз ерітіндісіне ${add} г су қосылды.`, `К ${m} г ${w1}%-ного раствора соли добавили ${add} г воды.`), prompt: s("Жаңа ерітіндідегі тұздың массалық үлесі:", "Массовая доля соли в новом растворе:"), ...o, explain: s(`${solute} / ${m + add} = ${num(w2)}%`) }; }
    const n = pick(r, [0.5, 1, 2, 3]); const o = numeric(r, n * 22.4, 4, [5.6, 11.2], " л"); return { id: "", type: "context" as const, points: 1 as const, context: s(`Қалыпты жағдайда (қ.ж.) кез келген газдың 1 молі 22,4 л көлем алады. Ыдыста ${num(n)} моль оттек бар.`, `При нормальных условиях (н.у.) 1 моль любого газа занимает 22,4 л. В сосуде ${num(n)} моль кислорода.`), prompt: s("Оттектің көлемі (қ.ж.):", "Объём кислорода (н.у.):"), ...o, explain: s(`V = ${num(n)} · 22,4 = ${num(n * 22.4)} л`) };
  });
  const matching: (() => MockQ)[] = Array.from({ length: 5 }, (_, k) => () => {
    if (k % 2 === 0) { const t = shuffled(r, ELEMENTS).slice(0, 3); return { id: "", type: "matching" as const, points: 2 as const, prompt: s("Элементті оның таңбасымен сәйкестендіріңіз.", "Сопоставьте элемент и его символ."), pairs: t.map(([n, sym]) => ({ left: n, right: s(sym) })) }; }
    const t = shuffled(r, COMPOUNDS).slice(0, 3); return { id: "", type: "matching" as const, points: 2 as const, prompt: s("Затты оның формуласымен сәйкестендіріңіз.", "Сопоставьте вещество и его формулу."), pairs: t.map(([f, , name]) => ({ left: name, right: s(f) })) };
  });
  const multi: (() => MockQ)[] = Array.from({ length: 5 }, (_, k) => () => {
    if (k % 2 === 0) { const all = shuffled(r, ELEMENTS).slice(0, 6); if (!all.some((e) => METALS.has(e[1]))) all[0] = ELEMENTS[12]; return { id: "", type: "multi" as const, points: 2 as const, prompt: s("Металдарды таңдаңыз:", "Выберите металлы:"), options: all.map((e) => ({ kk: `${e[0].kk} (${e[1]})`, ru: `${e[0].ru} (${e[1]})` })), correct: all.map((e, i) => (METALS.has(e[1]) ? i : -1)).filter((i) => i >= 0) }; }
    const pool: [string, boolean][] = shuffled(r, [["HCl", true], ["H₂SO₄", true], ["HNO₃", true], ["H₃PO₄", true], ["NaOH", false], ["KOH", false], ["NaCl", false], ["CaO", false], ["CO₂", false]] as [string, boolean][]).slice(0, 6); if (!pool.some((x) => x[1])) pool[0] = ["HCl", true]; return { id: "", type: "multi" as const, points: 2 as const, prompt: s("Қышқылдарды таңдаңыз:", "Выберите кислоты:"), options: pool.map((x) => s(x[0])), correct: pool.map((x, i) => (x[1] ? i : -1)).filter((i) => i >= 0) };
  });
  return assemble(r, seed, "c", single, context, matching, multi);
}

/** 25 single + 5 context + 5 matching + 5 multi = 40 tasks / 50 points. */
function assemble(r: R, seed: number, tag: string, single: (() => MockQ)[], context: (() => MockQ)[], matching: (() => MockQ)[], multi: (() => MockQ)[]): MockQ[] {
  const valid = (q: MockQ) => {
    if (q.type === "multi") return !!q.options && !!q.correct && q.correct.length > 0 && q.correct.length < q.options.length;
    if (q.type === "matching") return !!q.pairs && new Set(q.pairs.map((p) => p.right.kk)).size === q.pairs.length;
    return !!q.options && q.options.length >= 4 && !!q.correct && q.correct.length === 1 && q.correct[0] >= 0 && new Set(q.options.map((o) => o.kk)).size === q.options.length;
  };
  const make = (g: () => MockQ) => {
    for (let i = 0; i < 20; i++) {
      const q = g();
      if (valid(q)) return q;
    }
    return g();
  };
  const take = (gens: (() => MockQ)[], n: number) => Array.from({ length: n }, (_, i) => gens[i % gens.length]).map((g) => make(g));
  const singles = take(shuffled(r, single), 25);
  const out = [...singles, ...take(context, 5), ...take(matching, 5), ...take(multi, 5)];
  return out.map((q, i) => ({ ...q, id: `${tag}-${seed}-${i}`, topic: q.topic ?? q.type }));
}

export const GENERATORS = { math: genMath, physics: genPhysics, informatics: genInformatics, chemistry: genChemistry } as const;
export type GenSubject = keyof typeof GENERATORS;
