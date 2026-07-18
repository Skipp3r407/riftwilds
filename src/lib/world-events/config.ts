/**
 * Tunables for Dynamic World Events.
 * Casual rewards = soft Credits only. Never SOL. Never AFK.
 */

import type { WorldEventParticipationAction } from "@/lib/world-events/types";

/** Minimum gap between auto-spawned events. */
export const WORLD_EVENT_SPAWN_COOLDOWN_MS = 25 * 60_000;

/** Scheduler considers UTC hours 14–02 as “active story hours”. */
export const WORLD_EVENT_ACTIVE_HOURS_UTC = { start: 14, end: 2 } as const;

/** Engagement window — no recent signal ⇒ no score. */
export const WORLD_EVENT_SIGNAL_WINDOW_MS = 45_000;

/** Standing still longer than this blocks participation even with stale signals. */
export const WORLD_EVENT_MOTIONLESS_BLOCK_MS = 90_000;

export const WORLD_EVENT_MAX_INPUT_LOG = 40;

/** Diminishing returns after N repeats of the same action. */
export const WORLD_EVENT_DIMINISHING_AFTER = 3;
export const WORLD_EVENT_DIMINISHING_DECAY = 0.65;

export const WORLD_EVENT_ACTION_POINTS: Record<WorldEventParticipationAction, number> = {
  ARRIVE: 2,
  DEFEND: 8,
  RESCUE: 7,
  SCOUT: 4,
  REPAIR: 6,
  ESCORT: 6,
  GATHER_AID: 5,
  NPC_HELP: 4,
  PHOTO: 3,
  BOSS_HIT: 10,
  TREASURE_CLAIM: 5,
};

/** Soft Credit grant when a keeper first qualifies (capped via EVENT_REWARD faucet). */
export const WORLD_EVENT_QUALIFY_CREDITS = 25;

export const WORLD_EVENT_HISTORY_LIMIT = 24;
export const WORLD_EVENT_AUDIT_LIMIT = 80;

export const WORLD_EVENT_MULTIPLAYER_BACKLOG = [
  "Authoritative 100-player boss sync (shared HP, aggro, loot rolls) needs dedicated Live World realtime service — not serverless alone.",
  "Deterministic tick lockstep + interest management for event instances across shards.",
  "Spectator-safe replay / cinema cams for legendary events without leaking hidden loot.",
  "Cross-region caravan routes with path blocking that reconciles with navigation mesh.",
  "Anti-cheat validation of BOSS_HIT / TREASURE_CLAIM from client positions (server physics).",
  "Persistent world-change TTL in Prisma when WORLD_PERSISTENCE_PRISMA_ENABLED ships.",
] as const;

export const WORLD_EVENT_PUBLIC_NOTE =
  "Dynamic World Events create stories in the Live World. Participate with real movement and actions — standing still earns nothing. Rewards are soft Credits / cosmetics only, never SOL.";
