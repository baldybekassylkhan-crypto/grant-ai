import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Nunito_Sans, Unbounded } from "next/font/google";
import { HTML_LANG, LOCALES, isLocale } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const display = Unbounded({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-unbounded", display: "swap" });
const text = Nunito_Sans({ subsets: ["latin", "cyrillic", "cyrillic-ext"], variable: "--font-nunito", display: "swap" });

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: "grant.ai",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFE" },
    { media: "(prefers-color-scheme: dark)", color: "#030A19" },
  ],
};

const themeScript = `try{var t=localStorage.getItem('grantai:theme');if(t==='dark')document.documentElement.classList.add('dark')}catch(e){}`;

export default async function LocaleLayout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return (
    <html lang={HTML_LANG[locale]} className={`${display.variable} ${text.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-page font-sans text-ink antialiased">{children}</body>
    </html>
  );
}
