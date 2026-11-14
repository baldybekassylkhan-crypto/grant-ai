import { GuaranteeCard, Hero, LogoMarquee, PartnerBanner, ProofStrip, ReviewGrid } from "@/components/home/sections";
import { ProductTour, VideoCarousel } from "@/components/home/interactive";
import { FaqAccordion, Reveal } from "@/components/ui/client";
import { JsonLd, SectionHeading } from "@/components/ui/misc";
import { HOME_FAQS } from "@/content/home";
import { asLocale } from "@/lib/i18n";
import { faqLd, pageMeta } from "@/lib/seo";
import { SITE_URL } from "@/lib/site";

type P = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: P) {
  const l = asLocale((await params).locale);
  return pageMeta({
    locale: l,
    path: "/",
    title: l === "kk" ? "grant.ai — ҰБТ-ға онлайн дайындық және грант" : "grant.ai — онлайн-подготовка к ЕНТ и грант",
    description:
      l === "kk"
        ? "ҰБТ-ға дайындық: жеке жоспар, нақты форматтағы пробный тесттер, балл калькуляторы және грантқа жол."
        : "Подготовка к ЕНТ: личный план, пробные тесты в реальном формате, калькулятор баллов и путь к гранту.",
  });
}

export default async function HomePage({ params }: P) {
  const l = asLocale((await params).locale);
  const faqs = HOME_FAQS.map((f) => ({ q: f.q[l], a: f.a[l] }));
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": ["Organization", "EducationalOrganization"],
          name: "grant.ai",
          legalName: "[COMPANY NAME]",
          url: `${SITE_URL}/${l}`,
          logo: `${SITE_URL}/icon.svg`,
          email: "[SUPPORT EMAIL]",
          areaServed: "KZ",
        }}
      />
      <JsonLd data={faqLd(faqs)} />
      <Hero locale={l} />
      <ProofStrip locale={l} />
      <Reveal>
        <LogoMarquee locale={l} />
      </Reveal>
      <Reveal>
        <VideoCarousel />
      </Reveal>
      <Reveal>
        <ProductTour />
      </Reveal>
      <Reveal>
        <ReviewGrid locale={l} />
      </Reveal>
      <Reveal>
        <GuaranteeCard locale={l} />
      </Reveal>
      <section className="bg-card py-20">
        <Reveal className="container-site max-w-[860px]">
          <SectionHeading title={l === "kk" ? "Сұрақтарға жауап" : "Ответы на вопросы"} />
          <FaqAccordion items={faqs} className="mt-8" />
        </Reveal>
      </section>
      <Reveal>
        <PartnerBanner locale={l} />
      </Reveal>
    </>
  );
}
