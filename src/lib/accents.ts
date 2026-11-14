/** Category accent set, in spec order. */
export const ACCENTS = [
  { name: "blue", color: "#135EF2", tint: "var(--tint-blue)" },
  { name: "coral", color: "#FF4B3C", tint: "var(--tint-coral)" },
  { name: "sky", color: "#049AEE", tint: "var(--tint-sky)" },
  { name: "orange", color: "#F56207", tint: "var(--tint-orange)" },
  { name: "orange", color: "#F56207", tint: "var(--tint-orange)" },
  { name: "amber", color: "#F3B105", tint: "var(--tint-amber)" },
  { name: "orchid", color: "#D67BDD", tint: "var(--tint-orchid)" },
] as const;

export type Accent = (typeof ACCENTS)[number];
export const accent = (i: number): Accent => ACCENTS[((i % ACCENTS.length) + ACCENTS.length) % ACCENTS.length];
