import { GUIDES, guidePath } from "@/content/guides";
import { LOCALES, asLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";
export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

const esc = (x: string) => x.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

export async function GET(_req: Request, { params }: { params: Promise<{ locale: string }> }) {
  const l = asLocale((await params).locale);
  const items = [...GUIDES]
    .sort((a, b) => b.updated.localeCompare(a.updated))
    .map((g) => {
      const url = `${SITE_URL}/${l}${guidePath(g)}`;
      return `    <item>
      <title>${esc(g.title[l])}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(g.description[l])}</description>
      <category>${esc(g.category)}</category>
      <pubDate>${new Date(g.updated + "T09:00:00Z").toUTCString()}</pubDate>
    </item>`;
    })
    .join("\n");
  const title = l === "kk" ? "grant.ai — ҰБТ нұсқаулықтары" : "grant.ai — гайды по ЕНТ";
  const desc = l === "kk" ? "ҰБТ-ға дайындық туралы нұсқаулықтар" : "Гайды по подготовке к ЕНТ";
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${title}</title>
    <link>${SITE_URL}/${l}/guides</link>
    <atom:link href="${SITE_URL}/${l}/guides/rss.xml" rel="self" type="application/rss+xml" />
    <description>${desc}</description>
    <language>${l}</language>
${items}
  </channel>
</rss>`;
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
