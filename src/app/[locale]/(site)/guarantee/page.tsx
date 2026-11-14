import { Button } from "@/components/ui/Button";
import { PlanButton } from "@/components/ui/PlanAware";
import { Seal } from "@/components/ui/Illustrations";
import { JsonLd } from "@/components/ui/misc";
import { UI } from "@/content/ui";
import { asLocale, lp, type L } from "@/lib/i18n";
import { faqLd, pageMeta } from "@/lib/seo";
import { SUPPORT_EMAIL } from "@/lib/site";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const l = asLocale((await params).locale);
  return pageMeta({
    locale: l,
    path: "/guarantee",
    title: l === "kk" ? "Балды көтеру кепілдігі" : "Гарантия роста балла",
    description: l === "kk" ? "grant.ai кепілдігі қалай жұмыс істейді, кімге тиесілі және қалай өтінім беруге болады." : "Как работает гарантия grant.ai, кому она доступна и как подать заявку.",
  });
}

const STEPS: { title: L; text: L }[] = [
  { title: { kk: "Диагностикадан өтіңіз", ru: "Пройдите диагностику" }, text: { kk: "Бастапқы балыңыз тіркеледі.", ru: "Фиксируется ваш стартовый балл." } },
  { title: { kk: "Жоспарды орындаңыз", ru: "Выполните план" }, text: { kk: "Барлық қадамды және [N] пробный тестті тест күніне дейін бітіріңіз.", ru: "Пройдите все шаги и [N] пробных тестов до даты теста." } },
  { title: { kk: "Нәтижені салыстырыңыз", ru: "Сравните результат" }, text: { kk: "Балыңыз [X] балға өспесе — төмендегі шарттармен өтінім беріңіз.", ru: "Если балл не вырос на [X] — подайте заявку по условиям ниже." } },
];

const CRITERIA: { lead: L; text: L }[] = [
  { lead: { kk: "Жоспар толық орындалды.", ru: "План выполнен полностью." }, text: { kk: "Барлық қадам «орындалды» деп белгіленген. [CRITERIA DETAIL]", ru: "Все шаги отмечены как выполненные. [CRITERIA DETAIL]" } },
  { lead: { kk: "Пробный тесттер тапсырылды.", ru: "Пробные тесты сданы." }, text: { kk: "Диагностика және қорытынды пробный тест толық форматта (120 тапсырма) тапсырылды.", ru: "Диагностика и итоговый пробник сданы в полном формате (120 заданий)." } },
  { lead: { kk: "Мерзім сақталды.", ru: "Сроки соблюдены." }, text: { kk: "Өтінім [CLAIM WINDOW] ішінде берілді.", ru: "Заявка подана в течение [CLAIM WINDOW]." } },
  { lead: { kk: "Бір аккаунтқа бір өтінім.", ru: "Одна заявка на аккаунт." }, text: { kk: "[CRITERIA DETAIL]", ru: "[CRITERIA DETAIL]" } },
];

const FAQS: { q: L; a: L }[] = [
  { q: { kk: "Кепілдік грант алуды білдіре ме?", ru: "Гарантия означает получение гранта?" }, a: { kk: "Жоқ. Грант пен ресми нәтижені ешкім кепілдендіре алмайды. Кепілдік пробный тест балының өсуіне қатысты.", ru: "Нет. Грант и официальный результат никто не может гарантировать. Гарантия касается роста балла на пробных тестах." } },
  { q: { kk: "Өтінім қанша уақытта қаралады?", ru: "Сколько рассматривается заявка?" }, a: { kk: "[CLAIM PROCESSING TIME]", ru: "[CLAIM PROCESSING TIME]" } },
  { q: { kk: "Ресми ҰБТ нәтижесі есептеле ме?", ru: "Учитывается ли официальный результат ЕНТ?" }, a: { kk: "[ANSWER]", ru: "[ANSWER]" } },
];

