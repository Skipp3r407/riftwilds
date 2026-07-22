/**
 * Admin controls for Rift Stakes fee %, pauses, promos.
 * Hard max fee 5% enforced here.
 */

import { clampFeeBps, MAX_FEE_BPS } from "@/game/rift-stakes/config";
import {
  getRiftStakesStore,
  saveRiftStakesStore,
} from "@/game/rift-stakes/store";
import type { PromoFeeEvent } from "@/game/rift-stakes/types";

export function getAdminState() {
  return getRiftStakesStore().admin;
}

export function setAdminFeeBps(bps: number): { ok: true; feeBps: number } | { ok: false; error: string } {
  if (!Number.isFinite(bps)) return { ok: false, error: "INVALID_BPS" };
  if (bps > MAX_FEE_BPS) {
    return { ok: false, error: `FEE_HARD_MAX_${MAX_FEE_BPS}` };
  }
  const feeBps = clampFeeBps(bps);
  saveRiftStakesStore((s) => {
    s.admin.feeBps = feeBps;
    s.admin.updatedAt = new Date().toISOString();
  });
  return { ok: true, feeBps };
}

export function setPauseFlags(input: {
  stakesPaused?: boolean;
  treasuryPaused?: boolean;
  matchmakingPaused?: boolean;
  pauseReason?: string | null;
}) {
  saveRiftStakesStore((s) => {
    if (typeof input.stakesPaused === "boolean") {
      s.admin.stakesPaused = input.stakesPaused;
    }
    if (typeof input.treasuryPaused === "boolean") {
      s.admin.treasuryPaused = input.treasuryPaused;
    }
    if (typeof input.matchmakingPaused === "boolean") {
      s.admin.matchmakingPaused = input.matchmakingPaused;
    }
    if (input.pauseReason !== undefined) {
      s.admin.pauseReason = input.pauseReason;
    }
    s.admin.updatedAt = new Date().toISOString();
  });
  return getAdminState();
}

export function upsertPromotion(promo: PromoFeeEvent) {
  const feeBps = clampFeeBps(promo.feeBps);
  saveRiftStakesStore((s) => {
    const next = { ...promo, feeBps };
    const i = s.promotions.findIndex((p) => p.id === promo.id);
    if (i >= 0) s.promotions[i] = next;
    else s.promotions.push(next);
  });
}

export function listAdminLogs() {
  const s = getRiftStakesStore();
  return {
    admin: s.admin,
    promotions: s.promotions,
    vipTiers: s.vipTiers,
    recentFees: s.feeHistory.slice(0, 50),
    recentTreasury: s.treasuryTx.slice(0, 50),
    recentMatches: s.matches.slice(0, 30),
    queueSize: s.queue.length,
    maxFeeBps: MAX_FEE_BPS,
  };
}
