/**
 * Resolve effective fee rate: promo 0% > VIP > admin default.
 * Only used by Rift Stakes paths.
 */

import { clampFeeBps, DEFAULT_FEE_BPS } from "@/game/rift-stakes/config";
import { calculateFee } from "@/game/rift-stakes/fees";
import { getRiftStakesStore } from "@/game/rift-stakes/store";
import type { FeeBreakdown } from "@/game/rift-stakes/types";

export function resolveEffectiveFee(input: {
  stakePerPlayerLamports: number;
  vipTierId?: string | null;
  settledMatchCount?: number;
}): FeeBreakdown {
  const store = getRiftStakesStore();
  const now = Date.now();

  const activePromo = store.promotions.find((p) => {
    if (!p.active) return false;
    const start = Date.parse(p.startsAt);
    const end = Date.parse(p.endsAt);
    if (!Number.isFinite(start) || !Number.isFinite(end)) return p.active;
    return now >= start && now <= end;
  });

  if (activePromo) {
    return calculateFee({
      stakePerPlayerLamports: input.stakePerPlayerLamports,
      feeBps: clampFeeBps(activePromo.feeBps),
      feeSource: "promo",
      promoId: activePromo.id,
    });
  }

  if (input.vipTierId) {
    const vip = store.vipTiers.find((v) => v.id === input.vipTierId);
    if (vip) {
      const matches = input.settledMatchCount ?? 0;
      if (matches >= vip.minMatches) {
        return calculateFee({
          stakePerPlayerLamports: input.stakePerPlayerLamports,
          feeBps: clampFeeBps(vip.feeBps),
          feeSource: "vip",
          vipTierId: vip.id,
        });
      }
    }
  }

  // Best qualifying VIP by match count if no explicit tier
  const matches = input.settledMatchCount ?? 0;
  const qualified = store.vipTiers
    .filter((v) => matches >= v.minMatches)
    .sort((a, b) => a.feeBps - b.feeBps)[0];
  if (qualified) {
    return calculateFee({
      stakePerPlayerLamports: input.stakePerPlayerLamports,
      feeBps: clampFeeBps(qualified.feeBps),
      feeSource: "vip",
      vipTierId: qualified.id,
    });
  }

  const adminBps = store.admin.feeBps ?? DEFAULT_FEE_BPS;
  return calculateFee({
    stakePerPlayerLamports: input.stakePerPlayerLamports,
    feeBps: clampFeeBps(adminBps),
    feeSource: "admin",
  });
}
