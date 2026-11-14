import { ProsePage } from "@/components/shell/ProsePage";
import { LEGAL } from "@/content/legal";
import { asLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const l = asLocale((await params).locale);
  return pageMeta({ locale: l, path: "/refund", title: l === "kk" ? "Қайтару саясаты" : "Политика возврата", description: l === "kk" ? "grant.ai ақшаны қайтару саясаты." : "Политика возврата средств grant.ai." });
}

export default async function Page({ params }: P) {
  const l = asLocale((await params).locale);
  return <ProsePage title={l === "kk" ? "Қайтару саясаты" : "Политика возврата"} updated="[DATE]" updatedLabel={l === "kk" ? "Соңғы жаңарту" : "Последнее обновление"} sections={LEGAL.refund(l)} />;
}
