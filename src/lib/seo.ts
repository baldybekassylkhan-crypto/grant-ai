import type { Metadata } from "next";
import { BRAND, SITE_URL } from "./site";
import { LOCALES, type Locale } from "./i18n";

export function pageMeta({ title, description, path, locale, noIndex }: { title: string; description: string; path: string; locale: Locale; noIndex?: boolean }): Metadata {
  const p = path === "/" ? "" : path;
  const url = `${SITE_URL}/${locale}${p}`;
  const fullTitle = title.includes(BRAND) ? title : `${title} · ${BRAND}`;
  const languages: Record<string, string> = Object.fromEntries(LOCALES.map((l) => [l, `${SITE_URL}/${l}${p}`]));
  languages["x-default"] = `${SITE_URL}/kk${p}`;
  return {
    title: fullTitle,
    description,
    alternates: { canonical: url, languages },
    openGraph: { title: fullTitle, description, url, siteName: BRAND, type: "website", locale: locale === "kk" ? "kk_KZ" : "ru_KZ", images: [{ url: `${SITE_URL}/opengraph-image`, width: 1200, height: 630, alt: BRAND }] },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    robots: noIndex ? { index: false, follow: false } : undefined,
  };
}

export function faqLd(faqs: { q: string; a: string }[]) {
  return { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) };
}

export function breadcrumbLd(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.label, ...(it.href ? { item: `${SITE_URL}${it.href}` } : {}) })),
  };
}
