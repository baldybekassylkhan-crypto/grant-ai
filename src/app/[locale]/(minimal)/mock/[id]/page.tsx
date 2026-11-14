import { notFound } from "next/navigation";
import { MockRunner } from "@/components/mock/MockRunner";
import { MOCK_COUNT } from "@/content/mock/mocks";
import { LOCALES, asLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string; id: string }> };

export function generateStaticParams() {
  return LOCALES.flatMap((locale) => Array.from({ length: MOCK_COUNT }, (_, i) => ({ locale, id: String(i + 1) })));
}

export async function generateMetadata({ params }: P) {
  const { locale, id } = await params;
  const l = asLocale(locale);
  return pageMeta({ locale: l, path: `/mock/${id}`, title: `${l === "kk" ? "ҰБТ пробный тест" : "Пробный тест ЕНТ"} №${id}`, description: l === "kk" ? "Ресми форматтағы толық пробный тест." : "Полный пробный тест в официальном формате.", noIndex: true });
}

export default async function MockPage({ params }: P) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n < 1 || n > MOCK_COUNT) notFound();
  return <MockRunner id={n} />;
}
