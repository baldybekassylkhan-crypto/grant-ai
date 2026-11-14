# Edit prompt: turn grant.ai into an ҰБТ (UNT / ЕНТ) preparation platform

> Facts checked on 14 Nov 2026 against the National Testing Center (НЦТ / ҰТО) page "Формат тестирования" (testcenter.kz/?page_id=15074) plus 2026 news coverage. Every official number goes into one config file with its source, so it can be re-checked each year.

## 0. Scope of this edit
The existing grant.ai site (Next.js App Router + TypeScript + Tailwind v4 + lucide-react) is built and working. Do NOT redesign it.
Keep unchanged: design tokens, colours, typography scale, radii, shadows, buttons, header/footer/shell, page templates, layouts, grids, responsive rules, interactions, accessibility and SEO setup, and all shared components.
Change: the subject matter, copy, content data files, tool logic, mini-app content, quiz questions, locales and metadata.

New positioning: grant.ai is an online platform that helps Kazakhstani school and college graduates prepare for ҰБТ (Ұлттық бірыңғай тестілеу / ЕНТ, Единое национальное тестирование) and win a state education grant (мемлекеттік білім беру гранты / образовательный грант) for a bachelor's degree.
Audience: 10th–11th grade students, college graduates, and their parents.
Brand name stays "grant.ai" (lowercase, with the dot). Tagline: "ҰБТ-ға дайындық · грантқа жол" / "Подготовка к ЕНТ · путь к гранту".

## 1. Official facts → `src/content/unt-config.ts`
Put every value below in ONE typed config. Each value gets `source` (URL) and `verifiedAt: "2026-11-14"`. Components must read from this file only. Add an admin note: re-check every January, when the NTC publishes the new year's rules.

### 1.1 Format: non-creative specialties (source: testcenter.kz/?page_id=15074)
- 5 subjects · 120 tasks · **140 points max** · **240 minutes**.
- Compulsory subjects. All tasks are single choice, one correct answer out of 5:
  | Subject | kk | ru | Tasks | Max points |
  |---|---|---|---|---|
  | Mathematical literacy | Математикалық сауаттылық | Математическая грамотность | 10 | 10 |
  | Reading literacy | Оқу сауаттылығы | Грамотность чтения | 10 | 10 |
  | History of Kazakhstan | Қазақстан тарихы | История Казахстана | 20 | 20 |
- Each of the 2 profile subjects: **40 tasks, 50 points**:
  | Task type | Count | Points |
  |---|---|---|
  | Single choice, 1 correct out of 4 | 25 | 25 (1 each) |
  | Context-based tasks | 5 | 5 (1 each) |
  | Matching | 5 | 10 (2 each) |
  | One or more correct answers out of many | 5 | 10 (2 each) |
  Partial-credit rules for the 2-point tasks are not on the official page. Keep them as a config value marked `// VERIFY: partial credit rule` and default to all-or-nothing in the calculator.
- Extra time for test-takers with special educational needs: +40 minutes (2026 news coverage; mark VERIFY).
- Allowed materials: calculator, periodic table of the elements, salt solubility table (2026 news coverage; mark VERIFY).

### 1.2 Format: creative specialties
- 2 compulsory subjects at the ҰБТ: Reading literacy (10 tasks / 10 pts) + History of Kazakhstan (20 / 20) → 30 tasks, 30 points max, 70 minutes.
- Plus 2 creative exams held at the chosen university. Max total including the creative exams: **130 points**.

### 1.3 Official profile-subject combinations (11 + creative)
| # | Profile 1 | Profile 2 |
|---|---|---|
| 1 | Математика | Физика |
| 2 | Математика | Информатика |
| 3 | Математика | География |
| 4 | Биология | Химия |
| 5 | Биология | География |
| 6 | Иностранный язык | Всемирная история |
| 7 | География | Иностранный язык |
| 8 | Всемирная история | Основы права |
| 9 | Всемирная история | География |
| 10 | Казахский язык / Русский язык | Казахская литература / Русская литература |
| 11 | Химия | Физика |
| — | Творческий экзамен 1 | Творческий экзамен 2 (creative specialties) |
The combination is chosen to match the group of educational programmes (ГОП) at the university. Give kk translations for every subject name. Link to the NTC's "Список ГОП с предметами ЕНТ" as [OFFICIAL GOP LIST URL] instead of copying the full specialty list.
Real stat you may cite with its source: in the main 2026 session the most popular pairs were Mathematics–Physics (18.2%), Biology–Chemistry (14.4%) and the creative exam (12.4%) (Committee of Higher Education, via inform.kz).

