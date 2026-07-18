/**
 * Open-World Bosses — extends Dynamic World Events (wandering_world_boss + BOSS_HIT).
 * Honest backlog: full 100-player HP sync needs Live World realtime service.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { creditCredits } from "@/lib/credits/ledger";
import {
  WORLD_EVENT_MULTIPLAYER_BACKLOG,
} from "@/lib/world-events/config";
import {
  activateWorldEvent,
  getActiveWorldEventInstance,
  recordWorldEventParticipation,
} from "@/lib/world-events";
import type { WorldEventInputSignal } from "@/lib/world-events/types";

export type WorldBossState = {
  instanceId: string;
  eventKey: "wandering_world_boss";
  name: string;
  regionSlug: string;
  maxHp: number;
  hp: number;
  phase: "spawning" | "fight" | "enraged" | "defeated" | "fled";
  contributors: { userId: string; damage: number }[];
  startedAt: string;
  note: string;
};

type Store = { boss: WorldBossState | null };

function store(): Store {
  const g = globalThis as unknown as { __rwWorldBoss?: Store };
  if (!g.__rwWorldBoss) g.__rwWorldBoss = { boss: null };
  return g.__rwWorldBoss;
}

export function resetWorldBossForTests(): void {
  store().boss = null;
}

export function getWorldBossState(): WorldBossState | null {
  return store().boss;
}

export function spawnWorldBoss(params?: {
  regionSlug?: string;
  now?: number;
}): WorldBossState {
  const now = params?.now ?? Date.now();
  const enabled =
    isFeatureEnabled("LIVE_WORLD_WORLD_BOSSES_ENABLED") ||
    isFeatureEnabled("LIVE_WORLD_EVENTS_ENABLED");
  if (!enabled) {
    throw new Error("World bosses disabled");
  }

  const event = activateWorldEvent({
    key: "wandering_world_boss",
    triggerReason: "ADMIN",
    skipAnnounce: true,
    regionSlug: params?.regionSlug,
    now,
  });

  const boss: WorldBossState = {
    instanceId: event.id,
    eventKey: "wandering_world_boss",
    name: event.name,
    regionSlug: event.regionSlug,
    maxHp: 10_000,
    hp: 10_000,
    phase: "fight",
    contributors: [],
    startedAt: new Date(now).toISOString(),
    note: "Phase 1 shared HP is process-local. " + WORLD_EVENT_MULTIPLAYER_BACKLOG[0],
  };
  store().boss = boss;
  trackAnalytics("world_boss_engage", { region: boss.regionSlug, action: "spawn" });
  return boss;
}

export function engageWorldBoss(params: {
  userId: string;
  damage?: number;
  signals?: WorldEventInputSignal[];
  now?: number;
}): {
  ok: boolean;
  error?: string;
  message?: string;
  boss?: WorldBossState;
  credits?: number;
} {
  const now = params.now ?? Date.now();
  let boss = store().boss;
  if (!boss || boss.phase === "defeated" || boss.phase === "fled") {
    boss = spawnWorldBoss({ now });
  }

  const active = getActiveWorldEventInstance();
  if (!active || active.id !== boss.instanceId) {
    // Re-bind if event ended
    boss = spawnWorldBoss({ now, regionSlug: boss.regionSlug });
  }

  const part = recordWorldEventParticipation({
    userId: params.userId,
    action: "BOSS_HIT",
    signals: params.signals ?? ["MOVE", "COMBAT"],
    regionSlug: boss.regionSlug,
    now,
  });
  if (!part.ok) {
    return { ok: false, error: part.error, message: part.message, boss };
  }

  const damage = Math.max(1, Math.min(250, params.damage ?? 40));
  const hp = Math.max(0, boss.hp - damage);
  const contributors = [...boss.contributors];
  const existing = contributors.find((c) => c.userId === params.userId);
  if (existing) existing.damage += damage;
  else contributors.push({ userId: params.userId, damage });

  let phase = boss.phase;
  if (hp <= boss.maxHp * 0.25 && hp > 0) phase = "enraged";
  if (hp <= 0) phase = "defeated";

  boss = { ...boss, hp, contributors, phase };
  store().boss = boss;
  trackAnalytics("world_boss_engage", { damage, phase });

  let credits = 0;
  if (phase === "defeated") {
    const grant = creditCredits({
      userId: params.userId,
      amount: 50,
      reason: "EVENT_REWARD",
      requestId: `boss_kill_${boss.instanceId}_${params.userId}`,
      metadata: { boss: boss.name },
    });
    if (grant.ok) credits = 50;
  }

  return {
    ok: true,
    boss,
    credits,
    message:
      phase === "defeated"
        ? "Colossus falls — soft Credits for engaged keepers. Full raid sync is backlog."
        : `Hit landed (−${damage} HP).`,
  };
}

export function worldBossSnapshot() {
  return {
    boss: getWorldBossState(),
    multiplayerBacklog: WORLD_EVENT_MULTIPLAYER_BACKLOG,
    activeEvent: getActiveWorldEventInstance(),
  };
}
