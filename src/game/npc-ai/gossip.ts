/**
 * Gradual gossip / rumor spread across regions.
 * Knowledge is NOT instant-global — heat travels with lag + distance decay.
 */

import type { PlayerReputation } from "@/game/npc-ai/reputation";
import { clampReputation, createDefaultReputation } from "@/game/npc-ai/reputation";

export const GOSSIP_STORE_KEY = "riftwilds-npc-gossip-v1";

export type GossipRumor = {
  id: string;
  originRegionId: string;
  text: string;
  /** 0–100 intensity at origin when created. */
  heat: number;
  createdAt: number;
  /** Axes snapshot the rumor carries (partial truth). */
  axesHint: Partial<PlayerReputation>;
};

export type RegionGossipKnowledge = {
  regionId: string;
  /** How much of the rumor this region believes (0–100). */
  awareness: number;
  lastTickAt: number;
};

export type GossipStore = {
  rumors: GossipRumor[];
  /** rumorId → regionId → knowledge */
  byRumor: Record<string, Record<string, RegionGossipKnowledge>>;
  updatedAt: number;
};

/** Soft adjacency for Commons-first world — not a full graph. */
export const REGION_NEIGHBORS: Record<string, string[]> = {
  "riftwild-commons": ["elderwood-forest", "ember-crater", "moonwater-coast"],
  "elderwood-forest": ["riftwild-commons", "ember-crater"],
  "ember-crater": ["riftwild-commons", "elderwood-forest"],
  "moonwater-coast": ["riftwild-commons"],
};

/** Hours (sim) for full awareness to reach a neighbor — used as ms scale in tests. */
export const GOSSIP_HOP_MS = 45_000;
export const GOSSIP_MAX_RUMORS = 24;

export function createEmptyGossipStore(): GossipStore {
  return { rumors: [], byRumor: {}, updatedAt: Date.now() };
}

export function loadGossipStore(): GossipStore {
  if (typeof window === "undefined") return createEmptyGossipStore();
  try {
    const raw = localStorage.getItem(GOSSIP_STORE_KEY);
    if (!raw) return createEmptyGossipStore();
    const parsed = JSON.parse(raw) as GossipStore;
    return {
      rumors: parsed.rumors ?? [],
      byRumor: parsed.byRumor ?? {},
      updatedAt: parsed.updatedAt ?? Date.now(),
    };
  } catch {
    return createEmptyGossipStore();
  }
}

export function saveGossipStore(store: GossipStore): void {
  if (typeof window === "undefined") return;
  try {
    store.updatedAt = Date.now();
    localStorage.setItem(GOSSIP_STORE_KEY, JSON.stringify(store));
  } catch {
    /* ignore */
  }
}

export function seedGossipRumor(
  store: GossipStore,
  input: {
    id?: string;
    originRegionId: string;
    text: string;
    heat: number;
    axesHint?: Partial<PlayerReputation>;
    at?: number;
  },
): GossipStore {
  const at = input.at ?? Date.now();
  const id = input.id ?? `rumor-${at}-${input.originRegionId}`;
  const rumor: GossipRumor = {
    id,
    originRegionId: input.originRegionId,
    text: input.text,
    heat: Math.max(0, Math.min(100, input.heat)),
    createdAt: at,
    axesHint: input.axesHint ?? {},
  };
  store.rumors = [...store.rumors.filter((r) => r.id !== id), rumor].slice(-GOSSIP_MAX_RUMORS);
  store.byRumor[id] = {
    [input.originRegionId]: {
      regionId: input.originRegionId,
      awareness: Math.min(100, rumor.heat),
      lastTickAt: at,
    },
  };
  return store;
}

function neighbors(regionId: string): string[] {
  return REGION_NEIGHBORS[regionId] ?? ["riftwild-commons"];
}

/**
 * Lightweight background sim — advances awareness into neighboring regions over time.
 * Distant regions gain knowledge slowly; never jumps to 100 everywhere instantly.
 */
