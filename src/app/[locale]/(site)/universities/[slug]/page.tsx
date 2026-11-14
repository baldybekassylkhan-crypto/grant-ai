import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs, JsonLd } from "@/components/ui/misc";
import { CAT_LABEL, DATA_META, UNIVERSITIES, cityName, programByCode, progName, uniBySlug, uniName } from "@/content/data";
import { SUBJECT_MINIMUMS, THRESHOLDS, pairLabel } from "@/content/unt-config";
import { UI } from "@/content/ui";
import { LOCALES, asLocale, lp } from "@/lib/i18n";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => UNIVERSITIES.map((u) => ({ locale, slug: u.slug })));
}

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  const u = uniBySlug(slug);
  if (!u) return {};
  return pageMeta({
    locale: l,
    path: `/universities/${u.slug}`,
    title: `${uniName(u, l)} — ${l === "kk" ? "грант балдары" : "проходные баллы"}`,
    description: l === "kk" ? `${uniName(u, l)}: бағдарлама топтары, пән комбинациясы, ${DATA_META.year} жылғы грант балдары.` : `${uniName(u, l)}: группы программ, комбинации предметов, проходные баллы на грант ${DATA_META.year}.`,
  });
}

export default async function UniversityPage({ params }: P) {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  const u = uniBySlug(slug);
  if (!u) notFound();
  const T = (kk: string, ru: string) => (l === "kk" ? kk : ru);
  const rows = u.progs.map((p) => ({ ...p, prog: programByCode(p.c) })).filter((r) => r.prog);
  const pairs = [...new Set(rows.map((r) => r.prog!.pair).filter(Boolean))] as string[];
  const baseThreshold = u.national ? 65 : 50;
  const crumbs = [
    { label: UI.home[l], href: lp(l) },
    { label: T("Университеттер", "Вузы"), href: lp(l, "/universities") },
    { label: uniName(u, l), href: lp(l, `/universities/${u.slug}`) },
  ];

  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "CollegeOrUniversity", name: u.ru, alternateName: u.kk, url: u.site ?? undefined, address: { "@type": "PostalAddress", addressLocality: cityName(u.city, "ru"), addressCountry: "KZ" } }} />
      <JsonLd data={breadcrumbLd(crumbs)} />
      <section className="bg-info-bg pb-12 pt-8">
        <div className="container-site">
          <Breadcrumbs items={crumbs} />
          <h1 className="mt-4 max-w-4xl text-[28px] leading-[1.15] text-ink md:text-[40px]">{uniName(u, l)}</h1>
          {l === "kk" && u.ru !== u.kk && <p className="mt-2 text-[15px] font-semibold text-muted">{u.ru}</p>}
          <div className="mt-5 flex flex-wrap gap-2 text-[13px] font-bold">
            <span className="rounded-full bg-card px-3 py-1.5 text-ink ring-line">🇰🇿 {cityName(u.city, l)}</span>
            <span className="rounded-full bg-card px-3 py-1.5 text-ink ring-line">{CAT_LABEL[u.cat][l]}</span>
            {u.code && <span className="rounded-full bg-card px-3 py-1.5 text-ink ring-line">{T("ЖОО коды", "Код вуза")}: {u.code}</span>}
            <span className="rounded-full bg-card px-3 py-1.5 text-ink ring-line">
              {T("Базалық шекті балл", "Базовый порог")}: {baseThreshold}
            </span>
            {u.site && (
              <a href={u.site.startsWith("http") ? u.site : `https://${u.site}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-white hover:bg-primary-hover">
                {T("Ресми сайт", "Официальный сайт")} <ExternalLink className="size-3.5" aria-hidden />
              </a>
            )}
          </div>
        </div>
      </section>

      <div className="bg-page pb-24 pt-10">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <h2 className="text-[22px] text-ink md:text-[28px]">{T(`${DATA_META.year} жылғы грант балдары`, `Проходные баллы на грант ${DATA_META.year}`)}</h2>
            {rows.length === 0 ? (
              <p className="mt-4 rounded-2xl bg-card p-6 text-muted ring-line">{T(`Бұл ЖОО-да ${DATA_META.year} жылы мемлекеттік грант бойынша деректер жоқ (ақылы оқу немесе басқа түсу тәртібі). Толығырақ — университет сайтында.`, `Данных по государственным грантам ${DATA_META.year} года для этого вуза нет (платное обучение или особый порядок приёма). Подробнее — на сайте вуза.`)}</p>
            ) : (
              <div className="mt-4 overflow-x-auto rounded-[20px] bg-card ring-line">
                <table className="w-full min-w-[640px] border-collapse text-left text-[15px]">
                  <thead>
                    <tr className="text-[12px] font-extrabold uppercase tracking-[1px] text-muted">
                      <th className="px-4 pb-3 pt-4">{T("Бағдарлама тобы", "Группа программ")}</th>
                      <th className="px-4 pb-3 pt-4">{T("Пәндер", "Предметы")}</th>
                      <th className="whitespace-nowrap px-4 pb-3 pt-4 text-right">{T("Жалпы конкурс", "Общий конкурс")}</th>
                      <th className="whitespace-nowrap px-4 pb-3 pt-4 text-right">{T("Ауыл квотасы", "Сельская квота")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((r) => (
                      <tr key={r.c} className="border-t border-line">
                        <th scope="row" className="px-4 py-3 font-bold text-ink">
                          <Link href={lp(l, `/programs/${r.c}`)} className="underline-offset-4 hover:underline">
                            <span className="text-muted">{r.c}</span> {progName(r.prog!, l)}
                          </Link>
                        </th>
                        <td className="px-4 py-3 text-[13px] text-body">{r.prog!.pair ? pairLabel(r.prog!.pair, l) : "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right align-middle">{r.g ? <><span className="font-display text-[17px] text-ink">{r.g[0]}</span> <span className="text-[12px] text-muted">/ {r.g[1]} {T("гр.", "гр.")}</span></> : "—"}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-right align-middle">{r.r ? <><span className="font-display text-[17px] text-ink">{r.r[0]}</span> <span className="text-[12px] text-muted">/ {r.r[1]} {T("гр.", "гр.")}</span></> : "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="mt-3 text-[12px] text-muted">
              {T("Үлкен сан — грант алған ең төменгі балл; «/ N гр.» — бөлінген грант саны. Дереккөз: ", "Крупное число — минимальный балл, с которым получили грант; «/ N гр.» — количество грантов. Источник: ")}
              <a href={u.source} target="_blank" rel="noopener noreferrer" className="underline">univision.kz</a>
            </p>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[20px] bg-card p-5 shadow-soft-ring">
              <p className="eyebrow text-info">{T("Пән комбинациялары", "Комбинации предметов")}</p>
              <ul className="mt-3 space-y-1.5 text-[14px] font-bold text-ink">
                {pairs.length ? pairs.map((p) => <li key={p}>{pairLabel(p, l)}</li>) : <li className="text-muted">—</li>}
              </ul>
            </div>
            <div className="rounded-[20px] bg-card p-5 shadow-soft-ring">
              <p className="eyebrow text-info">{T("Шекті балдар", "Пороги")}</p>
              <ul className="mt-3 space-y-1.5 text-[14px] text-body">
                <li>{T("Осы ЖОО (базалық)", "Этот вуз (базовый)")}: <strong>{baseThreshold}</strong></li>
                {THRESHOLDS.value.filter((t) => ["pedagogy", "law", "healthcare"].includes(t.id)).map((t) => (
                  <li key={t.id}>
                    {t.label[l]}: <strong>{t.score}</strong>
                  </li>
                ))}
                <li className="text-[12px] text-muted">{T(`Пәндік минимум: тарих пен бейіндік — ${SUBJECT_MINIMUMS.value.history}, сауаттылықтар — ${SUBJECT_MINIMUMS.value.reading}.`, `Минимумы: история и профильные — ${SUBJECT_MINIMUMS.value.history}, грамотности — ${SUBJECT_MINIMUMS.value.reading}.`)}</li>
              </ul>
            </div>
            <div className="rounded-[20px] bg-surface p-5">
              <p className="font-display text-[17px] text-ink">{T("Осы ЖОО-ға балыңыз жете ме?", "Хватит ли вашего балла?")}</p>
              <Button href={lp(l, "/tools/score-calculator")} className="mt-3 w-full">
                {T("Балды есептеу", "Посчитать балл")}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
