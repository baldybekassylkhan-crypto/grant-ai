import { Fragment } from "react";
import { PlanButton } from "@/components/ui/PlanAware";
import { ToolCard } from "@/components/tools/shared";
import { Button } from "@/components/ui/Button";
import { FaqAccordion } from "@/components/ui/client";
import { CtaBand, JsonLd, SectionHeading } from "@/components/ui/misc";
import { TOOL_GROUPS, TOOLS } from "@/content/tools";
import { UI } from "@/content/ui";
import { asLocale, lp, type L } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { faqLd, pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const l = asLocale((await params).locale);
  return pageMeta({
    locale: l,
    path: "/tools",
    title: l === "kk" ? "ҰБТ-ға тегін құралдар" : "Бесплатные инструменты для ЕНТ",
    description: l === "kk" ? "ҰБТ балын есептеу, грант мүмкіндігі, ЖОО анықтамалығы, сұрақ генераторы және дайындық жоспары." : "Калькулятор баллов ЕНТ, шансы на грант, справочник вузов, генератор вопросов и план подготовки.",
  });
}

const FAQS: { q: L; a: L }[] = [
  { q: { kk: "Құралдар шынымен тегін бе?", ru: "Инструменты правда бесплатные?" }, a: { kk: "Иә. Тіркелусіз қолдануға болады.", ru: "Да. Можно пользоваться без регистрации." } },
  { q: { kk: "Деректерім сақтала ма?", ru: "Мои данные сохраняются?" }, a: { kk: "Жоқ. Мәндер тек браузерде және бет сілтемесінде.", ru: "Нет. Значения только в браузере и в адресе страницы." } },
  { q: { kk: "Сандар қайдан алынған?", ru: "Откуда взяты цифры?" }, a: { kk: "Формат пен шекті балдар — Ұлттық тестілеу орталығының ресми сайтынан (testcenter.kz), 2026 жыл.", ru: "Формат и пороги — с официального сайта Национального центра тестирования (testcenter.kz), 2026 год." } },
  { q: { kk: "Нәтиже ресми ме?", ru: "Результат официальный?" }, a: { kk: "Жоқ. Бұл — дайындыққа арналған есептер. Ресми нәтиже тек testcenter.kz-те.", ru: "Нет. Это расчёты для подготовки. Официальный результат — только на testcenter.kz." } },
];

const COLS: Record<number, string> = { 1: "md:grid-cols-1", 2: "md:grid-cols-2", 3: "md:grid-cols-2 lg:grid-cols-3" };

export default async function ToolsIndex({ params }: P) {
  const l = asLocale((await params).locale);
  const faqs = FAQS.map((f) => ({ q: f.q[l], a: f.a[l] }));
  return (
    <div className="bg-page pb-24 pt-8">
      <JsonLd data={faqLd(faqs)} />
      <div className="container-site">
        <h1 className="text-[32px] leading-[1.1] text-ink md:text-[52px]">{l === "kk" ? "ҰБТ-ға тегін құралдар" : "Бесплатные инструменты для ЕНТ"}</h1>
        <p className="mt-4 max-w-[600px] text-[17px] leading-7 text-muted">
          {l === "kk" ? "Дайындықтың нақты міндеттеріне арналған жылдам құралдар. Тіркелусіз, ештеңе сақталмайды." : "Быстрые инструменты для конкретных задач подготовки. Без регистрации, ничего не сохраняется."}
        </p>

        {TOOL_GROUPS.map((g, gi) => {
          const tools = TOOLS.filter((t) => t.group === g.id);
          return (
            <Fragment key={g.id}>
              {gi === 3 && (
                <div className="mt-14 flex flex-col items-start justify-between gap-4 rounded-[20px] bg-info-bg p-6 sm:flex-row sm:items-center">
                  <p className="text-[17px] font-extrabold text-ink">{l === "kk" ? "Неден бастау керегін білмейсіз бе?" : "Не знаете, с чего начать?"}</p>
                  <PlanButton href={lp(l, "/quiz")} variant="blue">
                    {UI.myPlan[l]}
                  </PlanButton>
                </div>
              )}
              <section className="mt-14" aria-labelledby={`g-${g.id}`}>
                <SectionHeading id={`g-${g.id}`} title={g.title[l]} sub={g.description[l]} />
                <div className={cn("mt-6 grid grid-cols-1 gap-4", COLS[Math.min(3, tools.length)])}>
                  {tools.map((t) => (
                    <ToolCard key={t.slug} tool={t} locale={l} />
                  ))}
                </div>
              </section>
            </Fragment>
          );
        })}

        <section className="mt-20 max-w-[860px]" aria-labelledby="tools-faq">
          <SectionHeading id="tools-faq" title={UI.faq[l]} />
          <FaqAccordion items={faqs} className="mt-6" />
        </section>

        <CtaBand
          className="mt-20"
          tone="primary"
          title={l === "kk" ? "Толық жоспарға дайынсыз ба?" : "Готовы к полному плану?"}
          sub={l === "kk" ? "Бірнеше сұраққа жауап беріңіз — grant.ai тест күніңізге қарай жоспар құрады." : "Ответьте на несколько вопросов — grant.ai составит план под дату вашего теста."}
          cta={UI.start[l]}
          href={lp(l, "/quiz")}
        />
      </div>
    </div>
  );
}
