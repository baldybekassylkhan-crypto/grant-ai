import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { GAMES } from "@/content/games";
import { TOOLS } from "@/content/tools";
import { UI } from "@/content/ui";
import { LOCALES, LOCALE_LABEL, lp, type Locale } from "@/lib/i18n";
import { COMPANY, PARTNER_EMAIL } from "@/lib/site";
import { ThemeToggle } from "./Strips";

type Col = { title: string; links: { label: string; href?: string; bold?: boolean; lang?: string }[] };

export function SiteFooter({ locale }: { locale: Locale }) {
  const l = locale;
  const cols: Col[] = [
    {
      title: l === "kk" ? "Тегін жаттығу" : "Бесплатная практика",
      links: [...GAMES.map((g) => ({ label: g.title[l], href: lp(l, `/games/${g.slug}`) })), { label: l === "kk" ? "Толық пробный тест" : "Полный пробный тест", href: lp(l, "/mock-tests") }],
    },
    {
      title: UI.freeTools[l],
      links: [...TOOLS.map((t) => ({ label: t.short[l], href: lp(l, `/tools/${t.slug}`) })), { label: UI.allTools[l], href: lp(l, "/tools") }],
    },
    {
      title: UI.guides[l],
      links: [
        { label: l === "kk" ? "Университеттер" : "Вузы", href: lp(l, "/universities") },
        { label: UI.allGuides[l], href: lp(l, "/guides") },
        { label: "RSS", href: lp(l, "/guides/rss.xml") },
      ],
    },
    {
      title: "grant.ai",
      links: [
        { label: l === "kk" ? "Кепілдік" : "Гарантия", href: lp(l, "/guarantee") },
        { label: l === "kk" ? "Қолдау" : "Поддержка", href: lp(l, "/support") },
        { label: l === "kk" ? "Мобильді қосымша" : "Мобильное приложение", href: lp(l, "/support#mobile-app") },
        { label: UI.login[l], href: lp(l, "/login") },
      ],
    },
    {
      title: l === "kk" ? "Мектептер мен репетиторларға" : "Школам и репетиторам",
      links: [{ label: l === "kk" ? "Серіктестік" : "Партнёрство", href: lp(l, "/support#partners") }, { label: PARTNER_EMAIL }],
    },
    {
      title: l === "kk" ? "Тіл" : "Язык",
      links: LOCALES.map((x) => ({ label: LOCALE_LABEL[x], href: `/${x}`, bold: x === l, lang: x })),
    },
  ];
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-line bg-band">
      <div className="container-site py-12">
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-[1.3fr_repeat(6,1fr)]">
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Logo locale={l} tagline />
          </div>
          {cols.map((c) => (
            <div key={c.title}>
              <h2 className="font-sans text-[12px] font-extrabold uppercase tracking-[1.2px] text-ink">{c.title}</h2>
              <ul className="mt-4 space-y-2.5">
                {c.links.map((x) => (
                  <li key={x.label} className="text-[14px] leading-5">
                    {x.href ? (
                      <Link href={x.href} lang={x.lang} className={x.bold ? "font-extrabold text-ink" : "font-semibold text-muted hover:text-ink"}>
                        {x.label}
                      </Link>
                    ) : (
                      <span className="font-semibold text-muted">{x.label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-6 border-t border-line pt-8 md:flex-row md:items-start md:justify-between">
          <div className="max-w-[480px] space-y-3 text-[12px] leading-5 text-muted">
            <p>{UI.disclaimer[l]}</p>
            <p className="font-semibold">
              © {year} {COMPANY} · grant.ai
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <ul className="flex gap-5 text-[13px] font-bold text-muted">
              <li>
                <Link href={lp(l, "/terms")} className="hover:text-ink">{UI.terms[l]}</Link>
              </li>
              <li>
                <Link href={lp(l, "/privacy")} className="hover:text-ink">{UI.privacy[l]}</Link>
              </li>
              <li>
                <Link href={lp(l, "/refund")} className="hover:text-ink">{UI.refunds[l]}</Link>
              </li>
            </ul>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
