import type { L } from "@/lib/i18n";
import type { Block, Cell, Guide } from "../guides";

export const s = (kk: string, ru: string): L => ({ kk, ru });
export const same = (x: string): L => ({ kk: x, ru: x });

export const h2 = (id: string, kk: string, ru: string): Block => ({ type: "h2", id, text: s(kk, ru) });
export const p = (kk: string, ru: string): Block => ({ type: "p", text: s(kk, ru) });
export const ul = (...items: [string, string][]): Block => ({ type: "ul", items: items.map(([k, r]) => s(k, r)) });
export const tip = (lk: string, lr: string, tk: string, tr: string): Block => ({ type: "tip", lead: s(lk, lr), text: s(tk, tr) });
export const table = (head: [string, string][], rows: Cell[][]): Block => ({ type: "table", head: head.map(([k, r]) => s(k, r)), rows });
export const cta = (path: string, tk: string, tr: string, sk: string, sr: string): Block => ({ type: "cta", path, title: s(tk, tr), sub: s(sk, sr) });

export function lesson(g: {
  slug: string;
  category: string;
  title: L;
  description: L;
  summary: L[];
  blocks: Block[];
  closing: L;
  author?: string;
  faqs?: { q: L; a: L }[];
}): Guide {
  return {
    slug: g.slug,
    category: g.category,
    title: g.title,
    description: g.description,
    lede: g.description,
    author: g.author ?? "methodists",
    updated: "2026-11-14",
    summary: g.summary,
    blocks: g.blocks,
    faqs: g.faqs ?? [],
    closing: g.closing,
    full: true,
  };
}
