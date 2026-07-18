/**
 * Anti-AFK activity tracking — claims require meaningful recent activity.
 */

import {
  ACTIVITY_WINDOW_MS,
  MAX_ACTIVITY_LOG,
  MIN_ACTIVITIES_FOR_CLAIM,
} from "@/lib/loyalty/config";
import type { ActivityKind, PlayerActivityEvent } from "@/lib/loyalty/types";

const VALID_KINDS: ActivityKind[] = [
  "MOVEMENT",
  "QUEST",
  "COMBAT",
  "CRAFT",
  "CARE",
  "GATHER",
  "SOCIAL",
  "EXPLORATION",
  "FISH",
  "BOSS",
  "PARTY_HELP",
  "HEAL",
  "TRADE",
  "PUZZLE",
  "TREASURE",
  "PUBLIC_EVENT",
]

export function isValidActivityKind(kind: unknown): kind is ActivityKind {
  return typeof kind === "string" && (VALID_KINDS as string[]).includes(kind);
}

export function appendActivity(
  log: PlayerActivityEvent[],
  kind: ActivityKind,
  detail?: string,
  now = Date.now(),
): PlayerActivityEvent[] {
  const next: PlayerActivityEvent = {
    id: `act_${now}_${Math.random().toString(36).slice(2, 8)}`,
    kind,
    at: new Date(now).toISOString(),
    detail,
  };
  const merged = [...log, next];
  if (merged.length > MAX_ACTIVITY_LOG) {
    return merged.slice(merged.length - MAX_ACTIVITY_LOG);
  }
  return merged;
}

export function recentActivities(
  log: PlayerActivityEvent[],
  now = Date.now(),
  windowMs = ACTIVITY_WINDOW_MS,
): PlayerActivityEvent[] {
  const cutoff = now - windowMs;
  return log.filter((e) => Date.parse(e.at) >= cutoff);
}

/**
 * Eligibility for airdrop claim — must have meaningful activity in the window.
 * Pure login without movement/quest/combat/etc. is denied.
 */
export function hasMeaningfulActivity(
  log: PlayerActivityEvent[],
  now = Date.now(),
  minCount = MIN_ACTIVITIES_FOR_CLAIM,
  windowMs = ACTIVITY_WINDOW_MS,
): { ok: true; count: number } | { ok: false; count: number; message: string } {
  const recent = recentActivities(log, now, windowMs);
  if (recent.length < minCount) {
    return {
      ok: false,
      count: recent.length,
      message:
        "Anti-AFK: record meaningful activity (movement, quest, combat, craft, care, gather, or exploration) before claiming.",
    };
  }
  return { ok: true, count: recent.length };
}
