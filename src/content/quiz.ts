import type { L } from "@/lib/i18n";
import { PAIRS, SESSION_LABEL, SUBJECTS, THRESHOLDS, UNT } from "./unt-config";

export type Option = { value: string; label: L; hint?: L };

type ParentWording = { questionParent?: L; helperParent?: L };

export type Step = ParentWording &
  (
  | { id: string; type: "tiles"; question: L; helper?: L; tiles: { value: string; tag: L; title: L; text: L; cta: L; color: string }[] }
  | { id: string; type: "single"; question: L; helper?: L; options: Option[] }
  | { id: string; type: "multi"; question: L; helper?: L; options: Option[] }
  | { id: string; type: "date"; question: L; helper?: L }
  | { id: string; type: "slider"; question: L; helper?: L; min: number; max: number; def: number }
  | { id: string; type: "loader"; question: L; helper?: L; checklist: L[] }
  | { id: string; type: "final"; question: L; helper?: L }
  );

const s = (kk: string, ru: string): L => ({ kk, ru });
const MAX = UNT.standard.maxScore.value;

export const QUIZ: Step[] = [
  {
    id: "role",
    type: "tiles",
    question: s("Сіз кімсіз?", "Кто вы?"),
    helper: s("Жоспар соған қарай бейімделеді.", "План подстроится под ответ."),
    tiles: [
      { value: "student", tag: s("Түлек", "Выпускник"), title: s("Оқушымын", "Я ученик"), text: s("ҰБТ-ны өзім тапсырамын.", "Сдаю ЕНТ сам(а)."), cta: s("Оқушы", "Ученик"), color: "#135EF2" },
      { value: "parent", tag: s("Отбасы", "Семья"), title: s("Ата-анамын", "Я родитель"), text: s("Баламның дайындығына көмектескім келеді.", "Хочу помочь ребёнку с подготовкой."), cta: s("Ата-ана", "Родитель"), color: "#FF4B3C" },
    ],
  },
  {
    id: "grade",
    type: "single",
    question: s("Қай сыныптасыз?", "В каком вы классе?"),
    questionParent: s("Балаңыз қай сыныпта оқиды?", "В каком классе ваш ребёнок?"),
    options: [
      { value: "10", label: s("10-сынып", "10 класс") },
      { value: "11", label: s("11-сынып", "11 класс") },
      { value: "college", label: s("Колледж", "Колледж") },
      { value: "graduate", label: s("Мектепті бітірдім", "Уже окончил(а) школу") },
    ],
  },
  {
    id: "lang",
    type: "single",
    question: s("ҰБТ-ны қай тілде тапсырасыз?", "На каком языке сдаёте ЕНТ?"),
    questionParent: s("Балаңыз ҰБТ-ны қай тілде тапсырады?", "На каком языке ребёнок сдаёт ЕНТ?"),
    options: [
      { value: "kk", label: s("Қазақ тілі", "Казахский язык") },
      { value: "ru", label: s("Орыс тілі", "Русский язык") },
    ],
  },
  {
    id: "mode",
    type: "single",
    question: s("Мамандық түрі", "Тип специальности"),
    questionParent: s("Балаңыз қандай мамандыққа түспек?", "На какую специальность поступает ребёнок?"),
    helper: s("Шығармашылық мамандықтарға ҰБТ-да 2 пән және ЖОО-да 2 шығармашылық емтихан.", "Для творческих: 2 предмета на ЕНТ и 2 творческих экзамена в вузе."),
    options: [
      { value: "standard", label: s("Шығармашылық емес", "Нетворческая") },
      { value: "creative", label: s("Шығармашылық", "Творческая") },
    ],
  },
  {
    id: "pair",
    type: "single",
    question: s("Бейіндік пәндеріңіз", "Ваши профильные предметы"),
    questionParent: s("Баланың бейіндік пәндері", "Профильные предметы ребёнка"),
    helper: s("Ресми 11 комбинация және шығармашылық емтихан.", "11 официальных комбинаций и творческий экзамен."),
    options: [
      ...PAIRS.value.map((p) => ({ value: p.id, label: { kk: `${SUBJECTS[p.a].kk} — ${SUBJECTS[p.b].kk}`, ru: `${SUBJECTS[p.a].ru} — ${SUBJECTS[p.b].ru}` } })),
      { value: "unsure", label: s("Әлі шешпедім", "Ещё не решил(а)") },
    ],
  },
  {
    id: "session",
    type: "single",
    question: s("Қай сессияда тапсырасыз?", "В какую сессию сдаёте?"),
    questionParent: s("Балаңыз қай сессияда тапсырады?", "В какую сессию сдаёт ребёнок?"),
    options: [
      { value: "january", label: SESSION_LABEL.january },
      { value: "march", label: SESSION_LABEL.march },
      { value: "main", label: SESSION_LABEL.main },
      { value: "august", label: SESSION_LABEL.august },
      { value: "undecided", label: s("Әлі шешпедім", "Ещё не решил(а)") },
    ],
  },
  { id: "date", type: "date", question: s("Тест күнін білесіз бе?", "Знаете дату теста?"),
    questionParent: s("Баланың тест күні белгілі ме?", "Известна ли дата теста ребёнка?"), helper: s("Жоспар тест күнінен бір апта бұрын аяқталады.", "План закончится за неделю до теста.") },
  { id: "current", type: "slider", question: s("Соңғы пробный тест балыңыз", "Балл последнего пробника"),
    questionParent: s("Баланың соңғы пробный тест балы", "Балл последнего пробника ребёнка"), helper: s(`0-ден ${MAX}-ға дейін. Білмесеңіз — шамамен белгілеңіз.`, `От 0 до ${MAX}. Если не знаете — укажите примерно.`), min: 0, max: MAX, def: 60 },
  { id: "target", type: "slider", question: s("Мақсатты балыңыз", "Целевой балл"),
    questionParent: s("Бала қанша балл жинауы керек?", "Какой балл должен набрать ребёнок?"), helper: s("Грантқа қажетті балды ЖОО сайтынан қараңыз.", "Проходной на грант смотрите на сайте вуза."), min: 0, max: MAX, def: 100 },
  {
    id: "weak",
    type: "multi",
    question: s("Қай пәндер қиын?", "Какие предметы даются тяжелее?"),
    questionParent: s("Балаңызға қай пәндер қиын?", "Какие предметы даются ребёнку тяжелее?"),
    helper: s("Бірнешеуін таңдауға болады.", "Можно выбрать несколько."),
    options: [
      { value: "history", label: SUBJECTS.history },
      { value: "mathlit", label: SUBJECTS.mathlit },
      { value: "reading", label: SUBJECTS.reading },
      { value: "p1", label: s("1-бейіндік пән", "1-й профильный") },
      { value: "p2", label: s("2-бейіндік пән", "2-й профильный") },
    ],
  },
  {
    id: "goal",
    type: "single",
    question: s("Мақсатыңыз қандай?", "Какая у вас цель?"),
    questionParent: s("Отбасының мақсаты қандай?", "Какая цель у семьи?"),
    options: [
      { value: "grant", label: s("Мемлекеттік грант", "Государственный грант") },
      { value: "paid", label: s("Ақылы оқу", "Платное обучение") },
      { value: "university", label: s("Нақты бір ЖОО", "Конкретный вуз") },
    ],
  },
  {
    id: "field",
    type: "single",
    question: s("Қай бағытқа түскіңіз келеді?", "Куда хотите поступать?"),
    questionParent: s("Балаңыз қай бағытқа түскісі келеді?", "Куда хочет поступать ребёнок?"),
    options: THRESHOLDS.value
      .filter((t) => ["pedagogy", "healthcare", "law", "national", "other"].includes(t.id))
      .map((t) => ({ value: t.id, label: t.label, hint: s(`Шекті балл: ${t.score}`, `Порог: ${t.score}`) })),
  },
  {
    id: "hours",
    type: "single",
    question: s("Күніне қанша уақыт бөле аласыз?", "Сколько времени в день готовы уделять?"),
    questionParent: s("Бала күніне қанша уақыт дайындала алады?", "Сколько времени в день ребёнок может заниматься?"),
    options: [
      { value: "1", label: s("1 сағат", "1 час") },
      { value: "2", label: s("2 сағат", "2 часа") },
      { value: "3", label: s("3 сағат", "3 часа") },
      { value: "4", label: s("4 сағат және көп", "4 часа и больше") },
    ],
  },
  {
    id: "building",
    type: "loader",
    question: s("Жоспарыңыз құрылып жатыр…", "Составляем ваш план…"),
    checklist: [s("Пәндер мен комбинацияны ескеріп жатырмыз", "Учитываем предметы и комбинацию"), s("Тест күніне қарай қадамдарды бөліп жатырмыз", "Распределяем шаги до даты теста"), s("Әлсіз пәндерге уақыт қосып жатырмыз", "Добавляем время на слабые предметы"), s("Алғашқы үш тапсырманы жазып жатырмыз", "Пишем первые три задания")],
  },
  { id: "result", type: "final", question: s("Жоспарыңыз дайын", "Ваш план готов"), helper: s("Жоспарды поштаңызға жібереміз.", "Отправим план вам на почту."), questionParent: s("Балаңыздың жоспары дайын", "План для вашего ребёнка готов"), helperParent: s("Жоспарды поштаңызға жібереміз — баланың дайындығын бақылай аласыз.", "Отправим план вам на почту — сможете следить за подготовкой ребёнка.") },
];
