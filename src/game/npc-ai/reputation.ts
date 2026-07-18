/**
 * Multi-axis player reputation — hero / criminal / merchant / etc.
 * Killer notoriety is one axis among many; factions weigh axes differently.
 * Credits/fines OK for repair; never requires SOL.
 */

import { buildKillerReputation, type KillerReputation } from "@/game/npc-ai/killer-reputation";

export const PLAYER_REPUTATION_KEY = "riftwilds-player-reputation-v1";

/** All reputation axes. Values are 0–100 unless noted. */
export type ReputationAxis =
  | "hero"
  | "town"
  | "guild"
  | "faction"
  | "merchant"
  | "criminal"
  | "notoriety"
  | "honor"
  | "mercy"
  | "cruelty"
  | "trust"
  | "infamy"
  | "monsterHunter"
  | "explorer";

export const REPUTATION_AXES: ReputationAxis[] = [
  "hero",
  "town",
  "guild",
  "faction",
  "merchant",
  "criminal",
  "notoriety",
  "honor",
  "mercy",
  "cruelty",
  "trust",
  "infamy",
  "monsterHunter",
  "explorer",
];

export type PlayerReputation = Record<ReputationAxis, number>;

export type ReputationStore = {
  axes: PlayerReputation;
  /** Region id where the last notable deed/crime happened. */
  lastDeedRegionId?: string;
  updatedAt: number;
};

export function createDefaultReputation(): PlayerReputation {
  return {
    hero: 10,
    town: 20,
    guild: 0,
    faction: 0,
    merchant: 15,
    criminal: 0,
    notoriety: 0,
    honor: 25,
    mercy: 20,
    cruelty: 0,
    trust: 20,
    infamy: 0,
    monsterHunter: 0,
    explorer: 5,
  };
}

export function createEmptyReputationStore(): ReputationStore {
  return { axes: createDefaultReputation(), updatedAt: Date.now() };
}

export function clampAxis(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function clampReputation(axes: PlayerReputation): PlayerReputation {
  const next = { ...axes };
  for (const key of REPUTATION_AXES) {
    next[key] = clampAxis(next[key] ?? 0);
  }
  return next;
}

export type ReputationDelta = Partial<Record<ReputationAxis, number>>;

export function applyReputationDelta(
  axes: PlayerReputation,
  delta: ReputationDelta,
): PlayerReputation {
  const next = { ...axes };
  for (const [key, amount] of Object.entries(delta) as [ReputationAxis, number][]) {
    next[key] = clampAxis((next[key] ?? 0) + amount);
  }
  return next;
}

export function loadReputationStore(): ReputationStore {
  if (typeof window === "undefined") return createEmptyReputationStore();
  try {
    const raw = localStorage.getItem(PLAYER_REPUTATION_KEY);
    if (!raw) return createEmptyReputationStore();
    const parsed = JSON.parse(raw) as ReputationStore;
    return {
      axes: clampReputation({ ...createDefaultReputation(), ...(parsed.axes ?? {}) }),
      lastDeedRegionId: parsed.lastDeedRegionId,
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return createEmptyReputationStore();
  }
}

export function saveReputationStore(store: ReputationStore): void {
  if (typeof window === "undefined") return;
  try {
    store.updatedAt = Date.now();
    store.axes = clampReputation(store.axes);
    localStorage.setItem(PLAYER_REPUTATION_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

/** Sync notoriety/criminal/infamy from killer counters (one-way feed). */
export function syncReputationFromKiller(
  axes: PlayerReputation,
  killer: KillerReputation,
): PlayerReputation {
  const fromKiller = Math.max(axes.notoriety, killer.score);
  return clampReputation({
    ...axes,
    notoriety: fromKiller,
    criminal: Math.max(axes.criminal, Math.round(killer.score * 0.85)),
    infamy: Math.max(axes.infamy, Math.round(killer.score * 0.7)),
    cruelty: Math.max(
      axes.cruelty,
      Math.min(100, killer.pvpKills * 12 + killer.bountyTier * 15),
    ),
    hero: killer.knownAsKiller
      ? Math.min(axes.hero, Math.max(0, axes.hero - Math.floor(killer.score / 20)))
      : axes.hero,
    trust: killer.knownAsKiller
      ? Math.min(axes.trust, Math.max(0, axes.trust - Math.floor(killer.score / 25)))
      : axes.trust,
  });
}

export function reputationFromPlayState(state: {
  pvpKills?: number;
  combatKills?: number;
  enemiesDefeated?: number;
  killerReputation?: number;
  bountyTier?: number;
  flags?: string[];
  regionsVisited?: string[];
}): PlayerReputation {
  const killer = buildKillerReputation(state);
  let axes = createDefaultReputation();
  axes = syncReputationFromKiller(axes, killer);
  const explored = state.regionsVisited?.length ?? 1;
  axes.explorer = clampAxis(Math.max(axes.explorer, explored * 8));
  if (state.flags?.includes("hero_deed")) {
    axes = applyReputationDelta(axes, { hero: 25, town: 15, honor: 10, mercy: 8 });
  }
  if (state.flags?.includes("merchant_favored")) {
    axes = applyReputationDelta(axes, { merchant: 20, trust: 10 });
  }
  if (state.flags?.includes("guild_member")) {
    axes = applyReputationDelta(axes, { guild: 30, faction: 10 });
  }
  if (state.flags?.includes("monster_slayer")) {
    axes = applyReputationDelta(axes, { monsterHunter: 30, hero: 10 });
  }
  return clampReputation(axes);
}

export type ReputationBand =
  | "unknown"
  | "noted"
  | "renowned"
  | "legendary"
  | "infamous"
  | "feared";

export function axisBand(value: number, dark = false): ReputationBand {
  if (dark) {
    if (value < 15) return "unknown";
    if (value < 35) return "noted";
    if (value < 60) return "infamous";
    if (value < 80) return "feared";
    return "legendary";
  }
  if (value < 15) return "unknown";
  if (value < 35) return "noted";
  if (value < 60) return "renowned";
  return "legendary";
}

/** Dominant social identity for dialogue / UI. */
export function dominantReputationIdentity(axes: PlayerReputation): {
  identity: "hero" | "criminal" | "merchant" | "hunter" | "explorer" | "citizen";
  score: number;
} {
  const candidates: { identity: "hero" | "criminal" | "merchant" | "hunter" | "explorer" | "citizen"; score: number }[] = [
    { identity: "criminal", score: Math.max(axes.notoriety, axes.criminal, axes.infamy) },
    { identity: "hero", score: Math.max(axes.hero, axes.honor * 0.8) },
    { identity: "merchant", score: axes.merchant },
    { identity: "hunter", score: axes.monsterHunter },
    { identity: "explorer", score: axes.explorer },
  ];
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates[0]!;
  if (top.score < 25) return { identity: "citizen", score: axes.town };
  return top;
}
