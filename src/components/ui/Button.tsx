import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "blue" | "dark";
type Size = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center justify-center gap-2 rounded-full font-extrabold uppercase tracking-[0.08em] text-center transition-[background-color,color,box-shadow,transform] duration-150 ease-out disabled:opacity-50 disabled:pointer-events-none select-none";

const variants: Record<Variant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-card text-ink shadow-soft-ring hover:bg-surface",
  blue: "bg-info text-white hover:brightness-110",
  dark: "bg-ink text-page hover:opacity-90",
};

const sizes: Record<Size, string> = {
  sm: "min-h-9 px-4 text-[12px]",
  md: "min-h-10 px-5 text-[13px]",
  lg: "min-h-12 px-6 text-[14px]",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

type Common = {
  variant?: Variant;
  size?: Size;
  arrow?: boolean | "external";
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
};

function Arrow({ kind }: { kind: true | "external" }) {
  const Icon = kind === "external" ? ArrowUpRight : ArrowRight;
  return (
    <Icon
      aria-hidden
      className="size-4 shrink-0 transition-transform duration-150 group-hover:translate-x-0.5"
      strokeWidth={2.5}
    />
  );
}

export function Button({
  href,
  variant = "primary",
  size = "md",
  arrow = true,
  icon,
  className,
  children,
  ...rest
}: Common & { href?: string } & Omit<ComponentProps<"button">, "children">) {
  const inner = (
    <>
      {icon}
      <span>{children}</span>
      {arrow && <Arrow kind={arrow} />}
    </>
  );
  const cls = buttonClass(variant, size, className);
  if (href) {
    const external = /^https?:|^mailto:/.test(href);
    if (external)
      return (
        <a href={href} className={cls} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
          {inner}
        </a>
      );
    return (
      <Link href={href} className={cls}>
        {inner}
      </Link>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {inner}
    </button>
  );
}

export function CircleArrow({
  size = 32,
  tone = "ink",
  className,
}: {
  size?: number;
  tone?: "ink" | "primary";
  className?: string;
}) {
  return (
    <span
      aria-hidden
      style={{ width: size, height: size }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full transition-transform duration-150 group-hover:translate-x-0.5",
        tone === "ink" ? "bg-ink text-page" : "bg-primary text-white",
        className,
      )}
    >
      <ArrowRight style={{ width: size * 0.45, height: size * 0.45 }} strokeWidth={2.5} />
    </span>
  );
}
