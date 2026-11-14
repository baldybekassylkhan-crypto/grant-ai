import { PlanDashboard } from "@/components/quiz/PlanDashboard";
import { asLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const l = asLocale((await params).locale);
  return pageMeta({ locale: l, path: "/plan", title: l === "kk" ? "Менің ҰБТ жоспарым" : "Мой план к ЕНТ", description: l === "kk" ? "Жеке ҰБТ дайындық жоспары." : "Личный план подготовки к ЕНТ.", noIndex: true });
}

export default function PlanPage() {
  return (
    <div className="bg-page pb-24 pt-10">
      <div className="container-site">
        <PlanDashboard />
      </div>
    </div>
  );
}
