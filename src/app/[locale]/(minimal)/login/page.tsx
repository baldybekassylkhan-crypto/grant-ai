import { LoginForm } from "@/components/quiz/Login";
import { StaticNotice } from "@/components/quiz/StaticNotice";
import { STATIC } from "@/lib/static";
import { asLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const l = asLocale((await params).locale);
  return pageMeta({ locale: l, path: "/login", title: l === "kk" ? "Кіру" : "Вход", description: l === "kk" ? "grant.ai аккаунтына кіру." : "Вход в аккаунт grant.ai.", noIndex: true });
}

export default function LoginPage() {
  return STATIC ? <StaticNotice /> : <LoginForm />;
}