export function tickGossipSpread(store: GossipStore, now = Date.now()): GossipStore {
  for (const rumor of store.rumors) {
    const map = store.byRumor[rumor.id] ?? {};
    store.byRumor[rumor.id] = map;

    // Ensure origin stays hot
    if (!map[rumor.originRegionId]) {
      map[rumor.originRegionId] = {
        regionId: rumor.originRegionId,
        awareness: Math.min(100, rumor.heat),
        lastTickAt: now,
      };
    }

    const knownRegions = Object.keys(map);
    for (const regionId of knownRegions) {
      const knowledge = map[regionId]!;
      const elapsed = now - knowledge.lastTickAt;
      if (elapsed < GOSSIP_HOP_MS / 3) continue;

      // Decay slightly in quiet regions
      if (regionId !== rumor.originRegionId && knowledge.awareness > 5) {
        knowledge.awareness = Math.max(0, knowledge.awareness - 1);
      }
      knowledge.lastTickAt = now;

      if (knowledge.awareness < 12) continue;

      for (const next of neighbors(regionId)) {
        const existing = map[next];
        const transfer = Math.floor(knowledge.awareness * 0.35);
        if (!existing) {
          // New hop — lag gate: only after enough time since rumor creation + hops
          const hops = regionDistance(rumor.originRegionId, next);
          const readyAt = rumor.createdAt + hops * GOSSIP_HOP_MS;
          if (now < readyAt) continue;
          map[next] = {
            regionId: next,
            awareness: Math.min(70, Math.max(8, transfer)),
            lastTickAt: now,
          };
        } else if (existing.awareness < knowledge.awareness * 0.9) {
          existing.awareness = Math.min(
            95,
            existing.awareness + Math.max(2, Math.floor(transfer * 0.25)),
          );
          existing.lastTickAt = now;
        }
      }
    }
  }
  store.updatedAt = now;
  return store;
}

/** BFS distance between regions (uncapped soft). */
export function regionDistance(from: string, to: string): number {
  if (from === to) return 0;
  const seen = new Set<string>([from]);
  let frontier = [from];
  let dist = 0;
  while (frontier.length && dist < 8) {
    dist += 1;
    const next: string[] = [];
    for (const r of frontier) {
      for (const n of neighbors(r)) {
        if (n === to) return dist;
        if (!seen.has(n)) {
          seen.add(n);
          next.push(n);
        }
      }
    }
    frontier = next;
  }
  return 4;
}

export function regionAwareness(
  store: GossipStore,
  regionId: string,
): number {
  let max = 0;
  for (const rumor of store.rumors) {
    const a = store.byRumor[rumor.id]?.[regionId]?.awareness ?? 0;
    if (a > max) max = a;
  }
  return max;
}

/**
 * Blend true reputation with regional gossip — distant regions see a dampened version.
 * Awareness 0 → near-defaults (no killer knowledge); 100 → full known axes from hints + truth.
 */
export function knownReputationInRegion(
  trueAxes: PlayerReputation,
  store: GossipStore,
  regionId: string,
  now = Date.now(),
): PlayerReputation {
  const ticked = tickGossipSpread(store, now);
  const awareness = regionAwareness(ticked, regionId) / 100;
  const base = createDefaultReputation();

  // Merge axis hints from rumors that reached this region
  const hinted = { ...base };
  for (const rumor of ticked.rumors) {
    const a = (ticked.byRumor[rumor.id]?.[regionId]?.awareness ?? 0) / 100;
    if (a <= 0) continue;
    for (const [key, val] of Object.entries(rumor.axesHint) as [keyof PlayerReputation, number][]) {
      hinted[key] = Math.max(hinted[key], Math.round((val ?? 0) * a));
    }
  }

  const known = { ...base };
  for (const key of Object.keys(trueAxes) as (keyof PlayerReputation)[]) {
    // Local region learns faster from presence; still gated by awareness for dark axes
    const truth = trueAxes[key];
    const hint = hinted[key];
    const dark =
      key === "notoriety" ||
      key === "criminal" ||
      key === "infamy" ||
      key === "cruelty";
    if (dark) {
      known[key] = Math.round(Math.max(hint, truth * awareness));
    } else {
      // Positive fame also lags, but less harshly
      const a = Math.max(awareness, regionId === ticked.rumors[0]?.originRegionId ? 0.55 : 0);
      known[key] = Math.round(truth * Math.max(0.25, a) + hint * (1 - Math.max(0.25, a)));
    }
  }
  return clampReputation(known);
}

/** Instant global knowledge would set all regions to 100 — we never do that. */
export function isInstantGlobal(store: GossipStore): boolean {
  if (!store.rumors.length) return false;
  const regions = new Set<string>();
  for (const list of Object.values(REGION_NEIGHBORS)) {
    for (const r of list) regions.add(r);
  }
  for (const r of Object.keys(REGION_NEIGHBORS)) regions.add(r);
  for (const rumor of store.rumors) {
    for (const regionId of regions) {
      const a = store.byRumor[rumor.id]?.[regionId]?.awareness ?? 0;
      if (a < 90) return false;
    }
  }
  return true;
}
