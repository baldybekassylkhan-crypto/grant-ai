import Link from "next/link";
import { PlanButton } from "@/components/ui/PlanAware";
import { notFound } from "next/navigation";
import { GameApp } from "@/components/games/Games";
import { Button } from "@/components/ui/Button";
import { JsonLd } from "@/components/ui/misc";
import { GAMES, SAMPLE_PROMPTS, gameBySlug, type GameSlug } from "@/content/games";
import { UI } from "@/content/ui";
import { LOCALES, asLocale, lp, type Locale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => GAMES.map((g) => ({ locale, slug: g.slug })));
}

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  const g = gameBySlug(slug);
  if (!g) return {};
  return pageMeta({ locale: l, path: `/games/${g.slug}`, title: `${g.title[l]} — ${l === "kk" ? "тегін жаттығу" : "бесплатная практика"}`, description: g.oneLiner[l] });
}

function PlanCtaCard({ l }: { l: Locale }) {
  return (
    <div className="flex flex-col items-start justify-between gap-5 rounded-[20px] bg-card p-6 shadow-soft-ring sm:flex-row sm:items-center">
      <div>
        <p className="eyebrow text-primary-deep">{UI.freePlan2min[l]}</p>
        <h2 className="mt-1 text-[20px] text-ink md:text-[24px]">{l === "kk" ? "Жаттығуды нақты дайындыққа айналдырыңыз" : "Превратите практику в настоящую подготовку"}</h2>
        <p className="mt-1 text-[15px] text-muted">{l === "kk" ? "Бірнеше сұраққа жауап беріп, тест күніңізге қарай жоспар алыңыз." : "Ответьте на несколько вопросов и получите план под дату теста."}</p>
      </div>
      <PlanButton href={lp(l, "/quiz")} size="lg" className="shrink-0">
        {UI.buildMyPlan[l]}
      </PlanButton>
    </div>
  );
}

export default async function GamePage({ params }: P) {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  const game = gameBySlug(slug);
  if (!game) notFound();
  const others = GAMES.filter((g) => g.slug !== game.slug);

  return (
    <div className="bg-page pb-24 pt-10">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "Quiz", name: game.title[l], description: game.oneLiner[l], inLanguage: l, educationalLevel: "ҰБТ / ЕНТ", isAccessibleForFree: true }} />
      <div className="mx-auto max-w-[860px] px-4 md:px-6">
        <h1 className="text-[24px] leading-tight text-ink md:text-[30px]">{game.title[l]}</h1>
        <p className="mt-2 max-w-2xl text-[16px] leading-6 text-muted">{game.intro[l]}</p>

        <div className="mt-6">
          <GameApp slug={game.slug as GameSlug} />
        </div>

        <div className="mt-8">
          <PlanCtaCard l={l} />
        </div>

        <section className="mt-12" aria-labelledby="why">
          <h2 id="why" className="text-[22px] text-ink">
            {l === "kk" ? "Бұл жаттығу неге пайдалы" : "Почему это помогает"}
          </h2>
          <p className="mt-3 text-[17px] leading-7 text-body">{game.why[l]}</p>
        </section>

        <section className="mt-12" aria-labelledby="more">
          <h2 id="more" className="text-[22px] text-ink">
            {l === "kk" ? "Тағы тегін жаттығулар" : "Ещё бесплатная практика"}
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {others.map((g, i) => (
              <div key={g.slug} className="group relative overflow-hidden rounded-[20px] bg-card p-5 shadow-soft-ring">
                <h3 className="font-display text-[17px] text-ink">{g.title[l]}</h3>
                <p className="mt-1 text-[14px] text-muted">{g.oneLiner[l]}</p>
                {i === 0 && (
                  <div className="marquee fade-edges mt-4 overflow-hidden" aria-hidden style={{ ["--marquee-duration" as string]: "24s" }}>
                    <ul className="marquee-track flex w-max gap-2">
                      {[...SAMPLE_PROMPTS, ...SAMPLE_PROMPTS].map((p, k) => (
                        <li key={k} className="whitespace-nowrap rounded-full bg-info-bg px-3 py-1 text-[12px] font-bold text-info-text">
                          {p[l]}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <Link href={lp(l, `/games/${g.slug}`)} className="mt-4 inline-flex min-h-10 items-center text-[14px] font-extrabold text-primary-deep after:absolute after:inset-0 group-hover:underline">
                  {UI.playFree[l]}
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
