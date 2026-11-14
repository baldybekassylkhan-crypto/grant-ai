/**
 * Official ҰБТ (ЕНТ) facts. The ONLY place official numbers live.
 * Re-check every January when the National Testing Center publishes the new year's rules.
 */
import type { L } from "@/lib/i18n";

const NTC_FORMAT = "https://testcenter.kz/?page_id=15074&lang=ru";
const VERIFIED = "2026-11-14";

type Fact<T> = { value: T; source: string; verifiedAt: string; verify?: string };
const fact = <T,>(value: T, source = NTC_FORMAT, verify?: string): Fact<T> => ({ value, source, verifiedAt: VERIFIED, verify });

export type SubjectId =
  | "mathlit"
  | "reading"
  | "history"
  | "math"
  | "physics"
  | "informatics"
  | "geography"
  | "biology"
  | "chemistry"
  | "foreign"
  | "worldhistory"
  | "law"
  | "language"
  | "literature"
  | "creative1"
  | "creative2";

export const SUBJECTS: Record<SubjectId, L> = {
  mathlit: { kk: "Математикалық сауаттылық", ru: "Математическая грамотность" },
  reading: { kk: "Оқу сауаттылығы", ru: "Грамотность чтения" },
  history: { kk: "Қазақстан тарихы", ru: "История Казахстана" },
  math: { kk: "Математика", ru: "Математика" },
  physics: { kk: "Физика", ru: "Физика" },
  informatics: { kk: "Информатика", ru: "Информатика" },
  geography: { kk: "География", ru: "География" },
  biology: { kk: "Биология", ru: "Биология" },
  chemistry: { kk: "Химия", ru: "Химия" },
  foreign: { kk: "Шет тілі", ru: "Иностранный язык" },
  worldhistory: { kk: "Дүниежүзі тарихы", ru: "Всемирная история" },
  law: { kk: "Құқық негіздері", ru: "Основы права" },
  language: { kk: "Қазақ тілі / Орыс тілі", ru: "Казахский язык / Русский язык" },
  literature: { kk: "Қазақ әдебиеті / Орыс әдебиеті", ru: "Казахская литература / Русская литература" },
  creative1: { kk: "Шығармашылық емтихан 1", ru: "Творческий экзамен 1" },
  creative2: { kk: "Шығармашылық емтихан 2", ru: "Творческий экзамен 2" },
};

export const UNT = {
  standard: {
    subjects: fact(5),
    tasks: fact(120),
    maxScore: fact(140),
    minutes: fact(240),
    compulsory: fact([
      { id: "mathlit" as SubjectId, tasks: 10, max: 10, options: 5 },
      { id: "reading" as SubjectId, tasks: 10, max: 10, options: 5 },
      { id: "history" as SubjectId, tasks: 20, max: 20, options: 5 },
    ]),
    profile: fact({
      tasks: 40,
      max: 50,
      parts: [
        { id: "single", tasks: 25, points: 1, label: { kk: "Бір дұрыс жауап (4 нұсқадан)", ru: "Один правильный ответ из четырёх" } },
        { id: "context", tasks: 5, points: 1, label: { kk: "Контекст негізіндегі тапсырмалар", ru: "Задания на основе контекста" } },
        { id: "matching", tasks: 5, points: 2, label: { kk: "Сәйкестікті анықтау", ru: "Задания на установление соответствия" } },
        { id: "multi", tasks: 5, points: 2, label: { kk: "Бір немесе бірнеше дұрыс жауап", ru: "Один или несколько правильных ответов" } },
      ],
    }),
    /** Not on the official page — calculator assumes all-or-nothing. */
    partialCredit: fact<"all-or-nothing">("all-or-nothing", NTC_FORMAT, "Partial-credit rule for 2-point tasks is not published on the format page"),
  },
  creative: {
    subjects: fact(2),
    tasks: fact(30),
    testMax: fact(30),
    minutes: fact(70),
    compulsory: fact([
      { id: "reading" as SubjectId, tasks: 10, max: 10, options: 5 },
      { id: "history" as SubjectId, tasks: 20, max: 20, options: 5 },
    ]),
    maxWithCreativeExams: fact(130),
    /** Derived (130 − 30) / 2; the per-exam maximum is not stated on the format page. */
    creativeExamMax: fact(50, NTC_FORMAT, "Per-exam maximum derived from 130 total; confirm with the NTC"),
  },
  extraMinutesSpecialNeeds: fact(40, "https://tengrinews.kz/newseducation/kazahstane-startovalo-osnovnoe-ent-format-porogovyie-ballyi-598927/", "From 2026 news coverage"),
  allowedMaterials: fact<L[]>(
    [
      { kk: "Калькулятор", ru: "Калькулятор" },
      { kk: "Химиялық элементтердің периодтық жүйесі", ru: "Периодическая система химических элементов" },
      { kk: "Тұздардың ерігіштік кестесі", ru: "Таблица растворимости солей" },
    ],
    "https://tengrinews.kz/newseducation/kazahstane-startovalo-osnovnoe-ent-format-porogovyie-ballyi-598927/",
    "From 2026 news coverage",
  ),
};

