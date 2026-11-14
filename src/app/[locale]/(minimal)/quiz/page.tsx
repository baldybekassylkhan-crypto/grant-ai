import { QuizShell } from "@/components/quiz/Quiz";
import { asLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const l = asLocale((await params).locale);
  return pageMeta({
    locale: l,
    path: "/quiz",
    title: l === "kk" ? "ҰБТ-ға жеке жоспар" : "Личный план к ЕНТ",
    description: l === "kk" ? "15 қысқа сұраққа жауап беріңіз — grant.ai ҰБТ-ға дайындық жоспарын құрады." : "Ответьте на 15 коротких вопросов — grant.ai составит план подготовки к ЕНТ.",
  });
}

export default function QuizPage() {
  return <QuizShell />;
}
