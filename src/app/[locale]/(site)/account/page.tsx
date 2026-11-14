import { AccountCabinet } from "@/components/quiz/AccountCabinet";
import { StaticNotice } from "@/components/quiz/StaticNotice";
import { STATIC } from "@/lib/static";
import { asLocale } from "@/lib/i18n";
import { pageMeta } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const l = asLocale((await params).locale);
  return pageMeta({ locale: l, path: "/account", title: l === "kk" ? "Жеке кабинет" : "Личный кабинет", description: l === "kk" ? "grant.ai жеке кабинеті." : "Личный кабинет grant.ai.", noIndex: true });
}

export default function AccountPage() {
  if (STATIC) return <StaticNotice />;
  return (
    <div className="bg-page pb-24 pt-10">
      <div className="container-site">
        <AccountCabinet />
      </div>
    </div>
  );
}
