"use client";

import Link from "next/link";
import { AlertTriangle, Clock, Lightbulb, TrendingDown, TrendingUp } from "lucide-react";
import { scoreQuestion, type AnswerValue, type Mock } from "@/content/mock/mocks";
import { THRESHOLDS } from "@/content/unt-config";
import { cn } from "@/lib/cn";
import { lp, type L, type Locale } from "@/lib/i18n";
import { useLocale } from "@/lib/useLocale";

const T = (l: Locale, kk: string, ru: string) => (l === "kk" ? kk : ru);
const s = (kk: string, ru: string): L => ({ kk, ru });

/** Topic → readable label + lesson path. Profile topics are task types, linked per subject. */
const TOPIC_INFO: Record<string, { label: L; path: string }> = {
  ancient: { label: s("Тарих: ежелгі дәуір", "История: древность"), path: "/guides/history/ancient" },
  medieval: { label: s("Тарих: орта ғасырлар", "История: Средние века"), path: "/guides/history/medieval" },
  khanate: { label: s("Тарих: Қазақ хандығы", "История: Казахское ханство"), path: "/guides/history/kazakh-khanate" },
  c19: { label: s("Тарих: XVIII–XIX ғғ.", "История: XVIII–XIX вв."), path: "/guides/history/18-19-centuries" },
  c20: { label: s("Тарих: XX ғасыр", "История: XX век"), path: "/guides/history/20th-century" },
  independence: { label: s("Тарих: Тәуелсіздік", "История: Независимость"), path: "/guides/history/independence" },
  percent: { label: s("Мат. сауаттылық: пайыз", "Матграмотность: проценты"), path: "/guides/mathlit/percent" },
  ratio: { label: s("Мат. сауаттылық: пропорция", "Матграмотность: пропорции"), path: "/guides/mathlit/ratio" },
  motion: { label: s("Мат. сауаттылық: қозғалыс және уақыт", "Матграмотность: движение и время"), path: "/guides/mathlit/motion-time" },
  stats: { label: s("Мат. сауаттылық: орта мән, медиана", "Матграмотность: среднее, медиана"), path: "/guides/mathlit/statistics" },
  geometry: { label: s("Мат. сауаттылық: аудан, масштаб", "Матграмотность: площадь, масштаб"), path: "/guides/mathlit/geometry-basics" },
  main: { label: s("Оқу: негізгі ой", "Чтение: главная мысль"), path: "/guides/reading/main-idea-purpose" },
  purpose: { label: s("Оқу: автордың мақсаты", "Чтение: цель автора"), path: "/guides/reading/main-idea-purpose" },
  detail: { label: s("Оқу: нақты ақпарат", "Чтение: детали"), path: "/guides/reading/details-scanning" },
  inference: { label: s("Оқу: қорытынды жасау", "Чтение: выводы"), path: "/guides/reading/inference-words" },
  word: { label: s("Оқу: сөз мағынасы", "Чтение: значение слова"), path: "/guides/reading/inference-words" },
};
const TYPE_LABEL: Record<string, L> = {
  single: s("бір жауапты тапсырмалар", "задания с одним ответом"),
  context: s("контекст тапсырмалары", "задания на контекст"),
  matching: s("сәйкестік (2 балл)", "соответствие (2 балла)"),
  multi: s("бірнеше жауапты (2 балл)", "несколько ответов (2 балла)"),
};
const SUBJECT_LESSON: Record<string, string> = { math: "/guides/math/equations", physics: "/guides/physics/mechanics", chemistry: "/guides/chemistry/chemistry-basics", informatics: "/guides/informatics/number-systems" };

type Group = { key: string; label: string; path?: string; n: number; right: number };

