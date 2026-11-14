/**
 * 2025 state education grant results (general competition + rural quota), per programme group and university.
 * Collected from univision.kz on 2026-11-14 (results of the official 2025 grant competition).
 * Regenerate with the scraper scripts when the 2026 results are published.
 */
import type { L, Locale } from "@/lib/i18n";
import programsJson from "./programs.json";
import universitiesJson from "./universities.json";

export type MinGrants = [min: number, grants: number] | null;

export type Program = {
  code: string;
  ru: string;
  kk: string;
  pair: string | null;
  area: string;
  grants2025: Record<string, string>;
  gen: MinGrants;
  rural: MinGrants;
  unis: number;
  source: string;
};

export type UniProgram = { c: string; g: MinGrants; r: MinGrants };

export type University = {
  id: string;
  slug: string;
  ru: string;
  kk: string;
  city: string | null;
  cat: "state" | "private" | "international" | "jsc";
  type: string;
  national: boolean;
  site: string | null;
  code: string | null;
  progs: UniProgram[];
  source: string;
};

export const DATA_META = programsJson.meta as { year: number; source: string; collected: string; cities: Record<string, L> };
export const PROGRAMS = programsJson.programs as Program[];
export const UNIVERSITIES = universitiesJson.universities as University[];
export const CITIES = DATA_META.cities;

const ALIASES: Record<string, string> = { B086: "BM086", B087: "BM087", B088: "BM088", B089: "BM089" };
export const programByCode = (code: string) => PROGRAMS.find((p) => p.code === (ALIASES[code] ?? code));
export const uniById = (id: string) => UNIVERSITIES.find((u) => u.id === id);
export const uniBySlug = (slug: string) => UNIVERSITIES.find((u) => u.slug === slug);
export const progName = (p: Program, l: Locale) => (l === "kk" ? p.kk : p.ru);
export const uniName = (u: University, l: Locale) => (l === "kk" ? u.kk : u.ru);
export const cityName = (slug: string | null, l: Locale) => (slug && CITIES[slug] ? CITIES[slug][l] : "—");

export const CAT_LABEL: Record<University["cat"], L> = {
  state: { kk: "Мемлекеттік", ru: "Государственный" },
  private: { kk: "Жеке", ru: "Частный" },
  international: { kk: "Халықаралық", ru: "Международный" },
  jsc: { kk: "Акционерлік", ru: "Акционированный" },
};

/** Rows for one programme across universities (sorted by general min, ascending). */
export function programUniversities(code: string) {
  return UNIVERSITIES.flatMap((u) => u.progs.filter((p) => p.c === code).map((p) => ({ uni: u, g: p.g, r: p.r }))).sort(
    (a, b) => (a.g?.[0] ?? 999) - (b.g?.[0] ?? 999),
  );
}

export type Reach = { program: Program; uni: University; min: number; grants: number; margin: number };

/**
 * Universities/programmes where `score` reaches last year's minimum grant score.
 * `pair` filters by subject combination; `rural` uses rural-quota minimums instead of the general competition.
 */
export function reachable(score: number, pair: string | null, rural = false): Reach[] {
  const progs = PROGRAMS.filter((p) => !pair || p.pair === pair);
  const out: Reach[] = [];
  for (const p of progs) {
    for (const u of UNIVERSITIES) {
      const up = u.progs.find((x) => x.c === p.code);
      const row = up ? (rural ? up.r : up.g) : null;
      if (row && score >= row[0]) out.push({ program: p, uni: u, min: row[0], grants: row[1], margin: score - row[0] });
    }
  }
  return out.sort((a, b) => b.min - a.min);
}

/** Count of (programme × university) options for a pair, for "x of y" summaries. */
export function optionsCount(pair: string | null, rural = false) {
  let n = 0;
  for (const p of PROGRAMS.filter((x) => !pair || x.pair === pair))
    for (const u of UNIVERSITIES) {
      const up = u.progs.find((x) => x.c === p.code);
      if (up && (rural ? up.r : up.g)) n++;
    }
  return n;
}

