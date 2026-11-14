import Link from "next/link";
import { notFound } from "next/navigation";
import { CalculatorTool } from "@/components/tools/Calculator";
import { ConverterTool } from "@/components/tools/Converter";
import { DirectoryTool } from "@/components/tools/Directory";
import { GeneratorTool } from "@/components/tools/Generator";
import { DataTable, ToolCard, ToolHero } from "@/components/tools/shared";
import { FaqAccordion } from "@/components/ui/client";
import { CtaBand, Inline, JsonLd } from "@/components/ui/misc";
import { TOOLS, cell, toolBySlug } from "@/content/tools";
import { UI } from "@/content/ui";
import { LOCALES, asLocale, lp } from "@/lib/i18n";
import { cn } from "@/lib/cn";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type P = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => TOOLS.map((t) => ({ locale, slug: t.slug })));
}

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  const t = toolBySlug(slug);
  if (!t) return {};
  return pageMeta({ locale: l, path: `/tools/${t.slug}`, title: t.title[l], description: t.description[l] });
}

export default async function ToolPage({ params }: P) {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  const tool = toolBySlug(slug);
  if (!tool) notFound();
  const related = tool.related.map((s) => toolBySlug(s)).filter(Boolean) as typeof TOOLS;
  const faqs = tool.faqs.map((f) => ({ q: f.q[l], a: f.a[l] }));
  const crumbs = [
    { label: UI.home[l], href: lp(l) },
    { label: UI.freeTools[l], href: lp(l, "/tools") },
    { label: tool.short[l], href: lp(l, `/tools/${tool.slug}`) },
  ];

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: tool.title[l],
          description: tool.description[l],
          url: `${SITE_URL}${lp(l, `/tools/${tool.slug}`)}`,
          applicationCategory: "EducationalApplication",
          operatingSystem: "Any",
          inLanguage: l,
          offers: { "@type": "Offer", price: "0", priceCurrency: "KZT" },
        }}
      />
      <JsonLd data={faqLd(faqs)} />
      <JsonLd data={breadcrumbLd(crumbs)} />

      <ToolHero tool={tool} locale={l} />

      <section id="tool" aria-label={tool.title[l]} className="scroll-mt-20 bg-page pb-16 pt-8">
        <div className="container-site">
          {tool.variant === "calculator" && <CalculatorTool slug={tool.slug} />}
          {tool.variant === "directory" && <DirectoryTool />}
          {tool.variant === "generator" && <GeneratorTool flavour={tool.flavour} />}
          {tool.variant === "converter" && <ConverterTool accentIndex={tool.accentIndex} />}
        </div>
      </section>

      {tool.explainer.map((sec, i) => (
        <section key={i} className={cn("py-14", i % 2 === 0 ? "bg-info-bg" : "bg-page")}>
          <div className="mx-auto max-w-[760px] px-4 md:px-6">
            <h2 className="text-[24px] leading-[1.2] text-ink md:text-[30px]">{sec.heading[l]}</h2>
            <div className="mt-5 space-y-5 text-[17px] leading-[29px] text-body md:text-[19px] md:leading-[31.35px]">
              {sec.paragraphs.map((p, j) => (
                <p key={j}>
                  <Inline text={p[l]} />
                </p>
              ))}
            </div>
            {sec.table && <DataTable className="mt-8" head={sec.table.head.map((h) => h[l])} rows={sec.table.rows.map((r) => r.map((c) => cell(c, l)))} />}
          </div>
        </section>
      ))}

      <section className={cn("py-14", tool.explainer.length % 2 === 0 ? "bg-info-bg" : "bg-page")}>
        <div className="mx-auto max-w-[760px] space-y-12 px-4 md:px-6">
          {related.length > 0 && (
            <div>
              <h2 className="text-[24px] text-ink md:text-[30px]">{UI.relatedTools[l]}</h2>
              <div className="mt-6 grid gap-4">
                {related.map((t) => (
                  <ToolCard key={t.slug} tool={t} locale={l} />
                ))}
              </div>
            </div>
          )}
          <div>
            <h2 className="text-[24px] text-ink md:text-[30px]">{UI.faq[l]}</h2>
            <FaqAccordion items={faqs} className="mt-6" />
          </div>
          <CtaBand
            title={l === "kk" ? "Бүкіл дайындықты жоспарлайық па?" : "Спланируем всю подготовку?"}
            sub={l === "kk" ? "Тест күніңізге қарай тегін қадамдық жоспар." : "Бесплатный пошаговый план под дату вашего теста."}
            cta={UI.start[l]}
            href={lp(l, "/quiz")}
            tone="primary"
          />
          <p className="text-center text-[14px] font-bold text-muted">
            <Link href={lp(l, "/tools")} className="underline underline-offset-4 hover:text-ink">
              {UI.allTools[l]}
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
