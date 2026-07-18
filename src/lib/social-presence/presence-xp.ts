/**
 * Presence XP math — meaningful social/rest only; bonuses capped.
 */

import {
  DENSITY_BONUS_TIERS,
  MAX_COMBINED_BONUS_PERCENT,
  PRESENCE_XP_BASE,
} from "@/lib/social-presence/config";
import { restBonusPercent } from "@/lib/social-presence/rest-zones";
import type {
  PresenceActionKind,
  PresenceXpAward,
  RestZoneKind,
} from "@/lib/social-presence/types";

export function densityBonusPercent(nearbyEstimate: number | null | undefined): number {
  if (nearbyEstimate == null || nearbyEstimate < 2) return 0;
  let bonus = 0;
  for (const tier of DENSITY_BONUS_TIERS) {
    if (nearbyEstimate >= tier.minNearby) bonus = tier.bonusPercent;
  }
  return bonus;
}

export function computePresenceXpAward(params: {
  kind: PresenceActionKind;
  restZoneKind?: RestZoneKind | null;
  nearbyEstimate?: number | null;
  multiAccountMultiplier?: number;
}): PresenceXpAward {
  const base = PRESENCE_XP_BASE[params.kind] ?? 0;
  const restPct = restBonusPercent(params.restZoneKind);
  const densPct = densityBonusPercent(params.nearbyEstimate);
  let combinedPct = restPct + densPct;
  let capped = false;
  if (combinedPct > MAX_COMBINED_BONUS_PERCENT) {
    combinedPct = MAX_COMBINED_BONUS_PERCENT;
    capped = true;
  }

  const restBonus = Math.floor((base * restPct) / 100);
  const densityBonus = Math.floor((base * densPct) / 100);
  // Recalculate from capped combined so total never exceeds policy
  const combinedBonus = Math.floor((base * combinedPct) / 100);
  let total = base + combinedBonus;
  const mult = params.multiAccountMultiplier ?? 1;
  if (mult < 1) {
    total = Math.max(1, Math.floor(total * mult));
    capped = true;
  }

  return {
    base,
    densityBonus: Math.min(densityBonus, combinedBonus),
    restBonus: Math.min(restBonus, combinedBonus),
    total,
    capped,
  };
}