/** Short bilingual descriptions per education area (first 4 chars of the area code, e.g. "6B06"). */
export const AREA_INFO: Record<string, { name: L; about: L; careers: L }> = {
  "6B01": { name: { kk: "Педагогикалық ғылымдар", ru: "Педагогические науки" }, about: { kk: "Мұғалімдер мен тәрбиешілерді даярлау: пән әдістемесі, психология, тәрбие жұмысы. Шекті балл — 75.", ru: "Подготовка учителей и воспитателей: методика предмета, психология, воспитательная работа. Порог — 75." }, careers: { kk: "Мектеп мұғалімі, тәрбиеші, әдіскер, мектеп психологы", ru: "Учитель, воспитатель, методист, школьный психолог" } },
  "6B02": { name: { kk: "Өнер және гуманитарлық ғылымдар", ru: "Искусство и гуманитарные науки" }, about: { kk: "Тарих, филология, аударма, философия және өнер бағыттары.", ru: "История, филология, перевод, философия и направления искусства." }, careers: { kk: "Аудармашы, тарихшы, редактор, музей қызметкері", ru: "Переводчик, историк, редактор, музейный работник" } },
  "6B03": { name: { kk: "Әлеуметтік ғылымдар, журналистика және ақпарат", ru: "Социальные науки, журналистика и информация" }, about: { kk: "Қоғам, саясат, психология және медианы зерттеу.", ru: "Изучение общества, политики, психологии и медиа." }, careers: { kk: "Журналист, психолог, социолог, PR-маман", ru: "Журналист, психолог, социолог, PR-специалист" } },
  "6B04": { name: { kk: "Бизнес, басқару және құқық", ru: "Бизнес, управление и право" }, about: { kk: "Экономика, қаржы, менеджмент, маркетинг және құқық. «Құқық» бағытына шекті балл — 75.", ru: "Экономика, финансы, менеджмент, маркетинг и право. Порог для «Права» — 75." }, careers: { kk: "Экономист, қаржыгер, менеджер, заңгер, аудитор", ru: "Экономист, финансист, менеджер, юрист, аудитор" } },
  "6B05": { name: { kk: "Жаратылыстану ғылымдары, математика және статистика", ru: "Естественные науки, математика и статистика" }, about: { kk: "Биология, химия, физика, математика, экология — іргелі ғылымдар.", ru: "Биология, химия, физика, математика, экология — фундаментальные науки." }, careers: { kk: "Зерттеуші, зертхана маманы, эколог, аналитик", ru: "Исследователь, специалист лаборатории, эколог, аналитик" } },
  "6B06": { name: { kk: "Ақпараттық-коммуникациялық технологиялар", ru: "Информационно-коммуникационные технологии" }, about: { kk: "Бағдарламалау, ақпараттық жүйелер, киберқауіпсіздік, деректер талдауы.", ru: "Программирование, информационные системы, кибербезопасность, анализ данных." }, careers: { kk: "Бағдарламашы, жүйелік администратор, деректер талдаушысы, киберқауіпсіздік маманы", ru: "Программист, системный администратор, аналитик данных, специалист по кибербезопасности" } },
  "6B07": { name: { kk: "Инженерия, өңдеу және құрылыс салалары", ru: "Инженерные, обрабатывающие и строительные отрасли" }, about: { kk: "Энергетика, машина жасау, құрылыс, мұнай-газ, тау-кен және өндіріс технологиялары.", ru: "Энергетика, машиностроение, строительство, нефтегаз, горное дело и производственные технологии." }, careers: { kk: "Инженер, құрылысшы, технолог, энергетик", ru: "Инженер, строитель, технолог, энергетик" } },
  "6B08": { name: { kk: "Ауыл шаруашылығы және биоресурстар", ru: "Сельское хозяйство и биоресурсы" }, about: { kk: "Агрономия, мал шаруашылығы, орман және су ресурстары, ветеринария.", ru: "Агрономия, животноводство, лесное и водное хозяйство, ветеринария." }, careers: { kk: "Агроном, зоотехник, ветеринар, агроинженер", ru: "Агроном, зоотехник, ветеринар, агроинженер" } },
  "6B09": { name: { kk: "Ветеринария", ru: "Ветеринария" }, about: { kk: "Жануарлардың денсаулығы, ветеринариялық медицина және санитария.", ru: "Здоровье животных, ветеринарная медицина и санитария." }, careers: { kk: "Ветеринар дәрігер, ветсанитар", ru: "Ветеринарный врач, ветсанитар" } },
  "6B10": { name: { kk: "Денсаулық сақтау", ru: "Здравоохранение" }, about: { kk: "Медицина, фармация, мейіргер ісі және қоғамдық денсаулық. Шекті балл — 70.", ru: "Медицина, фармация, сестринское дело и общественное здоровье. Порог — 70." }, careers: { kk: "Дәрігер, фармацевт, мейіргер, қоғамдық денсаулық маманы", ru: "Врач, фармацевт, медсестра, специалист общественного здоровья" } },
  "6B11": { name: { kk: "Қызмет көрсету", ru: "Услуги" }, about: { kk: "Туризм, мейрамхана-қонақүй ісі, көлік қызметтері, спорт және қауіпсіздік.", ru: "Туризм, ресторанно-гостиничное дело, транспортные услуги, спорт и безопасность." }, careers: { kk: "Туризм менеджері, логист, жаттықтырушы", ru: "Менеджер туризма, логист, тренер" } },
};

export const areaOf = (p: Program) => AREA_INFO[p.area ? p.area.slice(0, 4) : p.code.startsWith("BM") ? "6B10" : ""] ?? null;
