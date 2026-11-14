import { SiteHeader } from "@/components/shell/SiteHeader";
import { SiteFooter } from "@/components/shell/SiteFooter";
import { LocaleBanner, PromoStrip } from "@/components/shell/Strips";
import { SkipLink } from "@/components/ui/misc";
import { UI } from "@/content/ui";
import { asLocale } from "@/lib/i18n";

export default async function SiteLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const locale = asLocale((await params).locale);
  return (
    <>
      <SkipLink label={UI.skip[locale]} />
      <PromoStrip />
      <LocaleBanner />
      <SiteHeader />
      <main id="main" tabIndex={-1} className="outline-none">
        {children}
      </main>
      <SiteFooter locale={locale} />
    </>
  );
}
