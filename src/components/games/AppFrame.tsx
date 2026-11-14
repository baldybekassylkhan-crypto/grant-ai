"use client";

import { Maximize2, Minimize2, Play, Volume2, VolumeX } from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { UI } from "@/content/ui";
import { useLocale } from "@/lib/useLocale";

export type Theme = "dark" | "light" | "warm";

const INTERIOR: Record<Theme, string> = {
  dark: "bg-[radial-gradient(120%_120%_at_0%_0%,#1B2B57_0%,#0B1220_55%,#2A0F24_100%)] text-white",
  light: "bg-card text-ink",
  warm: "bg-[linear-gradient(160deg,#FFF4D9_0%,#FFEDE0_60%,#FFECE9_100%)] text-[#030A19]",
};

export function AppFrame({
  title,
  dot,
  theme,
  sound,
  onSound,
  children,
}: {
  title: string;
  dot: string;
  theme: Theme;
  sound: boolean;
  onSound: () => void;
  children: ReactNode;
}) {
  const l = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);
  useEffect(() => {
    const on = () => setFs(document.fullscreenElement === ref.current);
    document.addEventListener("fullscreenchange", on);
    return () => document.removeEventListener("fullscreenchange", on);
  }, []);
  return (
    <div ref={ref} className="overflow-hidden rounded-2xl bg-dark-pill shadow-soft">
      <div className="flex h-10 items-center justify-between px-4">
        <div className="flex items-center gap-2 text-[13px] font-extrabold text-white">
          <span aria-hidden className="size-2.5 rounded-full" style={{ background: dot }} />
          {title}
        </div>
        <button
          type="button"
          onClick={() => (fs ? document.exitFullscreen() : ref.current?.requestFullscreen?.())}
          className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-white/10 px-3 text-[12px] font-bold text-white hover:bg-white/20"
        >
          {fs ? <Minimize2 className="size-3.5" aria-hidden /> : <Maximize2 className="size-3.5" aria-hidden />}
          {fs ? UI.exit[l] : UI.fullscreen[l]}
        </button>
      </div>
      <div className={cn("relative min-h-[520px] md:aspect-[16/10] md:min-h-0", fs && "h-[calc(100vh-40px)] md:aspect-auto", INTERIOR[theme])}>
        <button
          type="button"
          onClick={onSound}
          aria-pressed={sound}
          aria-label={sound ? UI.soundOff[l] : UI.soundOn[l]}
          className={cn(
            "absolute right-3 top-3 z-10 inline-flex size-10 items-center justify-center rounded-full",
            theme === "dark" ? "bg-white/10 hover:bg-white/20" : "bg-black/5 hover:bg-black/10",
          )}
        >
          {sound ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
        </button>
        <div className="absolute inset-0 overflow-y-auto p-5 md:p-8">{children}</div>
      </div>
    </div>
  );
}

export type Difficulty = { id: string; name: string; level: string; text: string; bar: number; color: string };

export function DifficultyCard({ d, selected, onSelect, theme }: { d: Difficulty; selected: boolean; onSelect: () => void; theme: Theme }) {
  const dark = theme === "dark";
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={cn(
        "flex min-h-11 flex-col rounded-2xl p-3.5 text-left transition-[box-shadow,background-color]",
        dark ? "bg-white/5 hover:bg-white/10" : "bg-white/80 hover:bg-white",
        selected ? "shadow-[inset_0_0_0_2px_var(--primary)]" : dark ? "shadow-[inset_0_0_0_1px_rgba(255,255,255,.12)]" : "ring-line",
      )}
    >
      <span className="flex items-center justify-between gap-2">
        <span className="text-[15px] font-extrabold">{d.name}</span>
        <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide", dark ? "bg-white/10" : "bg-surface text-muted")}>{d.level}</span>
      </span>
      <span className={cn("mt-1 text-[12px] leading-4", dark ? "text-white/70" : "text-muted")}>{d.text}</span>
      <span className={cn("mt-3 h-1 w-full rounded-full", dark ? "bg-white/10" : "bg-line")}>
        <span className="block h-1 rounded-full" style={{ width: `${d.bar}%`, background: d.color }} />
      </span>
    </button>
  );
}

export function StartScreen({
  title,
  instruction,
  theme,
  difficulties,
  difficulty,
  setDifficulty,
  topics,
  topic,
  setTopic,
  onPlay,
}: {
  title: string;
  instruction: string;
  theme: Theme;
  difficulties: Difficulty[];
  difficulty: string;
  setDifficulty: (id: string) => void;
  topics: { id: string; label: string }[];
  topic: string;
  setTopic: (t: string) => void;
  onPlay: () => void;
}) {
  const l = useLocale();
  const dark = theme === "dark";
  return (
    <div className="mx-auto flex max-w-[640px] flex-col items-center text-center">
      <h2 className="mt-2 text-[26px] leading-tight md:text-[34px]">{title}</h2>
      <p className={cn("mt-2 max-w-md text-[14px]", dark ? "text-white/75" : "text-muted")}>{instruction}</p>
      <div role="radiogroup" aria-label={UI.difficulty[l]} className="mt-5 grid w-full gap-2 sm:grid-cols-3">
        {difficulties.map((d) => (
          <DifficultyCard key={d.id} d={d} theme={theme} selected={d.id === difficulty} onSelect={() => setDifficulty(d.id)} />
        ))}
      </div>
      <div role="radiogroup" aria-label={UI.topic[l]} className="mt-4 flex flex-wrap justify-center gap-2">
        {topics.map((t) => (
          <button
            key={t.id}
            type="button"
            role="radio"
            aria-checked={t.id === topic}
            onClick={() => setTopic(t.id)}
            className={cn(
              "min-h-9 rounded-full px-3.5 text-[13px] font-bold transition-colors",
              t.id === topic ? "bg-primary text-white" : dark ? "bg-white/10 text-white hover:bg-white/20" : "bg-white text-ink ring-line hover:bg-surface",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>
      <button
        type="button"
        onClick={onPlay}
        className="mt-6 inline-flex min-h-12 items-center gap-2 rounded-full bg-primary px-8 text-[14px] font-extrabold uppercase tracking-[0.08em] text-white hover:bg-primary-hover"
      >
        <Play className="size-4 fill-white" aria-hidden /> {UI.play[l]}
      </button>
    </div>
  );
}