### 1.4 Threshold ("passing") scores
- National universities: **65**. Other universities: **50**.
- By field, at any university: Pedagogical sciences **75**, Law **75**, Healthcare **70**. At national universities, Agriculture and bioresources and Veterinary: **50**. Newly created national universities in the current calendar year: **50**.
- Subject minimums: at least **5** points in History of Kazakhstan and in each profile subject (or creative exam), and at least **3** points in Reading literacy and in Mathematical literacy.
- Each university may set its own passing score per programme group (show this note wherever thresholds appear).

### 1.5 Sessions (2026, last known; store per year)
- January ҰБТ: 10 Jan – 10 Feb 2026 · March ҰБТ: 1 Mar – 6 Apr 2026 (paid sessions; mark VERIFY).
- Main ҰБТ: registration 11–25 Apr 2026 on app.testcenter.kz and in the UTO app; testing 10 May – 10 July 2026; up to two attempts. The subject combination is chosen once when applying and cannot change between attempts.
- August ҰБТ: 10–20 Aug 2026 (mark VERIFY).
- 2027 dates: `null` until the NTC publishes them. The UI shows "Dates for 2027 not announced yet — check testcenter.kz".

### 1.6 State education grants
- Grants are awarded by competition based on the ҰБТ certificate score (Rules for awarding an educational grant, Adilet document V2300033345).
- 2026 application window: **13–20 July 2026**, online via egov.kz or through university admission offices. Winners were published by **10 August 2026**.
- Documents: ID card, ҰБТ certificate, 3×4 photo, school certificate (or college diploma), plus documents confirming any quota category.
- Rural youth quota: for programme groups where it applies, 65% of grants go to the general competition and **35%** to a competition only for rural youth. 2026 coverage mentions **10 quota types** in total. List them from the Adilet rules as [QUOTA TYPES] with a link; do not paraphrase them from memory.
- Quotas do not add points to the ҰБТ score (NTC statement).
- Past grant cut-off scores per programme group are published every year. Show them as [GRANT CUT-OFF, YEAR] placeholders with a source link until real data is imported.

### 1.7 Accuracy rules
- Footer and support disclaimer: "grant.ai is not affiliated with the National Testing Center (Ұлттық тестілеу орталығы) or the Ministry of Science and Higher Education of the Republic of Kazakhstan. Official rules: testcenter.kz."
- No NTC logo, ministry symbols or real university logos. Use placeholders.
- Do not copy questions from official or commercial banks. Write original questions in the official task formats above.
- Do not invent statistics, testimonials, pass rates or cut-offs beyond the sourced facts in this section. Use [STAT], [REVIEW], [GRANT CUT-OFF].

## 2. Locales and fonts
- Locales: `kk` (default), `ru`, `en` (secondary). Routes `/kk/...`, `/ru/...`, `/en/...`; `/` redirects to `/kk`. Update hreflang, sitemap, RSS and the language menu (Қазақша · Русский · English). The locale banner offers the other language ("Сайт на русском →" / "Қазақша нұсқасы →").
- All UI copy goes through typed dictionaries (`src/i18n/kk.ts`, `ru.ts`, `en.ts`). No hard-coded strings in components.
- Fonts: check that every Kazakh letter renders: Ә ә Ғ ғ Қ қ Ң ң Ө ө Ұ ұ Ү ү Һ һ І і. Load the `cyrillic` and `cyrillic-ext` subsets. If a font lacks glyphs, swap it: "Nunito" for body text, and a display font with Kazakh Cyrillic support (for example "Unbounded") for headings. Keep the same sizes and weights.
- Currency ₸. Locale-formatted dates.

## 3. Navigation and shell
- Main nav: Жаттығу / Практика · Құралдар / Инструменты · Нұсқаулықтар / Гайды · Кепілдік / Гарантия.
- CTA "БАСТАУ" / "НАЧАТЬ".
- Footer columns: FREE PRACTICE (three mini-apps + full mock test), FREE TOOLS (seven tools), GUIDES, GRANT.AI (Guarantee, Support, Mobile app, Log in), FOR SCHOOLS AND TUTORS (Partners, contact email), LANGUAGE.
- Promo strip on practice pages: "🔥 [OFFER] · ҰБТ-ға жеке жоспар →".