/** Official profile-subject combinations (NTC format page). */
export const PAIRS = fact<{ id: string; a: SubjectId; b: SubjectId; creative?: boolean }[]>([
  { id: "math-physics", a: "math", b: "physics" },
  { id: "math-informatics", a: "math", b: "informatics" },
  { id: "math-geography", a: "math", b: "geography" },
  { id: "biology-chemistry", a: "biology", b: "chemistry" },
  { id: "biology-geography", a: "biology", b: "geography" },
  { id: "foreign-worldhistory", a: "foreign", b: "worldhistory" },
  { id: "geography-foreign", a: "geography", b: "foreign" },
  { id: "worldhistory-law", a: "worldhistory", b: "law" },
  { id: "worldhistory-geography", a: "worldhistory", b: "geography" },
  { id: "language-literature", a: "language", b: "literature" },
  { id: "chemistry-physics", a: "chemistry", b: "physics" },
  { id: "creative", a: "creative1", b: "creative2", creative: true },
]);

export const pairLabel = (id: string, l: keyof L) => {
  const p = PAIRS.value.find((x) => x.id === id);
  return p ? `${SUBJECTS[p.a][l]} — ${SUBJECTS[p.b][l]}` : id;
};

export const POPULAR_PAIRS_2026 = fact(
  [
    { id: "math-physics", share: 18.2 },
    { id: "biology-chemistry", share: 14.4 },
    { id: "creative", share: 12.4 },
  ],
  "https://www.inform.kz/ru/nazvana-samaya-populyarnaya-kombinatsiya-profilnih-predmetov-naent-2026-de68c501",
);

/** Threshold ("passing") scores. */
export type FieldId = "national" | "other" | "pedagogy" | "law" | "healthcare" | "agri" | "vet" | "newNational";
export const THRESHOLDS = fact<{ id: FieldId; score: number; label: L; note?: L }[]>([
  { id: "national", score: 65, label: { kk: "Ұлттық ЖОО", ru: "Национальные вузы" } },
  { id: "other", score: 50, label: { kk: "Басқа ЖОО", ru: "Другие вузы" } },
  { id: "pedagogy", score: 75, label: { kk: "Педагогикалық ғылымдар", ru: "Педагогические науки" } },
  { id: "law", score: 75, label: { kk: "Құқық", ru: "Право" } },
  { id: "healthcare", score: 70, label: { kk: "Денсаулық сақтау", ru: "Здравоохранение" } },
  { id: "agri", score: 50, label: { kk: "Ауыл шаруашылығы және биоресурстар (ұлттық ЖОО)", ru: "Сельское хозяйство и биоресурсы (нац. вузы)" } },
  { id: "vet", score: 50, label: { kk: "Ветеринария (ұлттық ЖОО)", ru: "Ветеринария (нац. вузы)" } },
  { id: "newNational", score: 50, label: { kk: "Биыл ашылған ұлттық ЖОО", ru: "Новые национальные вузы текущего года" } },
]);

