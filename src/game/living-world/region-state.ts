/**
 * Composes clock + disasters + NPC schedules + resource modifiers into a region snapshot.
 */

import { REGION_IDENTITIES } from "@/game/world-maps/regions";
import {
  resolveLivingWorldClock,
  type LivingWorldClock,
} from "@/game/living-world/clock";
import {
  resolveActiveDisaster,
  type ActiveDisaster,
} from "@/game/living-world/disasters";
import { npcsPresentAt, type NpcScheduleSlot } from "@/game/living-world/npc-schedules";

export type ResourceModifier = {
  resourceKey: string;
  multiplier: number;
  reason: string;
};

export type RegionLivingState = {
  regionSlug: string;
  regionName: string;
  clock: LivingWorldClock;
  weather: string;
  disaster: ActiveDisaster;
  npcsPresent: NpcScheduleSlot[];
  resourceModifiers: ResourceModifier[];
  discoveryChanceBoost: number;
  wildlifeAgitation: number;
};

function modifiersFromDisaster(
  disaster: ActiveDisaster,
  regionSlug: string,
): { resources: ResourceModifier[]; discovery: number; wildlife: number } {
  if (!disaster) return { resources: [], discovery: 0, wildlife: 0 };
  const d = disaster.disaster;
  if (d.regionAffinity && !d.regionAffinity.includes(regionSlug)) {
    return { resources: [], discovery: 0.05, wildlife: 0.1 };
  }
  const resources: ResourceModifier[] = [];
  let discovery = 0;
  let wildlife = 0;
  for (const effect of d.worldEffects) {
    if (effect === "discovery_boost" || effect === "strange_discoveries") discovery += 0.25;
    if (effect === "wildlife_agitated" || effect === "void_wildlife") wildlife += 0.35;
    if (effect === "ember_yield_up") {
      resources.push({
        resourceKey: "ember_shard",
        multiplier: 1.35,
        reason: d.name,
      });
    }
    if (effect === "grove_yield_down") {
      resources.push({
        resourceKey: "grove_herb",
        multiplier: 0.65,
        reason: d.name,
      });
    }
    if (effect === "tide_gather_boost") {
      resources.push({
        resourceKey: "tide_pearl",
        multiplier: 1.4,
        reason: d.name,
      });
    }
    if (effect === "frost_nodes_boost") {
      resources.push({
        resourceKey: "frost_crystal",
        multiplier: 1.3,
        reason: d.name,
      });
    }
    if (effect === "storm_material_rain") {
      resources.push({
        resourceKey: "storm_filament",
        multiplier: 1.45,
        reason: d.name,
      });
    }
  }
  return { resources, discovery, wildlife };
}

export function getRegionLivingState(
  regionSlug: string,
  atMs: number = Date.now(),
): RegionLivingState {
  const identity = REGION_IDENTITIES.find((r) => r.slug === regionSlug);
  const weatherKeys = identity?.weatherKeys ?? ["clear"];
  const clock = resolveLivingWorldClock(atMs, { regionWeatherKeys: weatherKeys });
  const disaster = resolveActiveDisaster(clock);
  const { resources, discovery, wildlife } = modifiersFromDisaster(disaster, regionSlug);

  return {
    regionSlug,
    regionName: identity?.name ?? regionSlug,
    clock,
    weather: clock.labels.weather,
    disaster,
    npcsPresent: npcsPresentAt(regionSlug, clock.dayPhase),
    resourceModifiers: resources,
    discoveryChanceBoost: discovery,
    wildlifeAgitation: wildlife,
  };
}

export function getGlobalLivingWorldSnapshot(atMs: number = Date.now()) {
  const clock = resolveLivingWorldClock(atMs);
  const disaster = resolveActiveDisaster(clock);
  return {
    clock,
    disaster,
    regions: REGION_IDENTITIES.map((r) => getRegionLivingState(r.slug, atMs)),
  };
}
