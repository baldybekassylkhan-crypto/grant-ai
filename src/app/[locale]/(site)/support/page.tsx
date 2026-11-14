import { ProsePage } from "@/components/shell/ProsePage";
import { supportSections } from "@/content/legal";
import { asLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const l = asLocale((await params).locale);
  return pageMeta({ locale: l, path: "/support", title: l === "kk" ? "Қолдау" : "Поддержка", description: l === "kk" ? "grant.ai аккаунты, жазылым, қайтару және деректер бойынша көмек." : "Помощь по аккаунту, подписке, возвратам и данным grant.ai." });
}

export default async function Page({ params }: P) {
  const l = asLocale((await params).locale);
  return <ProsePage title={l === "kk" ? "Қолдау" : "Поддержка"} intro={l === "kk" ? "Аккаунт бойынша жиі сұрақтарға жауаптар." : "Ответы на частые вопросы по аккаунту."} sections={supportSections(l)} />;
}
