"use client";

/**
 * Client account state + sync between localStorage and the server account.
 * Local keys stay the single place components read from; when signed in, every change is also saved to /api/me.
 */
import { useEffect, useState } from "react";

export type AccountUser = { id: number; email: string; name: string; role: string; created_at?: string };
type ServerData = { plan: unknown; progress: Record<string, boolean>; mockHistory: HistoryItem[]; updatedAt: string | null };
type HistoryItem = { id: number; pair: string | null; total: number; max: number; at: string; per?: unknown };

export const KEYS = { plan: "grantai:unt-quiz", progress: "grantai:plan-progress", history: "grantai:mock-history" } as const;
export const SYNC_EVENT = "grantai:sync";

let user: AccountUser | null | undefined = undefined;
let loading: Promise<void> | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((f) => f());

const read = <X,>(k: string, fallback: X): X => {
  try {
    const v = localStorage.getItem(k);
    return v ? (JSON.parse(v) as X) : fallback;
  } catch {
    return fallback;
  }
};
const write = (k: string, v: unknown) => {
  try {
    if (v === null || v === undefined) localStorage.removeItem(k);
    else localStorage.setItem(k, JSON.stringify(v));
  } catch {}
};

function applyServer(data: ServerData) {
  if (data.plan) write(KEYS.plan, data.plan);
  write(KEYS.progress, data.progress ?? {});
  write(KEYS.history, data.mockHistory ?? []);
  window.dispatchEvent(new Event(SYNC_EVENT));
  window.dispatchEvent(new Event("grantai:plan"));
}

const histKey = (h: HistoryItem) => `${h.id}|${h.pair ?? ""}|${h.at}`;

/** Merge local (guest) data into the account after sign-in/registration, then save the merged result. */
export async function mergeAfterLogin(server: ServerData) {
  const localPlan = read<Record<string, unknown> | null>(KEYS.plan, null);
  const localProgress = read<Record<string, boolean>>(KEYS.progress, {});
  const localHist = read<HistoryItem[]>(KEYS.history, []);
  const plan = server.plan ?? localPlan ?? null;
  const progress = { ...localProgress, ...Object.fromEntries(Object.entries(server.progress ?? {}).filter(([, v]) => v)) };
  const map = new Map<string, HistoryItem>();
  [...(server.mockHistory ?? []), ...localHist].forEach((h) => map.set(histKey(h), h));
  const mockHistory = [...map.values()].sort((a, b) => a.at.localeCompare(b.at)).slice(-100);
  applyServer({ plan, progress, mockHistory, updatedAt: null });
  await fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, progress, mockHistory }) }).catch(() => {});
}

export function loadAccount(force = false) {
  if (loading && !force) return loading;
  loading = fetch("/api/me", { cache: "no-store" })
    .then((r) => r.json())
    .then((j: { user: AccountUser | null; data?: ServerData }) => {
      user = j.user;
      // signed in: the account is the source of truth for this device
      if (j.user && j.data) applyServer(j.data);
    })
    .catch(() => {
      user = null;
    })
    .finally(emit);
  return loading;
}

export function setUser(u: AccountUser | null) {
  user = u;
  emit();
}

export function useAccount() {
  const [, force] = useState(0);
  useEffect(() => {
    const f = () => force((x) => x + 1);
    listeners.add(f);
    if (user === undefined) loadAccount();
    return () => {
      listeners.delete(f);
    };
  }, []);
  return { user, loading: user === undefined };
}

/** Save a change to the account (debounced per field). No-op for guests. */
const timers: Record<string, ReturnType<typeof setTimeout>> = {};
export function pushToAccount(patch: { plan?: unknown; progress?: Record<string, boolean>; mockHistory?: unknown[] }) {
  const send = () => {
    if (!user) return;
    fetch("/api/me", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch) }).catch(() => {});
  };
  const key = Object.keys(patch).join(",");
  clearTimeout(timers[key]);
  timers[key] = setTimeout(() => {
    if (user === undefined) loadAccount().then(send);
    else send();
  }, 600);
}

export async function logout() {
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
  // keep nothing personal on a shared device
  write(KEYS.plan, null);
  write(KEYS.progress, null);
  write(KEYS.history, null);
  window.dispatchEvent(new Event(SYNC_EVENT));
  window.dispatchEvent(new Event("grantai:plan"));
  setUser(null);
}
