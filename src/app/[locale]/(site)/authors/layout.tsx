import { SectionNav } from "@/components/guides/nav";
import { CATEGORIES, categoryAccent } from "@/content/guides";
import { asLocale } from "@/lib/i18n";

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const l = asLocale((await params).locale);
  return (
    <>
      <SectionNav categories={CATEGORIES.map((c) => ({ slug: c.slug, name: c.name[l], color: categoryAccent(c).color }))} />
      {children}
    </>
  );
}
