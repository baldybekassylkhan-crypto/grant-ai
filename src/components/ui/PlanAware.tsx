"use client";

import Link from "next/link";
import { useEffect, useState, type ComponentProps, type ReactNode } from "react";
import { Button } from "./Button";
import { CircleArrow } from "./Button";
import { useLocale } from "@/lib/useLocale";

/** True once the visitor has a saved plan (quiz finished at least up to role). */
export function useHasPlan() {
  const [has, setHas] = useState(false);
  useEffect(() => {
    const check = () => {
      try {
        setHas(!!JSON.parse(localStorage.getItem("grantai:unt-quiz") || "null")?.role);
      } catch {}
    };
    check();
    window.addEventListener("grantai:plan", check);
    window.addEventListener("grantai:sync", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("grantai:plan", check);
      window.removeEventListener("grantai:sync", check);
      window.removeEventListener("storage", check);
    };
  }, []);
  return has;
}

const toPlan = (href: string) => href.replace(/\/quiz(\?.*)?$/, "/plan");
const GO: Record<string, string> = { kk: "Жоспарға өту", ru: "Перейти к плану" };

/** Button to the quiz that turns into «Жоспарға өту» once a plan exists. */
export function PlanButton({ href, children, ...rest }: ComponentProps<typeof Button> & { href: string }) {
  const has = useHasPlan();
  const l = useLocale();
  return (
    <Button href={has ? toPlan(href) : href} {...rest}>
      {has ? GO[l] : children}
    </Button>
  );
}

/** Large CTA card variant (used in lessons/articles). */
export function PlanCtaCard({ title, sub, href }: { title: string; sub: string; href: string }) {
  const has = useHasPlan();
  const l = useLocale();
  return (
    <Link href={has ? toPlan(href) : href} className="group mt-10 flex items-center gap-4 rounded-[28px] bg-primary-tint py-7 pl-6 pr-7 transition-colors hover:bg-primary-tint-2">
      <span className="min-w-0 flex-1">
        <span className="block font-display text-[20px] leading-tight text-ink md:text-[25px]">{has ? GO[l] : title}</span>
        <span className="mt-2 block text-[15px] font-bold text-muted">{has ? (l === "kk" ? "Жоспарыңыз сақталған — прогресті жалғастырыңыз." : "Ваш план сохранён — продолжайте прогресс.") : sub}</span>
      </span>
      <CircleArrow size={52} tone="primary" />
    </Link>
  );
}

/** Inline text link variant. */
export function PlanLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const has = useHasPlan();
  const l = useLocale();
  return (
    <Link href={has ? toPlan(href) : href} className={className}>
      {has ? `${GO[l]} →` : children}
    </Link>
  );
}
