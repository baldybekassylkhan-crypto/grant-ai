import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Button } from "./Button";
import { PlanButton } from "./PlanAware";

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items, sep = "›", className }: { items: Crumb[]; sep?: string; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-[14px] font-bold text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <Fragment key={i}>
              <li>
                {c.href && !last ? (
                  <Link href={c.href} className="underline-offset-4 hover:text-ink hover:underline">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current={last ? "page" : undefined} className={last ? "text-ink" : undefined}>
                    {c.label}
                  </span>
                )}
              </li>
              {!last && (
                <li aria-hidden className="opacity-60">
                  {sep}
                </li>
              )}
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export function SkipLink({ href = "#main", label = "Мазмұнға өту / Перейти к содержимому" }: { href?: string; label?: string }) {
  return (
    <a
      href={href}
      className="sr-only z-[100] rounded-full bg-dark-pill px-5 py-3 text-[14px] font-extrabold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
    >
      {label}
    </a>
  );
}

export function CtaBand({
  title,
  sub,
  cta,
  href,
  tone = "info",
  className,
}: {
  title: string;
  sub?: string;
  cta: string;
  href: string;
  tone?: "info" | "primary";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start justify-between gap-5 rounded-[32px] p-6 md:flex-row md:items-center md:p-10",
        tone === "info" ? "bg-info-bg" : "bg-primary-tint",
        className,
      )}
    >
      <div>
        <h2 className="text-[24px] leading-tight text-ink md:text-[30px]">{title}</h2>
        {sub && <p className="mt-2 max-w-xl text-[16px] text-muted">{sub}</p>}
      </div>
      {/\/quiz(\?|$)/.test(href) ? (
        <PlanButton href={href} size="lg" className="shrink-0">
          {cta}
        </PlanButton>
      ) : (
        <Button href={href} size="lg" className="shrink-0">
          {cta}
        </Button>
      )}
    </div>
  );
}

/** Tiny inline markup: **bold** and [label](href). External links get ↗. */
export function Inline({
  text,
  linkClass = "prose-link",
  boldClass = "font-bold text-ink",
}: {
  text: string;
  linkClass?: string;
  boldClass?: string;
}) {
  const out: ReactNode[] = [];
  const re = /\*\*(.+?)\*\*|\[(.+?)\]\((.+?)\)/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let k = 0;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(<Fragment key={k++}>{text.slice(last, m.index)}</Fragment>);
    if (m[1]) {
      out.push(
        <strong key={k++} className={boldClass}>
          {m[1]}
        </strong>,
      );
    } else {
      const href = m[3];
      const external = /^https?:/.test(href);
      out.push(
        external ? (
          <a key={k++} href={href} className={linkClass} target="_blank" rel="noopener noreferrer">
            {m[2]}&nbsp;↗
          </a>
        ) : (
          <Link key={k++} href={href} className={linkClass}>
            {m[2]}
          </Link>
        ),
      );
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(<Fragment key={k++}>{text.slice(last)}</Fragment>);
  return <>{out}</>;
}

export function SectionHeading({
  title,
  sub,
  center,
  className,
  id,
}: {
  title: string;
  sub?: string;
  center?: boolean;
  className?: string;
  id?: string;
}) {
  return (
    <div className={cn(center && "text-center", className)}>
      <h2 id={id} className="text-[24px] leading-[1.2] text-ink md:text-[36px]">
        {title}
      </h2>
      {sub && <p className={cn("mt-3 text-[16px] leading-6 text-muted", center && "mx-auto max-w-xl")}>{sub}</p>}
    </div>
  );
}
