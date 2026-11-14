"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/** Keeps a flat record of string/number values in sync with the URL query (replaceState). */
export function useQueryState<T extends Record<string, string | number>>(defaults: T) {
  const [state, setState] = useState<T>(defaults);
  const ready = useRef(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const next = { ...defaults };
    (Object.keys(defaults) as (keyof T)[]).forEach((k) => {
      const raw = p.get(k as string);
      if (raw == null) return;
      if (typeof defaults[k] === "number") {
        const n = Number(raw);
        if (!Number.isNaN(n)) (next[k] as number) = n;
      } else (next[k] as string) = raw;
    });
    setState(next);
    ready.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready.current) return;
    const p = new URLSearchParams(window.location.search);
    Object.entries(state).forEach(([k, v]) => p.set(k, String(v)));
    const url = `${window.location.pathname}?${p.toString()}${window.location.hash}`;
    window.history.replaceState(window.history.state, "", url);
  }, [state]);

  const set = useCallback(<K extends keyof T>(k: K, v: T[K]) => setState((s) => ({ ...s, [k]: v })), []);
  return [state, set, setState] as const;
}

export function useCopyLink() {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(async (opts?: { share?: boolean; title?: string }) => {
    const url = window.location.href;
    try {
      if (opts?.share && navigator.share) {
        await navigator.share({ url, title: opts.title });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* user cancelled or clipboard blocked */
    }
  }, []);
  return { copied, copy };
}

/** Simple countdown timer. */
export function useCountdown(initial: number, onDone?: () => void) {
  const [left, setLeft] = useState(initial);
  const [running, setRunning] = useState(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setLeft((l) => {
        if (l <= 1) {
          clearInterval(id);
          setRunning(false);
          setTimeout(() => doneRef.current?.(), 0);
          return 0;
        }
        return l - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  const reset = useCallback((n: number) => {
    setRunning(false);
    setLeft(n);
  }, []);
  return { left, running, start: () => setRunning(true), pause: () => setRunning(false), reset };
}

export const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

/** Short beep via WebAudio (used when sound is on). */
export function beep(freq = 660, ms = 120) {
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.frequency.value = freq;
    g.gain.value = 0.06;
    o.connect(g).connect(ctx.destination);
    o.start();
    setTimeout(() => {
      o.stop();
      ctx.close();
    }, ms);
  } catch {}
}
