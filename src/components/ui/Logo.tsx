import Link from "next/link";
import { cn } from "@/lib/cn";
import type { Locale } from "@/lib/i18n";
import { UI } from "@/content/ui";

/** The grant.ai mascot: a white capsule with a friendly face, inside a primary pill. */
export function Mascot({
  size = 32,
  className,
  bg = "var(--primary)",
  title,
}: {
  size?: number;
  className?: string;
  bg?: string;
  title?: string;
}) {
  return (
    <svg
      width={size * 1.375}
      height={size}
      viewBox="0 0 44 32"
      className={cn("shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="44" height="32" rx="16" fill={bg} />
      <rect x="7" y="8" width="30" height="16" rx="8" fill="#fff" />
      <circle cx="17" cy="14.5" r="1.9" fill="#030A19" />
      <circle cx="27" cy="14.5" r="1.9" fill="#030A19" />
      <path d="M18.5 18.6c2 1.8 5 1.8 7 0" stroke="#030A19" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    </svg>
  );
}

/** Square avatar version of the mascot (28% squircle). */
export function MascotAvatar({
  size = 44,
  bg = "var(--primary)",
  className,
}: {
  size?: number;
  bg?: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex shrink-0 items-center justify-center", className)}
      style={{ width: size, height: size, borderRadius: "28%", background: bg }}
    >
      <svg viewBox="0 0 30 16" width={size * 0.72} height={size * 0.4}>
        <rect width="30" height="16" rx="8" fill="#fff" />
        <circle cx="10" cy="6.5" r="1.7" fill="#030A19" />
        <circle cx="20" cy="6.5" r="1.7" fill="#030A19" />
        <path d="M11.5 10.4c2 1.6 5 1.6 7 0" stroke="#030A19" strokeWidth="1.6" strokeLinecap="round" fill="none" />
      </svg>
    </span>
  );
}

export function Logo({
  locale,
  tagline = false,
  small = false,
  className,
}: {
  locale: Locale;
  tagline?: boolean;
  small?: boolean;
  className?: string;
}) {
  return (
    <Link href={`/${locale}`} className={cn("inline-flex items-center gap-2 rounded-full", className)} aria-label="grant.ai home">
      <Mascot size={small ? 22 : 28} />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-ink", small ? "text-[16px]" : "text-[20px]")}>grant.ai</span>
        {tagline && <span className="mt-0.5 text-[10px] font-semibold text-muted">{UI.tagline[locale]}</span>}
      </span>
    </Link>
  );
}
