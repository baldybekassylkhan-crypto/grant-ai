import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs, JsonLd } from "@/components/ui/misc";
import { DATA_META, PROGRAMS, areaOf, cityName, programByCode, programUniversities, progName, uniName } from "@/content/data";
import { THRESHOLDS, pairLabel } from "@/content/unt-config";
import { UI } from "@/content/ui";
import { LOCALES, asLocale, lp } from "@/lib/i18n";
import { breadcrumbLd, pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string; code: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => PROGRAMS.map((p) => ({ locale, code: p.code })));
}

export async function generateMetadata({ params }: P) {
  const { locale, code } = await params;
  const l = asLocale(locale);
  const p = programByCode(code);
  if (!p) return {};
  return pageMeta({
    locale: l,
    path: `/programs/${p.code}`,
    title: `${p.code} ${progName(p, l)} — ${l === "kk" ? "грант балы" : "проходной балл"} ${DATA_META.year}`,
    description: l === "kk" ? `${progName(p, l)}: ҰБТ пәндері, ${DATA_META.year} жылғы грант балдары және оқытатын университеттер.` : `${progName(p, l)}: предметы ЕНТ, проходные баллы на грант ${DATA_META.year} и вузы.`,
  });
}

export default async function ProgramPage({ params }: P) {
  const { locale, code } = await params;
  const l = asLocale(locale);
  const p = programByCode(code);
  if (!p) notFound();
  const T = (kk: string, ru: string) => (l === "kk" ? kk : ru);
  const area = areaOf(p);
  const rows = programUniversities(p.code);
  const threshold = area?.name.ru === "Педагогические науки" ? 75 : area?.name.ru === "Здравоохранение" ? 70 : p.code === "B049" ? 75 : null;
  const full = p.grants2025["Очная полная"];
  const crumbs = [
    { label: UI.home[l], href: lp(l) },
    { label: T("Мамандықтар", "Специальности"), href: lp(l, "/tools/university-directory") },
    { label: `${p.code} ${progName(p, l)}`, href: lp(l, `/programs/${p.code}`) },
  ];

  return (
    <>
      <JsonLd data={breadcrumbLd(crumbs)} />
      <JsonLd data={{ "@context": "https://schema.org", "@type": "EducationalOccupationalProgram", name: `${p.code} ${p.ru}`, educationalCredentialAwarded: "Bachelor", occupationalCategory: area?.careers.ru }} />
      <section className="bg-primary-tint pb-12 pt-8">
        <div className="container-site">
          <Breadcrumbs items={crumbs} />
          <p className="mt-4 text-[14px] font-extrabold text-primary-deep">{p.code}</p>
          <h1 className="mt-1 max-w-4xl text-[28px] leading-[1.15] text-ink md:text-[42px]">{progName(p, l)}</h1>
          {area && <p className="mt-3 max-w-3xl text-[17px] leading-7 text-body">{area.about[l]}</p>}
          <dl className="mt-6 grid max-w-4xl grid-cols-2 gap-3 md:grid-cols-4">
            {[
              [T("ҰБТ пәндері", "Предметы ЕНТ"), p.pair ? pairLabel(p.pair, l) : T("ЖОО-дан тексеріңіз", "Уточняйте в вузе")],
              [T("Жалпы конкурс (мин.)", "Общий конкурс (мин.)"), p.gen ? String(p.gen[0]) : "—"],
              [T("Ауыл квотасы (мин.)", "Сельская квота (мин.)"), p.rural ? String(p.rural[0]) : "—"],
              [T(`Грант саны ${DATA_META.year}`, `Грантов ${DATA_META.year}`), full ?? (p.gen ? String(p.gen[1]) : "—")],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-card p-4 ring-line">
                <dt className="text-[12px] font-bold text-muted">{k}</dt>
                <dd className="mt-1 text-[16px] font-extrabold leading-snug text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div className="bg-page pb-24 pt-10">
        <div className="container-site grid gap-10 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            <h2 className="text-[22px] text-ink md:text-[28px]">{T("Қай университеттерде оқытылады", "В каких вузах учат")}</h2>
            <p className="mt-2 text-[15px] text-muted">{T(`${rows.length} ЖОО-да ${DATA_META.year} жылы грант бөлінді. Кесте ең төменгі грант балы бойынша сұрыпталған.`, `В ${rows.length} вузах в ${DATA_META.year} году выделялись гранты. Таблица отсортирована по минимальному баллу.`)}</p>
            <div className="mt-4 overflow-x-auto rounded-[20px] bg-card ring-line">
              <table className="w-full min-w-[600px] border-collapse text-left text-[15px]">
                <thead>
                  <tr className="text-[12px] font-extrabold uppercase tracking-[1px] text-muted">
                    <th className="px-4 pb-3 pt-4">{T("Университет", "Вуз")}</th>
                    <th className="px-4 pb-3 pt-4">{T("Қала", "Город")}</th>
                    <th className="whitespace-nowrap px-4 pb-3 pt-4 text-right">{T("Жалпы", "Общий")}</th>
                    <th className="whitespace-nowrap px-4 pb-3 pt-4 text-right">{T("Ауыл", "Сельская")}</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.uni.id} className="border-t border-line">
                      <th scope="row" className="px-4 py-3 font-bold text-ink">
                        <Link href={lp(l, `/universities/${r.uni.slug}`)} className="underline-offset-4 hover:underline">
                          {uniName(r.uni, l)}
                        </Link>
                      </th>
                      <td className="px-4 py-3 text-[14px] text-body">{cityName(r.uni.city, l)}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right align-middle">{r.g ? <><span className="font-display text-[17px] text-ink">{r.g[0]}</span> <span className="text-[12px] text-muted">/ {r.g[1]} гр.</span></> : "—"}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right align-middle">{r.r ? <><span className="font-display text-[17px] text-ink">{r.r[0]}</span> <span className="text-[12px] text-muted">/ {r.r[1]} гр.</span></> : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[12px] text-muted">
              {T("Сан — грант алған ең төменгі балл, кейінгі сан — грант саны. Дереккөз: ", "Число — минимальный балл, с которым получили грант; второе — число грантов. Источник: ")}
              <a href={p.source} target="_blank" rel="noopener noreferrer" className="underline">univision.kz</a>
            </p>
          </div>
          <aside className="space-y-4">
            {area && (
              <div className="rounded-[20px] bg-card p-5 shadow-soft-ring">
                <p className="eyebrow text-info">{T("Кім болып жұмыс істейді", "Кем можно работать")}</p>
                <p className="mt-2 text-[15px] font-bold leading-6 text-ink">{area.careers[l]}</p>
                <p className="mt-3 text-[13px] text-muted">{area.name[l]}</p>
              </div>
            )}
            <div className="rounded-[20px] bg-card p-5 shadow-soft-ring">
              <p className="eyebrow text-info">{T("Шекті балл", "Порог")}</p>
              <p className="mt-2 text-[15px] text-body">
                {threshold
                  ? T(`Бұл бағыт үшін кемінде ${threshold} балл керек.`, `Для этого направления нужно не менее ${threshold} баллов.`)
                  : T(`Ұлттық ЖОО — ${THRESHOLDS.value[0].score}, басқа ЖОО — ${THRESHOLDS.value[1].score}.`, `Национальные вузы — ${THRESHOLDS.value[0].score}, другие — ${THRESHOLDS.value[1].score}.`)}
              </p>
            </div>
            <div className="rounded-[20px] bg-surface p-5">
              <p className="font-display text-[17px] text-ink">{T("Грантқа жетесіз бе?", "Хватит на грант?")}</p>
              <Button href={lp(l, `/tools/grant-chance?program=${p.code}`)} className="mt-3 w-full">
                {T("Мүмкіндікті тексеру", "Проверить шансы")}
              </Button>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
