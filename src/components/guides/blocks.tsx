import Link from "next/link";
import { ArrowRight, Check, ChevronRight, Lightbulb } from "lucide-react";
import { CircleArrow } from "@/components/ui/Button";
import { MascotAvatar } from "@/components/ui/Logo";
import { Inline } from "@/components/ui/misc";
import { DataTable } from "@/components/tools/shared";
import { UI } from "@/content/ui";
import { cellText, guidePath, type Author, type Block, type Guide } from "@/content/guides";
import { lp, type L, type Locale } from "@/lib/i18n";
import { Practice } from "./Practice";
import { PlanCtaCard } from "@/components/ui/PlanAware";

export function GuideList({ guides, locale: l }: { guides: Guide[]; locale: Locale }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {guides.map((g) => (
        <li key={g.slug}>
          <Link href={lp(l, guidePath(g))} className="group flex items-center gap-4 px-2 py-4">
            <span className="min-w-0 flex-1">
              <span className="block text-[17px] font-extrabold text-ink underline-offset-4 group-hover:underline">{g.title[l]}</span>
              <span className="mt-1 line-clamp-2 block text-[15px] leading-6 text-muted">{g.description[l]}</span>
            </span>
            <ChevronRight aria-hidden className="size-5 shrink-0 text-muted transition-transform duration-150 group-hover:translate-x-1" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

export function GlanceCard({ title, items, locale: l }: { title: string; items: { label: L; value: L }[]; locale: Locale }) {
  return (
    <aside className="rounded-[28px] bg-card p-5 shadow-soft-ring" aria-label={title}>
      <p className="eyebrow text-info">{title}</p>
      <dl className="mt-4 space-y-3">
        {items.map((it) => (
          <div key={it.label.kk}>
            <dt className="text-[12px] font-semibold text-muted">{it.label[l]}</dt>
            <dd className="text-[15px] font-bold text-ink">{it.value[l]}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}

export function SummaryBox({ items, locale: l }: { items: L[]; locale: Locale }) {
  return (
    <section id="summary" aria-labelledby="summary-h" className="mb-12 rounded-[28px] bg-primary-tint px-6 pb-[26px] pt-7 md:px-8">
      <h2 id="summary-h" className="text-[21px] text-primary-deep">
        {UI.inShort[l]}
      </h2>
      <ul className="mt-4 space-y-3">
        {items.map((x, i) => (
          <li key={i} className="flex gap-3 text-[17px] font-semibold leading-7 text-ink md:text-[19px]">
            <span aria-hidden className="mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full bg-primary">
              <Check className="size-3.5 text-white" strokeWidth={3} />
            </span>
            {x[l]}
          </li>
        ))}
      </ul>
    </section>
  );
}

export function Callout({ lead, text, locale: l }: { lead: string; text: string; locale: Locale }) {
  return (
    <aside className="mt-10 grid grid-cols-[40px_1fr] gap-4 rounded-[20px] bg-info-bg px-6 py-[22px]">
      <span aria-hidden className="inline-flex size-10 items-center justify-center rounded-full bg-info">
        <Lightbulb className="size-5 text-white" />
      </span>
      <div>
        <p className="text-[13px] font-extrabold uppercase tracking-[1px] text-info-text">{UI.tip[l]}</p>
        <p className="mt-1 text-[17px] leading-7 text-body md:text-[18px]">
          <strong className="font-bold text-ink">{lead}</strong> <Inline text={text} />
        </p>
      </div>
    </aside>
  );
}

export function CtaCard({ title, sub, href }: { title: string; sub: string; href: string }) {
  return (
    <Link href={href} className="group mt-10 flex items-center gap-4 rounded-[28px] bg-primary-tint py-7 pl-6 pr-7 transition-colors hover:bg-primary-tint-2">
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[20px] leading-tight text-ink md:text-[25px]">{title}</span>
        <span className="mt-2 block text-[15px] font-bold text-muted">{sub}</span>
      </span>
      <CircleArrow size={52} tone="primary" />
    </Link>
  );
}

export function Figure({ label, caption }: { label: string; caption: string }) {
  return (
    <figure className="mt-10">
      <div className="flex aspect-[16/9] items-center justify-center rounded-[20px] bg-surface ring-line" role="img" aria-label={label}>
        <div className="grid w-3/4 gap-3" aria-hidden>
          <div className="mx-auto h-8 w-1/2 rounded-xl bg-primary/80" />
          <div className="grid grid-cols-3 gap-3">
            {["#135EF2", "#049AEE", "#F56207"].map((c) => (
              <div key={c} className="h-16 rounded-xl" style={{ background: c + "33", boxShadow: `inset 0 0 0 1.5px ${c}` }} />
            ))}
          </div>
        </div>
      </div>
      <figcaption className="mt-3 text-[15px] font-semibold text-muted">{caption}</figcaption>
    </figure>
  );
}

export function ArticleBlock({ b, locale: l }: { b: Block; locale: Locale }) {
  switch (b.type) {
    case "h2":
      return (
        <h2 id={b.id} className="mt-16 scroll-mt-24 text-[24px] leading-[1.2] text-ink md:text-[30px] md:leading-[38px]">
          {b.text[l]}
        </h2>
      );
    case "p":
      return (
        <p className="mt-5 text-[18px] leading-[30px] text-body md:text-[19px] md:leading-[31.35px]">
          <Inline text={b.text[l]} />
        </p>
      );
    case "ul":
      return (
        <ul className="mt-5 space-y-3">
          {b.items.map((it, i) => (
            <li key={i} className="relative pl-[30px] text-[18px] leading-[30px] text-body md:text-[19px] md:leading-[31.35px]">
              <span aria-hidden className="absolute left-1 top-[11px] size-2.5 rounded-full bg-primary" />
              <Inline text={it[l]} />
            </li>
          ))}
        </ul>
      );
    case "figure":
      return <Figure label={b.label[l]} caption={b.caption[l]} />;
    case "table":
      return <DataTable className="mt-10" head={b.head.map((h) => h[l])} rows={b.rows.map((r) => r.map((c) => cellText(c, l)))} />;
    case "tip":
      return <Callout lead={b.lead[l]} text={b.text[l]} locale={l} />;
    case "cta":
      return b.path.startsWith("/quiz") ? <PlanCtaCard title={b.title[l]} sub={b.sub[l]} href={lp(l, b.path)} /> : <CtaCard title={b.title[l]} sub={b.sub[l]} href={lp(l, b.path)} />;
    case "practice":
      return <Practice subject={b.subject} topic={b.topic} limit={b.limit} />;
  }
}

export function HubLink({ name, href, count, locale: l }: { name: string; href: string; count: number; locale: Locale }) {
  return (
    <Link href={href} className="group mt-12 flex items-center gap-4 rounded-[20px] bg-surface px-6 py-5">
      <span className="flex-1">
        <span className="block text-[18px] font-extrabold text-ink">
          {UI.moreIn[l]} «{name}»
        </span>
        <span className="text-[15px] text-muted">
          {count} {UI.guidesInCategory[l]}
        </span>
      </span>
      <ChevronRight aria-hidden className="size-5 text-muted transition-transform group-hover:translate-x-1" />
    </Link>
  );
}

export function AuthorBox({ author, locale: l }: { author: Author; locale: Locale }) {
  return (
    <section aria-label={UI.aboutAuthor[l]} className="mt-10 grid grid-cols-[64px_1fr] gap-5 rounded-[28px] p-7 ring-line-15">
      <MascotAvatar size={64} bg={author.avatarBg} />
      <div>
        <p className="text-[18px] font-extrabold text-ink">{author.name[l]}</p>
        <p className="text-[15px] font-bold text-muted">{author.role[l]}</p>
        <p className="mt-2 text-[16px] leading-6 text-body">{author.bio[l]}</p>
        <Link href={lp(l, `/authors/${author.slug}`)} className="mt-3 inline-flex min-h-9 items-center gap-1 text-[15px] font-extrabold text-ink underline-offset-4 hover:underline">
          {UI.allArticles[l]} <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
