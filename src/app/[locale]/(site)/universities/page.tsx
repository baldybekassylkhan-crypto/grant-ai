import Link from "next/link";
import { UniversityBrowser } from "@/components/unis/UniversityBrowser";
import { DATA_META, PROGRAMS, UNIVERSITIES } from "@/content/data";
import { UI } from "@/content/ui";
import { asLocale, lp } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const l = asLocale((await params).locale);
  return pageMeta({
    locale: l,
    path: "/universities",
    title: l === "kk" ? "Қазақстан университеттері: грант балдары 2025" : "Вузы Казахстана: проходные баллы на грант 2025",
    description:
      l === "kk"
        ? `ҰБТ арқылы түсуге болатын ${UNIVERSITIES.length} ЖОО: қала, түрі, білім беру бағдарламалары тобы және 2025 жылғы грант балдары.`
        : `${UNIVERSITIES.length} вузов, куда поступают по ЕНТ: город, тип, группы образовательных программ и проходные баллы на грант 2025.`,
  });
}

export default async function UniversitiesPage({ params }: P) {
  const l = asLocale((await params).locale);
  const withGrants = UNIVERSITIES.filter((u) => u.progs.length).length;
  return (
    <div className="bg-page pb-24 pt-8">
      <div className="container-site">
        <h1 className="text-[32px] leading-[1.1] text-ink md:text-[50px]">{l === "kk" ? "Қазақстан университеттері" : "Вузы Казахстана"}</h1>
        <p className="mt-4 max-w-[680px] text-[17px] leading-7 text-muted">
          {l === "kk"
            ? `${UNIVERSITIES.length} жоғары оқу орны, оның ${withGrants}-інде ${DATA_META.year} жылы мемлекеттік грант бөлінген. Әр университеттің бетінде — бағдарлама топтары, пән комбинациясы және өткен жылғы ең төменгі грант балы.`
            : `${UNIVERSITIES.length} вузов, в ${withGrants} из них в ${DATA_META.year} году выделялись государственные гранты. На странице вуза — группы программ, комбинации предметов и минимальный балл на грант прошлого года.`}
        </p>
        <div className="mt-4 flex flex-wrap gap-2 text-[13px] font-bold">
          <span className="rounded-full bg-info-bg px-3 py-1 text-info-text">
            {PROGRAMS.length} {l === "kk" ? "бағдарлама тобы" : "групп программ"}
          </span>
          <span className="rounded-full bg-surface px-3 py-1 text-muted ring-line">
            {l === "kk" ? "Дереккөз: 2025 жылғы грант конкурсының нәтижелері (univision.kz)" : "Источник: итоги конкурса грантов 2025 (univision.kz)"}
          </span>
          <Link href={lp(l, "/tools/score-calculator")} className="rounded-full bg-primary-tint-2 px-3 py-1 text-primary-nav hover:underline">
            {l === "kk" ? "Балыммен қайда түсемін? →" : "Куда я прохожу с моим баллом? →"}
          </Link>
        </div>
        <div className="mt-8">
          <UniversityBrowser />
        </div>
        <p className="mt-10 max-w-3xl text-[13px] leading-5 text-muted">
          {l === "kk"
            ? "Ескерту: грант балы жыл сайын өзгереді, бұл — 2025 жылғы ең төменгі балдар. Ресми ақпаратты ЖОО қабылдау комиссиясынан және testcenter.kz сайтынан тексеріңіз. "
            : "Важно: проходной балл меняется каждый год, здесь — минимальные баллы 2025 года. Официальную информацию уточняйте в приёмной комиссии вуза и на testcenter.kz. "}
          {UI.disclaimer[l]}
        </p>
      </div>
    </div>
  );
}