## 4. Home page (same nine sections)
1. Hero: big display numeral **140** (from the config) flanked by laurels. H1 "ҰБТ-ға дайындал. Грантты ұт." / "Подготовься к ЕНТ. Выиграй грант." Subtitle: a personal plan, mock tests in the real format (120 tasks, 240 minutes), and analysis of mistakes. START → quiz, PLATFORM → product tour. "In partnership with [PARTNER LOGO]".
2. Proof strip: two placeholder ҰБТ certificates with personal data redacted, score shown as [SCORE].
3. Logo marquee: [SCHOOL / PARTNER LOGO n].
4. Video carousel: placeholder student stories.
5. Product tour, eight tabs: Diagnostic test · Study plan · Full mock test · Mistake analysis · History of Kazakhstan · Mathematical literacy · Reading literacy · Grant chances.
6. Reviews: [RATING], six [REVIEW] cards, badge "ҰБТ [SCORE]".
7. Guarantee card: "Score-improvement guarantee", [GUARANTEE TERMS].
8. FAQ from section 1: format, scoring, thresholds, attempts, subject pairs, grants, "Is grant.ai official?" (No), [PRICING].
9. Partner banner: "For schools and tutors".

## 5. Tools (same four variants, seven tools)
**Score and grants**
1. *ҰБТ score calculator* (Variant A): a segmented toggle for Standard / Creative, then a pill select for the subject pair (from 1.3). Standard rows: Math literacy 0–10, Reading literacy 0–10, History 0–20, Profile 1 0–50, Profile 2 0–50. Creative rows: Reading literacy 0–10, History 0–20, Creative exam 1, Creative exam 2 (creative exam max = [VERIFY]; the config total is 130). The result card shows total / max, a per-subject breakdown, a check against each subject minimum (5/3), and a threshold check for a chosen field (National 65, Other 50, Pedagogy 75, Law 75, Healthcare 70, …). Level chip: Below threshold / Passing / Strong. State syncs to the URL.
2. *Profile score builder* (Variant A): steppers for each of the four profile task types (25 single × 1, 5 context × 1, 5 matching × 2, 5 multi × 2) → profile points out of 50. It shows which task type gives the most points per minute of practice.
3. *Grant chance estimator* (Variant A): total score, rural youth (yes/no), a programme group, and a cut-off entered by the user (default [GRANT CUT-OFF, YEAR]) → Low / Possible / Strong. It notes that quotas do not add points and that the result is indicative.
4. *Study planner* (Variant A): days until the chosen session (from 1.5), hours per day, current mock score, target → weekly hours per subject, weighted by points (profile subjects carry 100 of the 140) → On track / Tight / At risk.

**Universities and specialties**
5. *Specialty and university directory* (Variant B): search by programme group or code. Filters: segmented Grant / Paid, pill selects for city, subject pair (1.3) and language of study, toggle chips for dormitory, military department, rural-youth quota, and English-taught. Cards: university [PLACEHOLDER], city 🇰🇿, "Threshold" (from 1.4), "Grant cut-off [SCORE, YEAR]". The data is placeholder until imported.

**Practice**
6. *Question generator* (Variant C): tabs per subject, a topic select, a NEW QUESTION button and keyboard shortcuts. The task card shows original questions in the exact official formats: 5 options for the compulsory subjects; for profile subjects, 4 options, context sets, matching, or multi-answer. It has "Show explanation", per-question timing based on the real pace (240 min / 120 tasks = 2 min per task), and a searchable topic list.
7. *Reading literacy drill* (Variant C, exam-paper flavour): an original text, 10 single-choice questions (5 options each), and a 20-minute countdown (2 min per task). The result is shown out of 10 against the minimum of 3.

**Convert:** the *Score converter* (Variant D) uses the NTC's "Перевод баллов" page ([OFFICIAL URL]) as its source. If no official conversion exists for a pair of scales, show "No official conversion" instead of inventing one. Tiles: correct answers ↔ points per subject ↔ % of max ↔ distance to the threshold.

Every tool page keeps the hero band, breadcrumbs, explainer bands (using the real tables from section 1), related tools, FAQ and closing CTA.