export default async function GuaranteePage({ params }: P) {
  const l = asLocale((await params).locale);
  return (
    <div className="bg-page">
      <JsonLd data={faqLd(FAQS.map((f) => ({ q: f.q[l], a: f.a[l] })))} />
      <article className="mx-auto max-w-[720px] px-4 pb-24 pt-14 md:px-6">
        <header className="text-center">
          <Seal className="mx-auto" />
          <h1 className="mt-6 text-[28px] leading-[1.15] text-ink md:text-[38px]">{l === "kk" ? "Балды көтеру кепілдігі" : "Гарантия роста балла"}</h1>
          <p className="mx-auto mt-4 max-w-lg text-[17px] leading-7 text-muted">
            {l === "kk" ? "grant.ai жоспарын соңына дейін орындаңыз. Балыңыз өспесе — біз [GUARANTEE REMEDY]." : "Пройдите план grant.ai до конца. Если балл не вырастет — мы [GUARANTEE REMEDY]."}
          </p>
        </header>

        <section className="mt-14" aria-labelledby="how">
          <h2 id="how" className="text-[22px] text-ink">{l === "kk" ? "Қалай жұмыс істейді" : "Как это работает"}</h2>
          <ol className="mt-6 grid gap-4 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <li key={i} className="rounded-[20px] bg-card p-5 ring-line">
                <span className="font-display text-[24px] text-primary">{i + 1}</span>
                <h3 className="mt-2 text-[16px] font-extrabold text-ink">{s.title[l]}</h3>
                <p className="mt-1 text-[14px] leading-6 text-muted">{s.text[l]}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14" aria-labelledby="criteria">
          <h2 id="criteria" className="text-[22px] text-ink">{l === "kk" ? "Шарттар" : "Условия"}</h2>
          <p className="mt-2 text-[16px] leading-6 text-muted">{l === "kk" ? "Мына шарттардың бәрі орындалса, өтінім бере аласыз:" : "Подать заявку можно, если выполнены все условия:"}</p>
          <ul className="mt-6 space-y-3">
            {CRITERIA.map((c, i) => (
              <li key={i} className="relative rounded-2xl bg-card py-3.5 pl-8 pr-5 ring-line">
                <span aria-hidden className="absolute bottom-3 left-4 top-3 w-1 rounded-full bg-success" />
                <strong className="font-extrabold text-ink">{c.lead[l]}</strong> <span className="text-muted">{c.text[l]}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14 space-y-4 text-[16px] leading-7 text-muted" aria-labelledby="timeline">
          <h2 id="timeline" className="text-[22px] text-ink">{l === "kk" ? "Мерзімдер" : "Сроки"}</h2>
          <p>
            <strong className="text-ink">{l === "kk" ? "Бастамас бұрын:" : "Перед стартом:"}</strong>{" "}
            {l === "kk" ? "сауалнамада тест сессиясын таңдаңыз — жоспар соған қарай құрылады." : "выберите сессию теста в опросе — план строится под неё."}
          </p>
          <p>
            <strong className="text-ink">{l === "kk" ? "Өтінім беру:" : "Как подать заявку:"}</strong>{" "}
            {l === "kk" ? `аккаунт поштасынан ${SUPPORT_EMAIL} адресіне «Кепілдік» тақырыбымен [CLAIM WINDOW] ішінде жазыңыз.` : `напишите с почты аккаунта на ${SUPPORT_EMAIL} с темой «Гарантия» в течение [CLAIM WINDOW].`}
          </p>
        </section>

        <section className="mt-14" aria-labelledby="terms">
          <h2 id="terms" className="text-[22px] text-ink">{l === "kk" ? "Жалпы ережелер" : "Общие положения"}</h2>
          <ul className="mt-4 space-y-2 text-[15px] leading-6 text-muted">
            {["[TERM 1]", "[TERM 2]", l === "kk" ? "Кепілдік грант беру туралы шешімдерге және ресми ҰБТ нәтижесіне қолданылмайды." : "Гарантия не распространяется на решения о грантах и официальный результат ЕНТ."].map((t) => (
              <li key={t} className="relative pl-5">
                <span aria-hidden className="absolute left-0 top-[9px] size-1.5 rounded-full bg-muted" />
                {t}
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14" aria-labelledby="gfaq">
          <h2 id="gfaq" className="text-[22px] text-ink">FAQ</h2>
          <dl className="mt-4 space-y-5">
            {FAQS.map((f, i) => (
              <div key={i}>
                <dt className="text-[16px] font-extrabold text-ink">{f.q[l]}</dt>
                <dd className="mt-1 text-[15px] leading-6 text-muted">{f.a[l]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mt-14 flex justify-center">
          <PlanButton href={lp(l, "/quiz")} size="lg">
            {UI.buildMyPlan[l]}
          </PlanButton>
        </div>
      </article>
    </div>
  );
}
