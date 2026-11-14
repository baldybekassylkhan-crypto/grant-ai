import type { ReactNode } from "react";

export type ProseSection = { id?: string; heading: string; body: (string | { list: string[]; ordered?: boolean } | { h3: string })[] };

/** Shared plain prose template for support and legal pages. */
export function ProsePage({ title, updated, updatedLabel = "Last updated", intro, sections, children }: { title: string; updated?: string; updatedLabel?: string; intro?: string; sections: ProseSection[]; children?: ReactNode }) {
  return (
    <div className="bg-page">
      <article className="mx-auto max-w-[720px] px-4 pb-24 pt-12 md:px-6">
        <h1 className="text-[28px] leading-tight text-ink md:text-[32px]">{title}</h1>
        {updated && <p className="mt-2 text-[14px] font-semibold text-muted">{updatedLabel}: {updated}</p>}
        {intro && <p className="mt-5 text-[16px] leading-[1.7] text-body">{intro}</p>}
        {sections.map((s) => (
          <section key={s.heading + (s.id ?? "")} id={s.id} className="scroll-mt-24">
            <h2 className="mt-10 font-sans text-[20px] font-extrabold text-ink">{s.heading}</h2>
            {s.body.map((b, i) => {
              if (typeof b === "string")
                return (
                  <p
                    key={i}
                    className="mt-3 text-[15px] leading-[1.7] text-body md:text-[16px] [&_a]:text-primary-deep [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: b }}
                  />
                );
              if ("h3" in b)
                return (
                  <h3 key={i} className="mt-6 text-[16px] font-bold text-ink">
                    {b.h3}
                  </h3>
                );
              const Tag = b.ordered ? "ol" : "ul";
              return (
                <Tag key={i} className={b.ordered ? "mt-3 list-decimal space-y-1.5 pl-6 text-[15px] leading-[1.7] text-body md:text-[16px]" : "mt-3 space-y-1.5 text-[15px] leading-[1.7] text-body md:text-[16px]"}>
                  {b.list.map((li) => (
                    <li key={li} className={b.ordered ? "" : "relative pl-5"}>
                      {!b.ordered && <span aria-hidden className="absolute left-1 top-[0.75em] size-1.5 rounded-full bg-muted" />}
                      {li}
                    </li>
                  ))}
                </Tag>
              );
            })}
          </section>
        ))}
        {children}
      </article>
    </div>
  );
}
