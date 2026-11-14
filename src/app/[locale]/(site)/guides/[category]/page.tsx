import { notFound } from "next/navigation";
import { PlanButton } from "@/components/ui/PlanAware";
import { GlanceCard, GuideList } from "@/components/guides/blocks";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs, CtaBand, JsonLd } from "@/components/ui/misc";
import { CATEGORIES, categoryBySlug, guidesIn } from "@/content/guides";
import { UI } from "@/content/ui";
import { LOCALES, asLocale, lp } from "@/lib/i18n";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string; category: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => CATEGORIES.map((c) => ({ locale, category: c.slug })));
}

export async function generateMetadata({ params }: P) {
  const { locale, category } = await params;
  const l = asLocale(locale);
  const c = categoryBySlug(category);
  if (!c) return {};
  return pageMeta({ locale: l, path: `/guides/${c.slug}`, title: c.name[l], description: c.intro[l] });
}

export default async function CategoryPage({ params }: P) {
  const { locale, category } = await params;
  const l = asLocale(locale);
  const cat = categoryBySlug(category);
  if (!cat) notFound();
  const crumbs = [
    { label: UI.guides[l], href: lp(l, "/guides") },
    { label: cat.name[l], href: lp(l, `/guides/${cat.slug}`) },
  ];
  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <section className="bg-info-bg pb-14 pt-10">
        <div className="container-site grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <Breadcrumbs items={crumbs} sep="•" />
            <h1 className="mt-4 text-[30px] leading-[1.12] text-ink md:text-[42px]">{cat.name[l]}</h1>
            <p className="mt-4 max-w-[640px] text-[17px] leading-7 text-muted md:text-[19px]">{cat.intro[l]}</p>
            <PlanButton href={lp(l, "/quiz")} size="lg" className="mt-6">
              {UI.buildMyPlan[l]}
            </PlanButton>
          </div>
          <GlanceCard title={UI.atAGlance[l]} items={cat.glance} locale={l} />
        </div>
      </section>
      <div className="bg-card pb-24 pt-10">
        <div className="mx-auto max-w-[780px] px-4 md:px-6">
          <h2 className="sr-only">{cat.name[l]}</h2>
          <GuideList guides={guidesIn(cat.slug)} locale={l} />
        </div>
        <div className="container-site mt-16">
          <CtaBand
            title={l === "kk" ? "Білгеніңізді жаттығуда қолданыңыз" : "Закрепите знания на практике"}
            sub={l === "kk" ? "Тест күніңізге қарай тегін жоспар алыңыз." : "Получите бесплатный план под дату теста."}
            cta={UI.start[l]}
            href={lp(l, "/quiz")}
          />
        </div>
      </div>
    </>
  );
}
