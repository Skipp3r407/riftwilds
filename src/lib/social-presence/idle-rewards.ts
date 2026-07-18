/**
 * Idle participation rewards every 15–30 min of genuine activity.
 * Credits / cosmetics only — never SOL.
 */

import {
  COSMETIC_IDLE_STUBS,
  IDLE_CLAIM_CREDITS_MAX,
  IDLE_CLAIM_CREDITS_MIN,
  IDLE_CLAIM_MAX_MS,
  IDLE_CLAIM_MIN_MS,
  IDLE_CLAIMS_PER_DAY,
  IDLE_GENUINE_ACTIVE_RATIO,
} from "@/lib/social-presence/config";
import type { IdleParticipationClaim, PresencePlayerState } from "@/lib/social-presence/types";

function dayKey(now: number): string {
  return new Date(now).toISOString().slice(0, 10);
}

export function nextIdleWindowMs(userId: string, now = Date.now()): number {
  // Deterministic jitter per user/day between 15–30 min
  const seed = [...`${userId}:${dayKey(now)}`].reduce((a, c) => a + c.charCodeAt(0), 0);
  const span = IDLE_CLAIM_MAX_MS - IDLE_CLAIM_MIN_MS;
  return IDLE_CLAIM_MIN_MS + (seed % span);
}

export function creditsForIdleClaim(userId: string, now = Date.now()): number {
  const seed = [...`${userId}:idle:${dayKey(now)}:${Math.floor(now / IDLE_CLAIM_MIN_MS)}`].reduce(
    (a, c) => a + c.charCodeAt(0),
    0,
  );
  const span = IDLE_CLAIM_CREDITS_MAX - IDLE_CLAIM_CREDITS_MIN;
  return IDLE_CLAIM_CREDITS_MIN + (seed % (span + 1));
}

export function cosmeticStubForIdle(userId: string, now = Date.now()): string | null {
  const seed = [...`${userId}:cos:${dayKey(now)}`].reduce((a, c) => a + c.charCodeAt(0), 0);
  // ~35% chance of a cosmetic stub
  if (seed % 100 > 35) return null;
  return COSMETIC_IDLE_STUBS[seed % COSMETIC_IDLE_STUBS.length]!;
}

export function canClaimIdleParticipation(
  state: PresencePlayerState,
  now = Date.now(),
): { ok: true; windowMs: number } | { ok: false; reason: string; nextInMs: number | null } {
  const key = dayKey(now);
  const claimsToday =
    state.idleClaimDayKey === key ? state.idleClaimsToday : 0;
  if (claimsToday >= IDLE_CLAIMS_PER_DAY) {
    return { ok: false, reason: "daily_cap", nextInMs: null };
  }

  const windowMs = nextIdleWindowMs(state.userId, now);
  const last = state.lastIdleClaimAt ?? 0;
  const elapsed = now - last;
  if (last > 0 && elapsed < windowMs) {
    return { ok: false, reason: "cooldown", nextInMs: windowMs - elapsed };
  }

  // Need enough genuine active time since last claim (or session start)
  const needed = Math.floor(windowMs * IDLE_GENUINE_ACTIVE_RATIO);
  if (state.genuineActiveMs < needed && last === 0 && state.genuineActiveMs < IDLE_CLAIM_MIN_MS * IDLE_GENUINE_ACTIVE_RATIO) {
    return {
      ok: false,
      reason: "insufficient_genuine_activity",
      nextInMs: needed - state.genuineActiveMs,
    };
  }
  if (last > 0 && state.genuineActiveMs < needed) {
    return {
      ok: false,
      reason: "insufficient_genuine_activity",
      nextInMs: needed - state.genuineActiveMs,
    };
  }

  return { ok: true, windowMs };
}

export function buildIdleClaim(
  state: PresencePlayerState,
  presenceXpBonus: number,
  now = Date.now(),
): IdleParticipationClaim {
  return {
    id: `idle_${state.userId}_${now}`,
    at: new Date(now).toISOString(),
    windowMinutes: Math.round(nextIdleWindowMs(state.userId, now) / 60_000),
    credits: creditsForIdleClaim(state.userId, now),
    cosmeticStubId: cosmeticStubForIdle(state.userId, now),
    presenceXp: presenceXpBonus,
  };
}
