import { Star } from "lucide-react";
import { PlanButton } from "@/components/ui/PlanAware";
import { Button } from "@/components/ui/Button";
import { Laurel, PlaceholderLogo, Seal } from "@/components/ui/Illustrations";
import { MascotAvatar } from "@/components/ui/Logo";
import { SectionHeading } from "@/components/ui/misc";
import { REVIEWS } from "@/content/home";
import { UI } from "@/content/ui";
import { UNT } from "@/content/unt-config";
import { lp, type Locale } from "@/lib/i18n";

export function Hero({ locale: l }: { locale: Locale }) {
  return (
    <section className="bg-page">
      <div className="container-site flex min-h-[560px] flex-col items-center justify-center py-14 text-center">
        <div className="flex items-center justify-center gap-2 md:gap-6">
          <Laurel className="h-[110px] w-auto md:h-[190px]" />
          <span className="font-display text-[96px] leading-none text-ink md:text-[190px]" aria-hidden>
            {UNT.standard.maxScore.value}
          </span>
          <Laurel mirror className="h-[110px] w-auto md:h-[190px]" />
        </div>
        <h1 className="mt-6 max-w-[1000px] text-balance text-[30px] leading-[1.1] text-ink md:text-[56px]">
          {l === "kk" ? "ҰБТ-ға дайындал. Грантты ұт." : "Подготовься к ЕНТ. Выиграй грант."}
        </h1>
        <p className="mt-5 max-w-xl text-[16px] leading-6 text-muted">
          {l === "kk"
            ? `Жеке жоспар, нақты форматтағы пробный тесттер (${UNT.standard.tasks.value} тапсырма, ${UNT.standard.minutes.value} минут) және қателерді талдау.`
            : `Личный план, пробные тесты в реальном формате (${UNT.standard.tasks.value} заданий, ${UNT.standard.minutes.value} минут) и разбор ошибок.`}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PlanButton href={lp(l, "/quiz")} size="lg">
            {UI.start[l]}
          </PlanButton>
          <Button href="#platform" size="lg" variant="secondary">
            {UI.platform[l]}
          </Button>
        </div>
        <div className="mt-10 flex flex-col items-center gap-3">
          <span className="text-[12px] font-bold text-muted">{l === "kk" ? "Серіктесіміз" : "В партнёрстве с"}</span>
          <span className="inline-flex h-10 items-center rounded-xl px-5 text-[13px] font-extrabold tracking-wider text-muted ring-line">[PARTNER LOGO]</span>
        </div>
      </div>
    </section>
  );
}

function CertCard({ l, variant }: { l: Locale; variant: 0 | 1 }) {
  return (
    <figure className="relative h-[420px] w-full max-w-[360px] overflow-hidden rounded-[20px] bg-card p-7 text-left shadow-soft-ring">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-[11px] font-extrabold uppercase tracking-[1.4px] text-muted">{l === "kk" ? "ҰБТ сертификаты" : "Сертификат ЕНТ"}</div>
          <div className="mt-1 font-display text-[18px] text-ink">{variant === 0 ? "[STUDENT A]" : "[STUDENT B]"}</div>
        </div>
        <span className="rounded-full bg-[#E7F8EF] px-3 py-1 text-[11px] font-extrabold text-success">[SCORE] / 140</span>
      </div>
      <dl className="mt-6 space-y-3 text-[12px]">
        {(l === "kk" ? ["ЖСН", "Сертификат №", "Күні"] : ["ИИН", "Сертификат №", "Дата"]).map((k) => (
          <div key={k} className="flex items-center gap-3">
            <dt className="w-24 font-bold text-muted">{k}</dt>
            <dd className="h-3 flex-1 rounded bg-ink/80 blur-[3px]" aria-label="redacted" />
          </div>
        ))}
      </dl>
      <div className="mt-6 space-y-2.5" aria-hidden>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="flex items-center gap-3">
            <div className="h-2 flex-1 rounded bg-line" />
            <div className="h-2 w-8 rounded bg-ink/30" />
          </div>
        ))}
      </div>
      <div className="absolute bottom-7 left-7 right-7 flex items-end justify-between" aria-hidden>
        <div className="h-8 w-28 rounded bg-ink/70 blur-[3px]" />
        <div className="flex size-16 rotate-[-12deg] items-center justify-center rounded-full text-[9px] font-extrabold uppercase tracking-wider text-primary ring-2 ring-primary/60">
          {l === "kk" ? "үлгі" : "образец"}
        </div>
      </div>
      <figcaption className="sr-only">{l === "kk" ? "Жеке деректері жасырылған үлгі сертификат" : "Образец сертификата со скрытыми личными данными"}</figcaption>
    </figure>
  );
}

export function ProofStrip({ locale: l }: { locale: Locale }) {
  return (
    <section className="bg-page pb-20">
      <div className="container-site">
        <p className="eyebrow text-center text-muted">{l === "kk" ? "Оқушыларымыздың нәтижелері — үлгі" : "Результаты наших учеников — образец"}</p>
        <div className="mt-8 flex flex-col items-center justify-center gap-6 sm:flex-row">
          <CertCard l={l} variant={0} />
          <CertCard l={l} variant={1} />
        </div>
      </div>
    </section>
  );
}

