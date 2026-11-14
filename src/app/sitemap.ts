import type { MetadataRoute } from "next";
import { AUTHORS, CATEGORIES, GUIDES, guidePath } from "@/content/guides";
import { GAMES } from "@/content/games";
import { TOOLS } from "@/content/tools";
import { PROGRAMS, UNIVERSITIES } from "@/content/data";
import { LOCALES } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/guarantee",
    "/tools",
    ...TOOLS.map((t) => `/tools/${t.slug}`),
    ...GAMES.map((g) => `/games/${g.slug}`),
    "/guides",
    ...CATEGORIES.map((c) => `/guides/${c.slug}`),
    ...GUIDES.map((g) => guidePath(g)),
    ...AUTHORS.map((a) => `/authors/${a.slug}`),
    "/mock-tests",
    "/universities",
    ...UNIVERSITIES.map((u) => `/universities/${u.slug}`),
    ...PROGRAMS.map((p) => `/programs/${p.code}`),
    "/quiz",
    "/support",
    "/terms",
    "/privacy",
    "/refund",
  ];
  return paths.flatMap((p) =>
    LOCALES.map((l) => ({
      url: `${SITE_URL}/${l}${p}`,
      alternates: { languages: Object.fromEntries(LOCALES.map((x) => [x, `${SITE_URL}/${x}${p}`])) },
    })),
  );
}
