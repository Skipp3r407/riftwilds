/**
 * Phase 14 — Off-chain Collectibles (Credits buy / earn). NFT mint stays flagged off.
 */

import { settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type CollectibleDef = {
  key: string;
  name: string;
  kind: "BADGE" | "TITLE" | "COSMETIC" | "TROPHY";
  priceCredits: number | null;
  earnOnly: boolean;
};

export const COLLECTIBLE_CATALOG: CollectibleDef[] = [
  { key: "badge-first-hatch", name: "First Hatch Badge", kind: "BADGE", priceCredits: null, earnOnly: true },
  { key: "title-riftwalker", name: "Title: Riftwalker", kind: "TITLE", priceCredits: 120, earnOnly: false },
  { key: "cosmetic-aurora-trail", name: "Aurora Trail", kind: "COSMETIC", priceCredits: 200, earnOnly: false },
  { key: "trophy-storm-survivor", name: "Storm Survivor Trophy", kind: "TROPHY", priceCredits: null, earnOnly: true },
];

type Store = { owned: Map<string, Set<string>> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsCollectibles?: Store };
  if (!g.__riftwildsCollectibles) g.__riftwildsCollectibles = { owned: new Map() };
  return g.__riftwildsCollectibles;
}

export function listOwnedCollectibles(userId: string): string[] {
  return [...(store().owned.get(userId) ?? new Set())];
}

export function grantCollectible(userId: string, key: string): { ok: true } | { ok: false; reason: string } {
  if (!COLLECTIBLE_CATALOG.some((c) => c.key === key)) {
    return { ok: false, reason: "unknown" };
  }
  let set = store().owned.get(userId);
  if (!set) {
    set = new Set();
    store().owned.set(userId, set);
  }
  set.add(key);
  return { ok: true };
}

export function buyCollectible(params: {
  userId: string;
  key: string;
  requestId: string;
}): { ok: true; key: string } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("COLLECTIBLES_ECONOMY_ENABLED")) {
    return { ok: false, error: "disabled", message: "Collectibles disabled" };
  }
  if (isFeatureEnabled("ONCHAIN_COLLECTIBLES_ENABLED") || isFeatureEnabled("NFT_MINTING_ENABLED")) {
    // Still off-chain grant only — never mint here.
  }
  const def = COLLECTIBLE_CATALOG.find((c) => c.key === params.key);
  if (!def || def.earnOnly || def.priceCredits == null) {
    return { ok: false, error: "not_for_sale", message: "Collectible not for sale" };
  }
  if (listOwnedCollectibles(params.userId).includes(def.key)) {
    return { ok: false, error: "owned", message: "Already owned" };
  }
  settleEnsureStarter(params.userId);
  const debit = settleDebit({
    userId: params.userId,
    amount: def.priceCredits,
    reason: "COLLECTIBLE_BUY",
    requestId: params.requestId,
    metadata: { collectibleKey: def.key },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  grantCollectible(params.userId, def.key);
  return { ok: true, key: def.key };
}