## 6. Mini-apps (three original games)
1. **Тарих Sprint** (dark interior): quick-fire History of Kazakhstan questions in 5-option format. Topic chips: Ancient · Medieval · Kazakh Khanate · 18th–19th c. · 20th c. · Independence.
2. **Математикалық сауаттылық 60** (light interior): percentages, proportions, charts and tables, logic. 2-minute ring per task (official pace).
3. **Мәтін Spinner** (warm interior): spin for a reading task type (main idea, detail, inference, author's purpose, word meaning), then answer about a short original text.
All content must be original. Keep the plan CTA card and "More free practice".

## 7. Guides
Categories, using the existing accent order:
1. ҰБТ негіздері / Основы ЕНТ
2. Қазақстан тарихы
3. Математикалық сауаттылық
4. Оқу сауаттылығы
5. Бейіндік пәндер / Профильные предметы
6. Гранттар және ЖОО / Гранты и вузы
7. Жоспар және психология / План и психология
Seed one fully written guide in kk and ru: "ҰБТ қалай өтеді: формат, балл, шекті балл" / "Как устроен ЕНТ: формат, баллы, пороги". Build it from section 1, with the format tables, the 11 pairs, thresholds, sessions, the grant timeline and source links. Add six stub guides per category.
"When is your ҰБТ?" options: January · March · Main (May–July) · August · Not decided → quiz deep links (`?session=`).
Authors: "grant.ai редакциясы", "grant.ai әдістемешілері" (no invented people).

## 8. Onboarding quiz (15 steps)
1. (tiles) Student / Parent
2. (single) Grade: 10th / 11th / college / graduated
3. (single) Test language: Қазақ тілі / Русский язык
4. (single) Standard or creative specialty
5. (single) Subject pair (11 options from 1.3, or creative)
6. (single) Session: January / March / Main / August / not decided
7. (date) Exact test date or "not known yet"
8. (slider) Latest mock score 0–140 (0–30 for creative)
9. (slider) Target score
10. (multi) Weakest subjects
11. (single) Goal: state grant / paid place / specific university
12. (single) Field: pedagogy / healthcare / law / engineering & IT / other. Show the matching threshold from 1.4 as a hint.
13. (single) Hours per day
14. (loader) "Жоспарыңыз құрылып жатыр…"
15. (final) Plan summary (current vs. target, gap to threshold, weekly hours by subject, first three tasks) + email or phone capture (placeholder, no backend)
Pre-fill from query parameters is still supported.

## 9. Guarantee, support, legal, login
- Guarantee: score-improvement guarantee between the diagnostic test and the final mock: [X] points, [GUARANTEE REMEDY]. It states clearly that no grant or official result is guaranteed.
- Support adds a "For parents" section and the official contact pointer: "For questions about registration and results, contact the NTC: testcenter.kz".
- Legal pages: [LEGAL COPY] for Kazakhstan ([COMPANY NAME], BIN [BIN], [ADDRESS]).
- Login: email code + phone/SMS code ([SMS PROVIDER]).

## 10. SEO
kk/ru titles targeting "ҰБТ дайындық", "ҰБТ шекті балл", "ЕНТ подготовка", "калькулятор баллов ЕНТ", "пороговый балл ЕНТ", "грант ЕНТ". JSON-LD: Organization + EducationalOrganization (home), Course (plan), Quiz (practice), FAQPage, Article, BreadcrumbList. hreflang kk/ru/en.

## 11. Acceptance checks
- `/` → `/kk`; every page works in kk and ru; all Kazakh letters render.
- The calculator's maxima equal the config (10/10/20/50/50 = 140; creative 10/20 + creative exams = 130). The subject-minimum and threshold checks match section 1.4 exactly.
- No official number appears outside `unt-config.ts`; each has `source` + `verifiedAt`.
- The quiz runs 15 steps, shows "n / 15", and survives a refresh.
- No copied exam questions, real logos or invented stats; the "not affiliated" disclaimer is visible.
- All original acceptance checks still pass (64px sticky header, article grid 232/672/240, mobile TOC and floating CTA, minimal shell on quiz and login).

## Sources
- NTC "Формат тестирования": https://testcenter.kz/?page_id=15074&lang=ru
- Thresholds / 2026 overview: https://tengrinews.kz/newseducation/kazahstane-startovalo-osnovnoe-ent-format-porogovyie-ballyi-598927/
- Registration and main session dates: https://tengrinews.kz/newseducation/v-kazahstane-startuet-registratsiya-na-ent-596716/
- Session calendar 2026: https://airpress.kz/social/ent-porogovye-bally-sroki/
- Popular subject pairs 2026: https://www.inform.kz/ru/nazvana-samaya-populyarnaya-kombinatsiya-profilnih-predmetov-naent-2026-de68c501
- Grant application dates: https://www.zakon.kz/obshestvo/6521707-v-kazakhstane-obyavili-sroki-priema-zayavleniy-na-obrazovatelnye-granty.html
- Grant rules (Adilet): https://adilet.zan.kz/rus/docs/V2300033345
- Quota types: https://liter.kz/v-kazakhstane-deistvuet-10-vidov-kvot-v-konkurse-obrazovatelnykh-grantov-1782228328/
