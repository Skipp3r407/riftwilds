/**
 * Hidden Lore & Secret Discoveries — registry + unlocks.
 * Coordinates with exploration markers; never leaks coords until discovered.
 */

import { trackAnalytics } from "@/lib/analytics/events";
import { creditCredits } from "@/lib/credits/ledger";

export type SecretDiscoveryDef = {
  id: string;
  title: string;
  regionSlug: string;
  /** Fog-of-war hint only until unlocked. */
  hint: string;
  loreSnippet: string;
  rarity: "uncommon" | "rare" | "legendary";
  /** Soft Credits on first find — capped faucet. */
  creditReward: number;
  requiresSignal: boolean;
};

export const SECRET_DISCOVERY_CATALOG: SecretDiscoveryDef[] = [
  {
    id: "lore-plaza-understone",
    title: "Understone Chorus Marks",
    regionSlug: "riftwild-commons",
    hint: "A faint hum beneath the plaza stones after rain.",
    loreSnippet: "Five Gateway Stones once sang the same note beneath Commons.",
    rarity: "uncommon",
    creditReward: 12,
    requiresSignal: true,
  },
  {
    id: "lore-ember-glass-ledger",
    title: "Glass Ledger Fragment",
    regionSlug: "ember-crater",
    hint: "Ash that refuses to cool near the ridge.",
    loreSnippet: "Serae’s seals once failed for an hour — ink remembered the heat.",
    rarity: "rare",
    creditReward: 20,
    requiresSignal: true,
  },
  {
    id: "lore-elder-false-path",
    title: "False Path Root-Mark",
    regionSlug: "elderwood-forest",
    hint: "Moss that glows only when you stop walking.",
    loreSnippet: "Night paths in Elderwood rewrite themselves for the lonely.",
    rarity: "rare",
    creditReward: 18,
    requiresSignal: true,
  },
  {
    id: "lore-void-shepherd-quiet",
    title: "Shepherd’s Quiet Echo",
    regionSlug: "void-hollow",
    hint: "Silence thicker than fog along the hollow rim.",
    loreSnippet: "The hush muffles music so eggs can dream without names.",
    rarity: "legendary",
    creditReward: 35,
    requiresSignal: true,
  },
  {
    id: "lore-tide-ship-bell",
    title: "Drowned Bell of Tidehold",
    regionSlug: "moonwater-coast",
    hint: "A bell tone that arrives before the wave.",
    loreSnippet: "Tidehold songs return when twin moons lean close.",
    rarity: "uncommon",
    creditReward: 14,
    requiresSignal: true,
  },
];

type Unlock = { discoveryId: string; userId: string; at: string };

type Store = { unlocks: Map<string, Unlock> };

function store(): Store {
  const g = globalThis as unknown as { __rwHiddenLore?: Store };
  if (!g.__rwHiddenLore) g.__rwHiddenLore = { unlocks: new Map() };
  return g.__rwHiddenLore;
}

function unlockKey(userId: string, discoveryId: string) {
  return `${userId}::${discoveryId}`;
}

export function resetHiddenLoreForTests(): void {
  store().unlocks.clear();
}

export function listSecretHints(regionSlug?: string) {
  return SECRET_DISCOVERY_CATALOG.filter((d) => !regionSlug || d.regionSlug === regionSlug).map(
    (d) => ({
      id: d.id,
      regionSlug: d.regionSlug,
      hint: d.hint,
      rarity: d.rarity,
      // Never leak title/lore until unlocked
    }),
  );
}

export function discoverSecret(params: {
  userId: string;
  discoveryId: string;
  engaged: boolean;
  requestId: string;
}):
  | { ok: true; title: string; loreSnippet: string; credits: number; firstFind: boolean }
  | { ok: false; error: string; message: string } {
  const def = SECRET_DISCOVERY_CATALOG.find((d) => d.id === params.discoveryId);
  if (!def) return { ok: false, error: "unknown", message: "Unknown discovery." };
  if (def.requiresSignal && !params.engaged) {
    return {
      ok: false,
      error: "afk",
      message: "Explore actively — standing still reveals nothing.",
    };
  }

  const k = unlockKey(params.userId, def.id);
  const firstFind = !store().unlocks.has(k);
  if (firstFind) {
    store().unlocks.set(k, {
      discoveryId: def.id,
      userId: params.userId,
      at: new Date().toISOString(),
    });
    creditCredits({
      userId: params.userId,
      amount: def.creditReward,
      reason: "EVENT_REWARD",
      requestId: params.requestId,
      metadata: { discoveryId: def.id, rarity: def.rarity },
    });
    trackAnalytics("secret_discovery", { id: def.id, rarity: def.rarity });
  }

  return {
    ok: true,
    title: def.title,
    loreSnippet: def.loreSnippet,
    credits: firstFind ? def.creditReward : 0,
    firstFind,
  };
}

export function listUnlockedSecrets(userId: string) {
  const ids = [...store().unlocks.values()]
    .filter((u) => u.userId === userId)
    .map((u) => u.discoveryId);
  return SECRET_DISCOVERY_CATALOG.filter((d) => ids.includes(d.id)).map((d) => ({
    id: d.id,
    title: d.title,
    loreSnippet: d.loreSnippet,
    regionSlug: d.regionSlug,
    rarity: d.rarity,
  }));
}
