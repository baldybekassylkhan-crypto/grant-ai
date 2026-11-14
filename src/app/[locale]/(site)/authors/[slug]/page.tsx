import { notFound } from "next/navigation";
import { GuideList } from "@/components/guides/blocks";
import { MascotAvatar } from "@/components/ui/Logo";
import { AUTHORS, authorBySlug, guidesByAuthor } from "@/content/guides";
import { UI } from "@/content/ui";
import { LOCALES, asLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string; slug: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => AUTHORS.map((a) => ({ locale, slug: a.slug })));
}

export async function generateMetadata({ params }: P) {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  const a = authorBySlug(slug);
  if (!a) return {};
  return pageMeta({ locale: l, path: `/authors/${a.slug}`, title: a.name[l], description: `${a.role[l]}. ${a.bio[l]}` });
}

export default async function AuthorPage({ params }: P) {
  const { locale, slug } = await params;
  const l = asLocale(locale);
  const author = authorBySlug(slug);
  if (!author) notFound();
  return (
    <div className="bg-card pb-24 pt-12">
      <div className="mx-auto max-w-[780px] px-4 md:px-6">
        <MascotAvatar size={64} bg={author.avatarBg} />
        <h1 className="mt-5 text-[30px] leading-tight text-ink md:text-[38px]">{author.name[l]}</h1>
        <p className="mt-1 text-[15px] font-bold text-muted">{author.role[l]}</p>
        <p className="mt-3 text-[17px] leading-7 text-body">{author.bio[l]}</p>
        <h2 className="mb-4 mt-12 text-[22px] text-ink md:text-[26px]">
          {UI.articlesBy[l]} {author.name[l]}
        </h2>
        <GuideList guides={guidesByAuthor(author.slug)} locale={l} />
      </div>
    </div>
  );
}