export function LogoMarquee({ locale: l }: { locale: Locale }) {
  const logos = Array.from({ length: 10 }, (_, i) => i);
  return (
    <section className="flex min-h-[200px] flex-col justify-center bg-card py-12">
      <p className="eyebrow container-site text-center text-muted">{l === "kk" ? "Мектептер мен оқу орталықтары үшін" : "Для школ и учебных центров"}</p>
      <div className="marquee fade-edges mt-8 overflow-hidden" style={{ ["--marquee-duration" as string]: "45s" }}>
        <ul className="marquee-track flex w-max items-center gap-14">
          {[...logos, ...logos].map((i, k) => (
            <li key={k} aria-hidden={k >= logos.length} className="opacity-60 grayscale transition-[filter,opacity] duration-200 hover:opacity-100 hover:grayscale-0">
              <PlaceholderLogo i={i} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function ReviewGrid({ locale: l }: { locale: Locale }) {
  return (
    <section className="bg-band py-20">
      <div className="container-site">
        <div className="text-center">
          <div className="font-display text-[48px] leading-none text-ink md:text-[72px]">[RATING]</div>
          <div className="mt-2 flex justify-center gap-1" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5 fill-star text-star" />
            ))}
          </div>
          <p className="eyebrow mt-3 text-muted">[N] {l === "kk" ? "пікір" : "отзывов"}</p>
          <SectionHeading title={l === "kk" ? "Оқушылар не дейді" : "Что говорят ученики"} center className="mt-4" />
        </div>
        <ul className="mt-10 grid gap-4 md:grid-cols-3">
          {REVIEWS.map((r, i) => (
            <li key={i} className="flex flex-col rounded-[20px] bg-card p-5 shadow-soft-ring">
              <div className="flex justify-center gap-0.5" role="img" aria-label="5/5 [PLACEHOLDER]">
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star key={s} aria-hidden className="size-4 fill-star text-star" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-6 text-ink">“{r.quote[l]}”</blockquote>
              <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
                <MascotAvatar size={28} bg={r.avatarBg} className="!rounded-full" />
                <div className="min-w-0 flex-1">
                  <div className="text-[13px] font-bold text-ink">{r.name}</div>
                  <div className="text-[12px] text-muted">{r.city}</div>
                </div>
                {r.result && (
                  <div className="text-right">
                    <div className="text-[10px] font-bold uppercase tracking-wide text-muted">{l === "kk" ? "Нәтиже" : "Результат"}</div>
                    <div className="text-[13px] font-extrabold text-success">{r.result}</div>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
        <div className="mt-10 flex justify-center">
          <PlanButton href={lp(l, "/quiz")} size="lg">
            {UI.buildMyPlan[l]}
          </PlanButton>
        </div>
      </div>
    </section>
  );
}

export function GuaranteeCard({ locale: l }: { locale: Locale }) {
  return (
    <section className="bg-page py-20">
      <div className="container-site">
        <div className="flex flex-col-reverse items-start gap-8 rounded-[20px] bg-card p-6 shadow-soft-ring md:flex-row md:items-center md:justify-between md:p-10">
          <div className="max-w-xl">
            <h2 className="text-[24px] leading-[1.2] text-ink md:text-[34px]">{l === "kk" ? "Балды көтеру кепілдігі" : "Гарантия роста балла"}</h2>
            <p className="mt-4 text-[17px] font-bold text-ink">
              {l === "kk"
                ? "Жоспарды толық орындаңыз. Диагностикадан қорытынды пробныйға дейін балыңыз [X] балға өспесе — [GUARANTEE TERMS]."
                : "Пройдите план полностью. Если от диагностики до итогового пробника балл не вырастет на [X] баллов — [GUARANTEE TERMS]."}
            </p>
            <p className="mt-2 text-[16px] text-muted">
              {l === "kk" ? "Ешкім грантқа немесе ресми нәтижеге кепілдік бере алмайды — біз дайындыққа кепілдік береміз." : "Никто не может гарантировать грант или официальный результат — мы гарантируем подготовку."}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <PlanButton href={lp(l, "/quiz")}>{UI.start[l]}</PlanButton>
              <Button href={lp(l, "/guarantee")} variant="secondary">
                {l === "kk" ? "Қалай жұмыс істейді" : "Как это работает"}
              </Button>
            </div>
          </div>
          <Seal className="shrink-0" />
        </div>
      </div>
    </section>
  );
}

export function PartnerBanner({ locale: l }: { locale: Locale }) {
  return (
    <section className="bg-band py-14">
      <div className="container-site">
        <div className="flex flex-col items-start justify-between gap-4 rounded-[20px] bg-card p-6 shadow-soft-ring sm:flex-row sm:items-center">
          <div>
            <h2 className="text-[18px] text-ink">{l === "kk" ? "Мектептер мен репетиторларға" : "Школам и репетиторам"}</h2>
            <p className="mt-1 text-[15px] text-muted">{l === "kk" ? "Сыныпқа арналған пробный тесттер мен прогресс есептері." : "Пробные тесты для класса и отчёты о прогрессе."}</p>
          </div>
          <Button href={lp(l, "/support#partners")} size="sm" arrow="external">
            {l === "kk" ? "Өту" : "Перейти"}
          </Button>
        </div>
      </div>
    </section>
  );
}