export const SUBJECT_MINIMUMS = fact({ history: 5, profile: 5, creative: 5, reading: 3, mathlit: 3 });

export const thresholdNote: L = {
  kk: "Әр ЖОО білім беру бағдарламалары тобы бойынша өз шекті балын белгілей алады.",
  ru: "Каждый вуз может устанавливать свой проходной балл по группам образовательных программ.",
};

/** Sessions — stored per year. */
export type SessionId = "january" | "march" | "main" | "august";
export const SESSIONS = {
  2026: fact<{ id: SessionId; start: string; end: string; registration?: [string, string]; verify?: boolean }[]>(
    [
      { id: "january", start: "2026-01-10", end: "2026-02-10", verify: true },
      { id: "march", start: "2026-03-01", end: "2026-04-06", verify: true },
      { id: "main", start: "2026-05-10", end: "2026-07-10", registration: ["2026-04-11", "2026-04-25"] },
      { id: "august", start: "2026-08-10", end: "2026-08-20", verify: true },
    ],
    "https://airpress.kz/social/ent-porogovye-bally-sroki/",
  ),
  2027: fact<null>(null, "https://testcenter.kz", "Not announced yet"),
} as const;

export const SESSION_LABEL: Record<SessionId, L> = {
  january: { kk: "Қаңтардағы ҰБТ", ru: "Январское ЕНТ" },
  march: { kk: "Наурыздағы ҰБТ", ru: "Мартовское ЕНТ" },
  main: { kk: "Негізгі ҰБТ (мамыр–шілде)", ru: "Основное ЕНТ (май–июль)" },
  august: { kk: "Тамыздағы ҰБТ", ru: "Августовское ЕНТ" },
};

export const MAIN_SESSION_RULES = fact(
  { attempts: 2, registrationSite: "app.testcenter.kz", app: "UTO", pairFixed: true },
  "https://tengrinews.kz/newseducation/v-kazahstane-startuet-registratsiya-na-ent-596716/",
);

/** State education grants. */
export const GRANTS = {
  rules: fact("Правила присуждения образовательного гранта", "https://adilet.zan.kz/rus/docs/V2300033345"),
  window2026: fact({ start: "2026-07-13", end: "2026-07-20", resultsBy: "2026-08-10" }, "https://www.zakon.kz/obshestvo/6521707-v-kazakhstane-obyavili-sroki-priema-zayavleniy-na-obrazovatelnye-granty.html"),
  channels: fact<L[]>([
    { kk: "egov.kz порталы арқылы онлайн", ru: "Онлайн через портал egov.kz" },
    { kk: "ЖОО қабылдау комиссиясы арқылы", ru: "Через приёмную комиссию вуза" },
  ]),
  documents: fact<L[]>([
    { kk: "Жеке куәлік", ru: "Удостоверение личности" },
    { kk: "ҰБТ сертификаты", ru: "Сертификат ЕНТ" },
    { kk: "3×4 фотосурет", ru: "Фотография 3×4" },
    { kk: "Аттестат (колледж түлектеріне — диплом)", ru: "Аттестат (для выпускников колледжей — диплом)" },
    { kk: "Квотаны растайтын құжаттар (бар болса)", ru: "Документы на квоту (при наличии)" },
  ]),
  ruralQuota: fact({ general: 65, rural: 35 }, "https://adilet.zan.kz/rus/docs/V2300033345"),
  quotaTypesCount: fact(10, "https://liter.kz/v-kazakhstane-deistvuet-10-vidov-kvot-v-konkurse-obrazovatelnykh-grantov-1782228328/"),
  quotasAddNoPoints: fact(true, "https://liter.kz/v-kazakhstane-deistvuet-10-vidov-kvot-v-konkurse-obrazovatelnykh-grantov-1782228328/"),
};

export const SOURCES = {
  ntcFormat: NTC_FORMAT,
  ntc: "https://testcenter.kz",
  grantRules: "https://adilet.zan.kz/rus/docs/V2300033345",
};

export const fmtDate = (iso: string, l: keyof L) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString(l === "kk" ? "kk-KZ" : "ru-RU", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
