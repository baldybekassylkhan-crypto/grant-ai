import Link from "next/link";
import { PlanButton, PlanCtaCard } from "@/components/ui/PlanAware";
import { notFound } from "next/navigation";
import { Calendar, Clock } from "lucide-react";
import { ArticleBlock, AuthorBox, CtaCard, GuideList, HubLink, SummaryBox } from "@/components/guides/blocks";
import { ReadingBar, StickyCta, Toc } from "@/components/guides/article-client";
import { Button } from "@/components/ui/Button";
import { FaqDetails } from "@/components/ui/client";
import { MascotAvatar } from "@/components/ui/Logo";
import { Breadcrumbs, JsonLd } from "@/components/ui/misc";
import { GUIDES, authorBySlug, categoryBySlug, guideBy, guidePath, guidesIn, readMinutes } from "@/content/guides";
import { UI } from "@/content/ui";
import { fmtDate } from "@/content/unt-config";
import { LOCALES, asLocale, lp } from "@/lib/i18n";
import { breadcrumbLd, faqLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type P = { params: Promise<{ locale: string; category: string; slug: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => GUIDES.map((g) => ({ locale, category: g.category, slug: g.slug })));
}

export async function generateMetadata({ params }: P) {
  const { locale, category, slug } = await params;
  const l = asLocale(locale);
  const g = guideBy(category, slug);
  if (!g) return {};
  return pageMeta({ locale: l, path: guidePath(g), title: g.title[l], description: g.description[l] });
}

export default async function GuidePage({ params }: P) {
  const { locale, category, slug } = await params;
  const l = asLocale(locale);
  const guide = guideBy(category, slug);
  const cat = categoryBySlug(category);
  if (!guide || !cat) notFound();
  const author = authorBySlug(guide.author)!;
  const toc = guide.blocks.flatMap((b) => (b.type === "h2" ? [{ id: b.id, text: b.text[l] }] : []));
  const siblings = guidesIn(cat.slug);
  const related = siblings.filter((g) => g.slug !== guide.slug).slice(0, 4);
  const faqs = guide.faqs.map((f) => ({ q: f.q[l], a: f.a[l] }));
  const crumbs = [
    { label: UI.guides[l], href: lp(l, "/guides") },
    { label: cat.name[l], href: lp(l, `/guides/${cat.slug}`) },
  ];
  const url = `${SITE_URL}${lp(l, guidePath(guide))}`;

  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: guide.title[l],
          description: guide.description[l],
          inLanguage: l,
          dateModified: guide.updated,
          datePublished: guide.updated,
          author: { "@type": "Organization", name: author.name[l], url: `${SITE_URL}${lp(l, `/authors/${author.slug}`)}` },
          publisher: { "@type": "Organization", name: "grant.ai" },
          mainEntityOfPage: url,
        }}
      />
      <JsonLd data={breadcrumbLd([...crumbs, { label: guide.title[l], href: lp(l, guidePath(guide)) }])} />
      <JsonLd data={faqLd(faqs)} />
      <ReadingBar />

      <div className="bg-card">
        <div className="mx-auto grid max-w-[1280px] justify-center px-4 pb-24 pt-0 md:px-6 lg:grid-cols-[232px_minmax(0,672px)] lg:gap-x-10 lg:pt-10 xl:grid-cols-[232px_672px_240px]">
          <aside className="contents lg:block">
            <Toc items={toc} />
          </aside>

          <article id="article" className="min-w-0 pt-6 lg:pt-0">
            <Breadcrumbs items={crumbs} sep="•" className="text-[15px]" />
            <h1 className="mt-4 text-[30px] leading-[1.12] text-ink md:text-[46px] md:leading-[54px]">{guide.title[l]}</h1>
            <p className="mt-5 text-[19px] leading-[30px] text-body md:text-[21px] md:leading-[32.5px]">{guide.lede[l]}</p>

            <div className="mb-10 mt-7 flex items-center gap-3">
              <MascotAvatar size={44} bg={author.avatarBg} />
              <div>
                <Link href={lp(l, `/authors/${author.slug}`)} className="text-[17px] font-extrabold text-ink underline-offset-4 hover:underline">
                  {author.name[l]}
                </Link>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[15px] font-semibold text-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar aria-hidden className="size-4" /> {UI.updated[l]} <time dateTime={guide.updated}>{fmtDate(guide.updated, l)}</time>
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Clock aria-hidden className="size-4" /> {readMinutes(guide, l)} {UI.minRead[l]}
                  </span>
                </div>
              </div>
            </div>

            <SummaryBox items={guide.summary} locale={l} />

            {guide.blocks.map((b, i) => (
              <ArticleBlock key={i} b={b} locale={l} />
            ))}

            <div className="mt-6">
              <FaqDetails items={faqs} />
            </div>

            <p className="mt-12 text-[18px] leading-[30px] text-body md:text-[19px] md:leading-[31.35px]">{guide.closing[l]}</p>
            <PlanCtaCard title={UI.buildMyPlan[l]} sub={UI.railSub[l]} href={lp(l, "/quiz")} />

            <HubLink name={cat.name[l]} href={lp(l, `/guides/${cat.slug}`)} count={siblings.length} locale={l} />
            <AuthorBox author={author} locale={l} />

            {related.length > 0 && (
              <section className="mt-14" aria-labelledby="related">
                <h2 id="related" className="mb-4 text-[24px] text-ink md:text-[28px]">
                  {UI.relatedGuides[l]}
                </h2>
                <GuideList guides={related} locale={l} />
              </section>
            )}
          </article>

          <aside className="hidden xl:block" aria-label={UI.getStarted[l]}>
            <div className="sticky top-24 rounded-[20px] bg-surface p-[22px]">
              <p className="font-display text-[18px] leading-[24px] text-ink">{UI.railTitle[l]}</p>
              <p className="mt-2 text-[14px] text-muted">{UI.railSub[l]}</p>
              <PlanButton href={lp(l, "/quiz")} className="mt-4 w-full whitespace-normal py-2 leading-tight">
                {UI.railCta[l]}
              </PlanButton>
            </div>
          </aside>
        </div>
      </div>
      <StickyCta />
    </>
  );
}