export function MockAnalysis({ mock, answers, startedAt, finishedAt }: { mock: Mock; answers: Record<string, AnswerValue>; startedAt: number | null; finishedAt: number | null }) {
  const l = useLocale();
  const answered = (id: string) => answers[id] !== undefined && (!Array.isArray(answers[id]) || (answers[id] as number[]).length > 0);

  // group by topic (compulsory) and by section+task type (profile)
  const groups = new Map<string, Group>();
  let unanswered = 0;
  let twoPtN = 0, twoPtRight = 0, oneN = 0, oneRight = 0;
  for (const sec of mock.sections) {
    for (const q of sec.qs) {
      const ok = scoreQuestion(q, answers[q.id]) > 0;
      if (!answered(q.id)) unanswered++;
      if (q.points === 2) { twoPtN++; if (ok) twoPtRight++; } else { oneN++; if (ok) oneRight++; }
      const isProfile = ["math", "physics", "chemistry", "informatics"].includes(sec.id);
      const key = isProfile ? `${sec.id}:${q.topic ?? q.type}` : q.topic ?? sec.id;
      const info = !isProfile ? TOPIC_INFO[key] : undefined;
      const label = isProfile ? `${sec.name[l]}: ${TYPE_LABEL[q.topic ?? q.type]?.[l] ?? q.type}` : info?.label[l] ?? sec.name[l];
      const g = groups.get(key) ?? { key, label, path: isProfile ? SUBJECT_LESSON[sec.id] : info?.path, n: 0, right: 0 };
      g.n++;
      if (ok) g.right++;
      groups.set(key, g);
    }
  }
  const list = [...groups.values()].filter((g) => g.n >= 2);
  const weak = list.filter((g) => g.right / g.n < 0.6).sort((a, b) => a.right / a.n - b.right / b.n);
  const strong = list.filter((g) => g.right / g.n >= 0.8).sort((a, b) => b.right / b.n - a.right / a.n);

  const total = mock.sections.reduce((a, sec) => a + sec.qs.reduce((x, q) => x + scoreQuestion(q, answers[q.id]), 0), 0);
  const perSec = mock.sections.map((sec) => ({ sec, pts: sec.qs.reduce((x, q) => x + scoreQuestion(q, answers[q.id]), 0) }));
  const belowMin = perSec.filter((p) => p.pts < p.sec.min);
  const usedMin = startedAt && finishedAt ? Math.round((finishedAt - startedAt) / 60000) : null;
  const ranOut = usedMin !== null && usedMin >= mock.minutes;
  const fast = usedMin !== null && usedMin < mock.minutes * 0.4;
  const acc1 = oneN ? oneRight / oneN : 0;
  const acc2 = twoPtN ? twoPtRight / twoPtN : 1;
  const nat = THRESHOLDS.value.find((t) => t.id === "national")!.score;

  /* ───── Personal tips (rule-based on this attempt) ───── */
  const tips: { title: string; text: string; path?: string }[] = [];
  if (unanswered > 0)
    tips.push({ title: T(l, `${unanswered} тапсырма бос қалды`, `${unanswered} заданий без ответа`), text: T(l, "Бос жауап — кепілді 0 балл. Уақыт бітіп бара жатса, қалған сұрақтарға ең ықтимал нұсқаны белгілеңіз: алдымен анық қате 1–2 нұсқаны алып тастаңыз.", "Пустой ответ — гарантированный 0. Если время заканчивается, отметьте самый вероятный вариант: сначала исключите 1–2 явно неверных.") });
  if (belowMin.length)
    tips.push({ title: T(l, "Пәндік минимум орындалмады", "Не выполнен минимум по предмету"), text: T(l, `${belowMin.map((b) => b.sec.name[l]).join(", ")} — минимумға жетпесе, жалпы балл жоғары болса да шектен өтпейсіз. Келесі аптада алдымен осы пәнге күніне 30 минут бөліңіз.`, `${belowMin.map((b) => b.sec.name[l]).join(", ")} — без минимума порог не пройти даже с высоким общим баллом. На следующей неделе сначала уделяйте этому предмету 30 минут в день.`), path: belowMin[0].sec.id === "history" ? "/guides/history/independence" : belowMin[0].sec.id === "reading" ? "/guides/reading/details-scanning" : belowMin[0].sec.id === "mathlit" ? "/guides/mathlit/percent" : SUBJECT_LESSON[belowMin[0].sec.id] });
  if (ranOut)
    tips.push({ title: T(l, "Уақыт жетпеді", "Не хватило времени"), text: T(l, "2 минут ережесі: бір тапсырмаға 2 минуттан асса, белгілеп, келесіге өтіңіз. Алдымен оңай сұрақтарды жинаңыз, қиындарына соңында оралыңыз.", "Правило 2 минут: если задание занимает больше 2 минут — отметьте и идите дальше. Сначала соберите лёгкие вопросы, к трудным вернитесь в конце.") });
  if (fast && total < mock.max * 0.6)
    tips.push({ title: T(l, "Тым тез аяқтадыңыз", "Вы закончили слишком быстро"), text: T(l, `Тестті ${usedMin} минутта бітірдіңіз, ал дұрыс жауап аз. Асықпаңыз: шартты екі рет оқып, жауапты тексеруге уақыт жеткілікті.`, `Вы закончили за ${usedMin} мин, но верных ответов мало. Не спешите: времени хватает, чтобы читать условие дважды и проверять ответ.`) });
  if (twoPtN && acc2 < 0.5)
    tips.push({ title: T(l, "2 балдық тапсырмалар әлсіз", "Слабо с 2-балльными заданиями"), text: T(l, `${twoPtN} тапсырманың тек ${twoPtRight}-і дұрыс. Бұл бөлік бір пәнде 20 балл береді. Сәйкестікте алдымен ең сенімді жұпты қойыңыз; бірнеше жауаптыда әр нұсқаны «дұрыс/қате» деп жеке тексеріңіз.`, `Верно только ${twoPtRight} из ${twoPtN}. Эта часть даёт 20 баллов в предмете. В соответствии начинайте с самой уверенной пары; в нескольких ответах проверяйте каждый вариант отдельно как «верно/неверно».`), path: "/games/zhup-tap" });
  if (acc1 < 0.5 && acc2 >= 0.5)
    tips.push({ title: T(l, "Қарапайым сұрақтарда ұпай жоғалтып жатырсыз", "Теряете баллы на простых вопросах"), text: T(l, "1 балдық тапсырмалардың жартысынан көбі қате. Әдетте себебі — асығу. Әр жауаптан кейін «бұл сұраққа шынымен жауап береді ме?» деп 3 секунд тексеріңіз.", "Больше половины 1-балльных заданий неверно. Обычно причина — спешка. После каждого ответа 3 секунды проверяйте: «это действительно ответ на вопрос?».") });
  const join = (xs: string[]) => xs.join(", ").replace(/\.$/, "");
  const weakHistory = weak.filter((g) => TOPIC_INFO[g.key] && g.key in { ancient: 1, medieval: 1, khanate: 1, c19: 1, c20: 1, independence: 1 });
  if (weakHistory.length)
    tips.push({ title: T(l, "Тарих күндерін бекітіңіз", "Закрепите даты по истории"), text: T(l, `Әлсіз кезеңдер: ${join(weakHistory.map((g) => g.label.replace(/^Тарих: /, "")))}. Лайфхак: әр онжылдыққа бір «зәкір» оқиға байлаңыз (1916 — көтеріліс, 1917 — Алаш, 1936 — ҚазКСР) және «Хронология» ойынын күніне 5 минут ойнаңыз.`, `Слабые периоды: ${join(weakHistory.map((g) => g.label.replace(/^История: /, "")))}. Лайфхак: привяжите к каждому десятилетию «якорное» событие (1916 — восстание, 1917 — Алаш, 1936 — КазССР) и играйте в «Хронологию» по 5 минут в день.`), path: "/games/hronologiya" });
  if (weak.some((g) => ["detail", "main", "inference", "word", "purpose"].includes(g.key)))
    tips.push({ title: T(l, "Оқу сауаттылығы: тәсілді өзгертіңіз", "Чтение: смените стратегию"), text: T(l, "Алдымен 10 сұрақты оқып шығыңыз, сосын мәтінді оқыңыз — не іздеу керегін біліп оқисыз. Нақты ақпарат сұрақтарына бірінші жауап беріңіз, негізгі ой мен мақсатқа — соңында.", "Сначала прочитайте все 10 вопросов, потом текст — будете читать, зная, что искать. Сначала отвечайте на вопросы-детали, на главную мысль и цель — в конце."), path: "/tools/reading-drill" });
  if (weak.some((g) => ["percent", "ratio", "motion", "stats", "geometry"].includes(g.key)))
    tips.push({ title: T(l, "Мат. сауаттылық: жылдамдық пен дәлдік", "Матграмотность: скорость и точность"), text: T(l, "Бірліктерді есептің басында бірдей етіңіз (минут/сағат, см/км) және жеңілдікті көбейту арқылы есептеңіз (25% → × 0,75). «Базар күні» ойыны осы дағдыны жаттықтырады.", "Приводите единицы к одному виду в начале (минуты/часы, см/км) и считайте скидку умножением (25% → × 0,75). Игра «Базарный день» тренирует именно это."), path: "/games/bazar" });
  if (mock.pair && total >= nat && !belowMin.length)
    tips.push({ title: T(l, "Жақсы нәтиже — мақсатты көтеріңіз", "Хороший результат — поднимите цель"), text: T(l, "Ұлттық ЖОО шегінен өттіңіз. Енді грант балына қараңыз: калькулятордағы «қайда түсуге болады» тізімі қай мамандыққа тағы бірнеше балл жетпейтінін көрсетеді.", "Порог национальных вузов пройден. Теперь смотрите на проходной на грант: список «куда можно пройти» в калькуляторе покажет, где не хватает ещё нескольких баллов."), path: "/tools/score-calculator" });
  if (!tips.length) tips.push({ title: T(l, "Жүйелілік — басты лайфхак", "Главный лайфхак — регулярность"), text: T(l, "Әр 2 апта сайын толық пробный тест тапсырып, қателер журналын жүргізіңіз. Бір қатені екі рет қайталамау — балды тез өсіреді.", "Каждые 2 недели сдавайте полный пробник и ведите журнал ошибок. Не повторять одну ошибку дважды — самый быстрый рост балла.") });

  return (
    <div className="mt-8 space-y-6">
      <section className="rounded-[24px] bg-card p-6 shadow-soft-ring" aria-labelledby="mistakes-h">
        <h2 id="mistakes-h" className="text-[20px] text-ink">{T(l, "Не дұрыс болмады", "Что пошло не так")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: AlertTriangle, k: T(l, "Бос қалған", "Без ответа"), v: `${unanswered}`, bad: unanswered > 0 },
            { icon: TrendingDown, k: T(l, "1 балдық дәлдік", "Точность 1-балльных"), v: `${Math.round(acc1 * 100)}%`, bad: acc1 < 0.6 },
            { icon: TrendingDown, k: T(l, "2 балдық дәлдік", "Точность 2-балльных"), v: twoPtN ? `${Math.round(acc2 * 100)}%` : "—", bad: twoPtN > 0 && acc2 < 0.6 },
            { icon: Clock, k: T(l, "Уақыт", "Время"), v: usedMin !== null ? `${usedMin} / ${mock.minutes} ${T(l, "мин", "мин")}` : "—", bad: ranOut },
          ].map((c) => (
            <div key={c.k} className={cn("rounded-2xl p-4", c.bad ? "bg-primary-tint" : "bg-surface")}>
              <c.icon aria-hidden className={cn("size-5", c.bad ? "text-primary" : "text-muted")} />
              <div className="mt-1 text-[12px] font-bold text-muted">{c.k}</div>
              <div className="font-display text-[22px] text-ink">{c.v}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-[24px] bg-card p-6 shadow-soft-ring">
          <h2 className="flex items-center gap-2 text-[18px] text-ink"><TrendingDown className="size-5 text-primary" aria-hidden />{T(l, "Әлсіз тақырыптар", "Слабые темы")}</h2>
          {weak.length ? (
            <ul className="mt-3 space-y-2">
              {weak.slice(0, 8).map((g) => (
                <li key={g.key} className="flex items-center justify-between gap-3 rounded-xl bg-primary-tint px-3 py-2 text-[14px]">
                  <span className="font-bold text-ink">{g.label}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="font-extrabold text-primary-deep">{g.right}/{g.n}</span>
                    {g.path && (
                      <Link href={lp(l, g.path)} className="text-[12px] font-extrabold text-info-text underline underline-offset-2">
                        {T(l, "Сабақ", "Урок")}
                      </Link>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[14px] text-muted">{T(l, "Айқын әлсіз тақырып жоқ — жарайсыз!", "Явно слабых тем нет — отлично!")}</p>
          )}
        </div>
        <div className="rounded-[24px] bg-card p-6 shadow-soft-ring">
          <h2 className="flex items-center gap-2 text-[18px] text-ink"><TrendingUp className="size-5 text-success" aria-hidden />{T(l, "Күшті тақырыптар", "Сильные темы")}</h2>
          {strong.length ? (
            <ul className="mt-3 space-y-2">
              {strong.slice(0, 8).map((g) => (
                <li key={g.key} className="flex items-center justify-between gap-3 rounded-xl bg-[#E7F8EF] px-3 py-2 text-[14px] dark:bg-surface">
                  <span className="font-bold text-ink">{g.label}</span>
                  <span className="font-extrabold text-[#0A8A50]">{g.right}/{g.n}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-[14px] text-muted">{T(l, "Әзірге 80%-дан жоғары тақырып жоқ.", "Пока нет тем выше 80%.")}</p>
          )}
        </div>
      </section>

      <section className="rounded-[24px] bg-info-bg p-6" aria-labelledby="tips-h">
        <h2 id="tips-h" className="flex items-center gap-2 text-[20px] text-ink"><Lightbulb className="size-5 text-info" aria-hidden />{T(l, "Келесі жолы не істеу керек", "Что сделать в следующий раз")}</h2>
        <ol className="mt-4 space-y-3">
          {tips.map((t, i) => (
            <li key={i} className="rounded-2xl bg-card p-4">
              <p className="text-[15px] font-extrabold text-ink">{i + 1}. {t.title}</p>
              <p className="mt-1 text-[14px] leading-6 text-body">{t.text}</p>
              {t.path && (
                <Link href={lp(l, t.path)} className="mt-2 inline-block text-[13px] font-extrabold text-info-text underline underline-offset-4">
                  {T(l, "Жаттығуға өту →", "Перейти к практике →")}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
