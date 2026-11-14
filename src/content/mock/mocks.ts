/**
 * 10 full ҰБТ mock tests in the official structure:
 *   Mathematical literacy 10 · Reading literacy 10 · History of Kazakhstan 20 · Profile 1: 40 · Profile 2: 40
 *   = 120 tasks, 140 points, 240 minutes.
 * Computational subjects are generated with fixed seeds (answers correct by construction);
 * reading uses 10 original texts; history uses the 100-question fact-checked bank.
 */
import type { L } from "@/lib/i18n";
import { QUESTIONS } from "../questions";
import { SUBJECTS } from "../unt-config";
import { GENERATORS, genMathLit, rng, shuffled, type GenSubject, type MockQ } from "./generators";
import { READING_SETS } from "./reading";

const READING_EXPLAIN: Record<string, L> = {
  main: { kk: "Негізгі ой бүкіл мәтінді қамтиды. Тек бір абзацқа немесе мәтінде жоқ «әдемі» ойға қатысты нұсқалар — тұзақ.", ru: "Главная мысль охватывает весь текст. Варианты про один абзац или «красивые» мысли, которых нет в тексте, — ловушка." },
  detail: { kk: "Бұл ақпарат мәтінде тікелей жазылған. Сұрақтағы кілт сөзді (сан, есім, орын) мәтіннен тауып, сол сөйлемді толық оқыңыз.", ru: "Эта информация прямо есть в тексте. Найдите ключевое слово вопроса (число, имя, место) и прочитайте предложение целиком." },
  inference: { kk: "Жауап мәтінде тікелей жазылмаған, бірақ одан шығады. Әр нұсқаны мәтінмен салыстырып, дәлелі барын ғана таңдаңыз.", ru: "Ответ прямо не написан, но следует из текста. Сверяйте каждый вариант с текстом и выбирайте тот, у которого есть доказательство." },
  word: { kk: "Сөз мағынасын контекст арқылы табыңыз: нұсқаны сөздің орнына қойып, сөйлем мағынасы сақтала ма — тексеріңіз.", ru: "Значение слова — по контексту: подставьте вариант вместо слова и проверьте, сохраняется ли смысл." },
  purpose: { kk: "Автордың мақсаты — неге жазғаны: хабарлау, үлгі көрсету, сендіру. Мәтін нені көрсетіп тұрғанына қараңыз.", ru: "Цель автора — зачем он написал: сообщить, показать пример, убедить. Смотрите, что именно показывает текст." },
};

export const MOCK_COUNT = 10;
export const FULL_MINUTES = 240;

/** Pairs whose both profile subjects are fully available. */
export const MOCK_PAIRS: { id: string; a: GenSubject; b: GenSubject }[] = [
  { id: "math-physics", a: "math", b: "physics" },
  { id: "math-informatics", a: "math", b: "informatics" },
  { id: "chemistry-physics", a: "chemistry", b: "physics" },
];

export type Section = { id: string; name: L; max: number; min: number; qs: MockQ[]; context?: { title: L; text: L } };
export type Mock = { id: number; pair: string | null; sections: Section[]; minutes: number; tasks: number; max: number };

const SUBJECT_SEED: Record<string, number> = { mathlit: 1, math: 2, physics: 3, informatics: 4, chemistry: 5 };

function historyFor(id: number): MockQ[] {
  const bank = QUESTIONS.filter((q) => q.subject === "history");
  const order = shuffled(rng(id <= 5 ? 777 : 778), bank);
  const start = ((id - 1) % 5) * 20;
  return order.slice(start, start + 20).map((q) => ({ id: `h-${id}-${q.id}`, type: "single" as const, points: 1 as const, prompt: q.prompt, options: q.options, correct: q.correct, explain: q.explain, topic: q.topic }));
}

function readingFor(id: number): Section {
  const set = READING_SETS[(id - 1) % READING_SETS.length];
  return {
    id: "reading",
    name: SUBJECTS.reading,
    max: 10,
    min: 3,
    context: { title: set.title, text: set.text },
    qs: set.qs.map(([prompt, options, c], i) => {
      const topic = i === 0 ? "main" : /сөз|слов/i.test(prompt.kk + prompt.ru) ? "word" : /мақсат|цель/i.test(prompt.kk + prompt.ru) ? "purpose" : /қорытынды|вывод|тұжырым|утвержд|КӨРСЕТІЛМЕГЕН|НЕ упомянуто|есе|раз/i.test(prompt.kk + prompt.ru) ? "inference" : "detail";
      return { id: `r-${id}-${i}`, type: "single" as const, points: 1 as const, prompt, options, correct: [c], topic, explain: READING_EXPLAIN[topic] };
    }),
  };
}

export function buildMock(id: number, pair: string | null): Mock {
  const sections: Section[] = [
    { id: "mathlit", name: SUBJECTS.mathlit, max: 10, min: 3, qs: genMathLit(id * 1000 + SUBJECT_SEED.mathlit) },
    readingFor(id),
    { id: "history", name: SUBJECTS.history, max: 20, min: 5, qs: historyFor(id) },
  ];
  const p = MOCK_PAIRS.find((x) => x.id === pair);
  if (p) {
    for (const subj of [p.a, p.b]) {
      sections.push({ id: subj, name: SUBJECTS[subj], max: 50, min: 5, qs: GENERATORS[subj](id * 1000 + SUBJECT_SEED[subj]) });
    }
  }
  const tasks = sections.reduce((a, s) => a + s.qs.length, 0);
  const max = sections.reduce((a, s) => a + s.max, 0);
  return { id, pair: p ? p.id : null, sections, tasks, max, minutes: p ? FULL_MINUTES : tasks * 2 };
}

/* ───────── Scoring (official point values; 2-point tasks all-or-nothing — see unt-config VERIFY note) ───────── */
export type AnswerValue = number[] | Record<number, number>;

export function scoreQuestion(q: MockQ, a: AnswerValue | undefined): number {
  if (!a) return 0;
  if (q.type === "matching") {
    const m = a as Record<number, number>;
    return q.pairs && q.pairs.every((_, i) => m[i] === i) ? q.points : 0;
  }
  const picked = a as number[];
  const corr = q.correct ?? [];
  return picked.length === corr.length && picked.every((x) => corr.includes(x)) ? q.points : 0;
}

export function scoreMock(mock: Mock, answers: Record<string, AnswerValue>) {
  const per = mock.sections.map((s) => {
    const pts = s.qs.reduce((acc, q) => acc + scoreQuestion(q, answers[q.id]), 0);
    return { id: s.id, name: s.name, pts, max: s.max, min: s.min, ok: pts >= s.min };
  });
  const total = per.reduce((a, x) => a + x.pts, 0);
  return { per, total, max: mock.max, allMinimums: per.every((x) => x.ok) };
}
