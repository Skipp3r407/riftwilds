/**
 * Founder incentives — cosmetics / titles / furniture only.
 * NO SOL, combat power, rare Riftlings, or land speculation.
 */

import {
  FOUNDER_COSMETIC_KEYS,
  FOUNDER_FURNITURE_KEYS,
  FOUNDER_TITLE_PREFIX,
} from "@/lib/world-expansion/config";
import { getExpansionStore } from "@/lib/world-expansion/store";
import type { FounderReward, WorldMapRecord } from "@/lib/world-expansion/types";

export function claimFounderRewards(params: {
  userId: string;
  mapId: string;
}):
  | { ok: true; reward: FounderReward }
  | { ok: false; error: string; message: string } {
  const s = getExpansionStore();
  const map = s.maps.get(params.mapId);
  if (!map) return { ok: false, error: "missing_map", message: "Map not found." };
  if (map.mapKind === "overflow") {
    return {
      ok: false,
      error: "overflow",
      message: "Overflow maps have no founder land rewards.",
    };
  }
  if (!map.allowsPermanentHousing) {
    return { ok: false, error: "no_housing", message: "Map does not support founders." };
  }
  if (map.lifecycle !== "OPEN") {
    return { ok: false, error: "not_open", message: "Map not open for founding." };
  }

  const key = `${params.userId}:${params.mapId}`;
  const existing = s.founders.get(key);
  if (existing) return { ok: true, reward: existing };

  const titleKey = `${FOUNDER_TITLE_PREFIX}${map.mapId}`;
  if (!map.founderTitleKey) {
    map.founderTitleKey = titleKey;
    map.updatedAt = new Date().toISOString();
    s.maps.set(map.mapId, map);
  }

  const reward: FounderReward = {
    userId: params.userId,
    mapId: params.mapId,
    titleKey,
    cosmeticKeys: [...FOUNDER_COSMETIC_KEYS],
    furnitureKeys: [...FOUNDER_FURNITURE_KEYS],
    grantsSol: false,
    grantsCombatPower: false,
    grantsRareRiftlings: false,
    grantsLandSpeculation: false,
    claimedAt: new Date().toISOString(),
  };
  s.founders.set(key, reward);
  return { ok: true, reward };
}

export function assertFounderEconomySafe(reward: FounderReward): boolean {
  return (
    reward.grantsSol === false &&
    reward.grantsCombatPower === false &&
    reward.grantsRareRiftlings === false &&
    reward.grantsLandSpeculation === false
  );
}

export function listFounders(mapId: string): FounderReward[] {
  return [...getExpansionStore().founders.values()].filter((f) => f.mapId === mapId);
}

export function founderBlurb(map: WorldMapRecord): string {
  return `Early settlers of ${map.publicName} earn cosmetic titles and hearth furniture — never SOL or power.`;
}
