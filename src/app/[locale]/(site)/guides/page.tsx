import Link from "next/link";
import { GuidesBrowser } from "@/components/guides/nav";
import { CATEGORIES, GUIDES, categoryAccent, guidePath, guidesIn } from "@/content/guides";
import { SESSION_LABEL, type SessionId } from "@/content/unt-config";
import { asLocale, lp } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const l = asLocale((await params).locale);
  return pageMeta({
    locale: l,
    path: "/guides",
    title: l === "kk" ? "ҰБТ-ға дайындық нұсқаулықтары" : "Гайды по подготовке к ЕНТ",
    description: l === "kk" ? "ҰБТ форматы, пәндер, шекті балдар, гранттар және дайындық жоспары туралы нұсқаулықтар." : "Гайды о формате ЕНТ, предметах, порогах, грантах и плане подготовки.",
  });
}

const WHEN: (SessionId | "undecided")[] = ["january", "march", "main", "august", "undecided"];

export default async function GuidesIndex({ params }: P) {
  const l = asLocale((await params).locale);
  return (
    <div className="bg-card pb-24 pt-10">
      <div className="container-site">
        <h1 className="text-[32px] leading-[1.1] text-ink md:text-[52px]">{l === "kk" ? "ҰБТ нұсқаулықтары" : "Гайды по ЕНТ"}</h1>
        <p className="mt-4 max-w-[640px] text-[17px] leading-7 text-muted">
          {l === "kk" ? "Форматтан бастап грантқа өтінім беруге дейін — қысқа әрі нақты нұсқаулықтар." : "Короткие и понятные гайды — от формата теста до подачи на грант."}
        </p>
        <p className="mt-3 text-[14px] font-bold text-muted">
          {GUIDES.length} {l === "kk" ? "нұсқаулық · дереккөз: testcenter.kz" : "гайдов · источник: testcenter.kz"}
        </p>
        <GuidesBrowser
          blocks={CATEGORIES.map((c) => ({
            slug: c.slug,
            name: c.name[l],
            color: categoryAccent(c).color,
            guides: guidesIn(c.slug).map((g) => ({ title: g.title[l], href: lp(l, guidePath(g)) })),
          }))}
        />
        <section className="mt-20 rounded-[28px] bg-surface p-6 md:p-10" aria-labelledby="when">
          <h2 id="when" className="text-[24px] text-ink md:text-[30px]">
            {l === "kk" ? "ҰБТ-ны қашан тапсырасыз?" : "Когда вы сдаёте ЕНТ?"}
          </h2>
          <p className="mt-2 text-[16px] text-muted">{l === "kk" ? "Таңдаңыз — жоспар соған қарай құрылады." : "Выберите — план построится под эту дату."}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {WHEN.map((w) => (
              <Link
                key={w}
                href={`${lp(l, "/quiz")}?session=${w}`}
                className="inline-flex min-h-11 items-center rounded-full bg-card px-5 text-[15px] font-bold text-ink shadow-soft-ring transition-colors hover:bg-primary-tint-2 hover:text-primary-nav"
              >
                {w === "undecided" ? (l === "kk" ? "Әлі шешпедім" : "Ещё не решил(а)") : SESSION_LABEL[w][l]}
              </Link>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
