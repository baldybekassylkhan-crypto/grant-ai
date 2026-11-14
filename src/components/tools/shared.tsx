import Link from "next/link";
import { Calculator, CalendarClock, Gauge, Mic, PenLine, Scale, Search, type LucideIcon } from "lucide-react";
import { CircleArrow } from "@/components/ui/Button";
import { Breadcrumbs } from "@/components/ui/misc";
import { accent } from "@/lib/accents";
import { lp, type Locale } from "@/lib/i18n";
import { UI } from "@/content/ui";
import type { Tool, ToolIcon } from "@/content/tools";

export const TOOL_ICONS: Record<ToolIcon, LucideIcon> = {
  calculator: Calculator,
  calendar: CalendarClock,
  gauge: Gauge,
  search: Search,
  mic: Mic,
  pen: PenLine,
  scale: Scale,
};

export function ToolCard({ tool, locale: l }: { tool: Tool; locale: Locale }) {
  const a = accent(tool.accentIndex);
  const Icon = TOOL_ICONS[tool.icon];
  const href = lp(l, `/tools/${tool.slug}`);
  return (
    <div className="group relative flex min-h-[76px] overflow-hidden rounded-[20px] bg-card shadow-soft-ring transition-transform duration-150 hover:-translate-y-0.5">
      <div className="flex w-20 shrink-0 items-center justify-center rounded-r-[28px]" style={{ background: a.color }} aria-hidden>
        <Icon className="size-7 text-white" strokeWidth={2} />
      </div>
      <div className="flex min-w-0 flex-1 flex-col justify-center gap-1 py-4 pl-4 pr-14">
        <h3 className="font-display text-[17px] leading-tight text-ink">
          <Link href={href} className="after:absolute after:inset-0 after:content-['']">
            {tool.title[l]}
          </Link>
        </h3>
        <p className="text-[14px] leading-5 text-muted">{tool.description[l]}</p>
        {tool.popular && (
          <div className="relative z-10 mt-2 flex flex-wrap items-center gap-1.5">
            <span className="text-[12px] font-bold text-muted">{l === "kk" ? "Танымал:" : "Популярное:"}</span>
            {tool.popular.map((p) => (
              <Link key={p.query} href={href + p.query} className="inline-flex min-h-7 items-center rounded-full bg-info-bg px-2.5 text-[12px] font-bold text-info-text hover:underline">
                {p.label[l]}
              </Link>
            ))}
          </div>
        )}
      </div>
      <CircleArrow className="absolute bottom-4 right-4" />
    </div>
  );
}

export function ToolHero({ tool, locale: l }: { tool: Tool; locale: Locale }) {
  const a = accent(tool.accentIndex);
  return (
    <div className="pb-10 pt-6" style={{ background: a.tint }}>
      <div className="container-site">
        <Breadcrumbs items={[{ label: UI.home[l], href: lp(l) }, { label: UI.freeTools[l], href: lp(l, "/tools") }, { label: tool.short[l] }]} />
        <h1 className="mt-4 text-[30px] leading-[1.1] text-ink md:text-[50px]">{tool.title[l]}</h1>
        <p className="mt-4 max-w-[640px] text-[17px] leading-7 text-body md:text-[19px]">{tool.intro[l]}</p>
        <a href="#tool" className="sr-only rounded-full bg-dark-pill px-4 py-2 text-[13px] font-bold text-white focus:not-sr-only focus:mt-4 focus:inline-block">
          {UI.skipTool[l]}
        </a>
      </div>
    </div>
  );
}

export { DataTableClient as DataTable } from "./DataTableClient";
