/**
 * Client helpers for keeper progression — never send raw XP amounts.
 */

import type { ProgressionSnapshot, XpGrantResult } from "@/lib/progression/types";

export type GrantClientResult = XpGrantResult & { requestId?: string; streak?: number };

export async function fetchProgressionSnapshot(): Promise<ProgressionSnapshot | null> {
  try {
    const res = await fetch("/api/progression", { credentials: "include" });
    if (!res.ok) return null;
    const data = (await res.json()) as { snapshot?: ProgressionSnapshot; enabled?: boolean };
    if (data.enabled === false) return null;
    return data.snapshot ?? null;
  } catch {
    return null;
  }
}

export async function grantProgressionSource(params: {
  source: string;
  requestId?: string;
  context?: Record<string, unknown>;
}): Promise<GrantClientResult | null> {
  try {
    const res = await fetch("/api/progression/grant", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: params.source,
        requestId: params.requestId,
        context: params.context,
      }),
    });
    return (await res.json()) as GrantClientResult;
  } catch {
    return null;
  }
}

export async function claimDailyProgression(): Promise<GrantClientResult | null> {
  try {
    const res = await fetch("/api/progression/daily", {
      method: "POST",
      credentials: "include",
    });
    return (await res.json()) as GrantClientResult;
  } catch {
    return null;
  }
}

export async function requestPrestige(): Promise<{
  ok: boolean;
  error?: string;
  snapshot?: ProgressionSnapshot;
} | null> {
  try {
    const res = await fetch("/api/progression/prestige", {
      method: "POST",
      credentials: "include",
    });
    return (await res.json()) as {
      ok: boolean;
      error?: string;
      snapshot?: ProgressionSnapshot;
    };
  } catch {
    return null;
  }
}

/** Dispatch a browser event so the top-bar XP UI can animate. */
export function emitProgressionEvent(detail: {
  granted?: number;
  levelsGained?: number;
  snapshot?: ProgressionSnapshot | null;
  rewards?: unknown[];
}): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("riftwilds:progression", { detail }));
}

export const PROGRESSION_EVENT = "riftwilds:progression";
