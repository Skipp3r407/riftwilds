/**
 * Phase 9 — Premium Store (Credits SKUs; cosmetics / convenience only).
 */

import { settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { createSolPaymentIntent } from "@/lib/economy/sol-adapter";

export type PremiumSku = {
  key: string;
  name: string;
  priceCredits: number;
  kind: "COSMETIC" | "CONVENIENCE" | "HOUSING_THEME";
  payToWin: false;
};

export const PREMIUM_SKUS: PremiumSku[] = [
  { key: "premium-egg-tint", name: "Aurora Egg Tint", priceCredits: 150, kind: "COSMETIC", payToWin: false },
  { key: "premium-nameplate", name: "Keeper Nameplate", priceCredits: 80, kind: "COSMETIC", payToWin: false },
  { key: "premium-travel-pass", name: "1-Day Fast Travel Pass", priceCredits: 60, kind: "CONVENIENCE", payToWin: false },
  { key: "premium-homestead-theme", name: "Moonlit Homestead Theme", priceCredits: 220, kind: "HOUSING_THEME", payToWin: false },
];

type Store = { owned: Map<string, Set<string>> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsPremiumStore?: Store };
  if (!g.__riftwildsPremiumStore) g.__riftwildsPremiumStore = { owned: new Map() };
  return g.__riftwildsPremiumStore;
}

export function listPremiumSkus(): PremiumSku[] {
  return PREMIUM_SKUS;
}

export function listOwnedPremium(userId: string): string[] {
  return [...(store().owned.get(userId) ?? new Set())];
}

export function purchasePremiumSku(params: {
  userId: string;
  skuKey: string;
  requestId: string;
  method?: "CREDITS" | "WALLET_SOL";
}):
  | { ok: true; sku: PremiumSku; balance?: number; solIntentId?: string }
  | { ok: false; error: string; message: string } {
  const sku = PREMIUM_SKUS.find((s) => s.key === params.skuKey);
  if (!sku) return { ok: false, error: "unknown_sku", message: "Unknown premium SKU" };

  if (params.method === "WALLET_SOL") {
    const intent = createSolPaymentIntent({
      userId: params.userId,
      lamports: BigInt(sku.priceCredits) * 100_000n, // illustrative only
      purpose: `premium:${sku.key}`,
      requestId: params.requestId,
    });
    return {
      ok: false,
      error: "sol_blocked",
      message: intent.note,
    };
  }

  if (listOwnedPremium(params.userId).includes(sku.key) && sku.kind === "COSMETIC") {
    return { ok: false, error: "owned", message: "Already owned" };
  }

  settleEnsureStarter(params.userId);
  const debit = settleDebit({
    userId: params.userId,
    amount: sku.priceCredits,
    reason: "PREMIUM_STORE",
    requestId: params.requestId,
    metadata: { skuKey: sku.key, kind: sku.kind },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };

  let set = store().owned.get(params.userId);
  if (!set) {
    set = new Set();
    store().owned.set(params.userId, set);
  }
  set.add(sku.key);
  void isFeatureEnabled;
  return { ok: true, sku, balance: debit.balance };
}
