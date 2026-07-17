/**
 * Rare world disasters — deterministic from world day + season.
 * Effects are declarative; Live World / region evolution consume them later.
 */

import type { LivingWorldClock, WorldSeason } from "@/game/living-world/clock";

export type DisasterKey =
  | "rift_surge"
  | "ashfall_week"
  | "tidal_breach"
  | "frost_lock"
  | "void_bloom"
  | "storm_siege";

export type DisasterDef = {
  key: DisasterKey;
  name: string;
  description: string;
  seasons: WorldSeason[];
  /** Chance roll threshold 0–1000 (deterministic). */
  rarityWeight: number;
  regionAffinity?: string[];
  worldEffects: string[];
};

export const DISASTER_CATALOG: DisasterDef[] = [
  {
    key: "rift_surge",
    name: "Rift Surge",
    description: "Auroras thicken; expedition difficulty spikes and discoveries bloom.",
    seasons: ["bloom", "frostveil"],
    rarityWeight: 40,
    worldEffects: ["expedition_harder", "discovery_boost", "wildlife_agitated"],
  },
  {
    key: "ashfall_week",
    name: "Ashfall Week",
    description: "Ember regions choke under ash; grove yields wilt, forge yields rise.",
    seasons: ["ember"],
    rarityWeight: 55,
    regionAffinity: ["ember-crater", "alloy-ruins"],
    worldEffects: ["ember_yield_up", "grove_yield_down", "weather_lock_ash"],
  },
  {
    key: "tidal_breach",
    name: "Tidal Breach",
    description: "Coastlines flood ancient paths; tide resources surge.",
    seasons: ["bloom", "harvest"],
    rarityWeight: 45,
    regionAffinity: ["moonwater-coast", "spirit-marsh"],
    worldEffects: ["coast_paths_closed", "tide_gather_boost"],
  },
  {
    key: "frost_lock",
    name: "Frost Lock",
    description: "Basin trails freeze solid; travel slows, crystal nodes flourish.",
    seasons: ["frostveil"],
    rarityWeight: 50,
    regionAffinity: ["frostveil-basin", "stormspire-peaks"],
    worldEffects: ["travel_slow", "frost_nodes_boost"],
  },
  {
    key: "void_bloom",
    name: "Void Bloom",
    description: "Hollow flora opens overnight; void wildlife migrates into commons edges.",
    seasons: ["harvest", "frostveil"],
    rarityWeight: 30,
    regionAffinity: ["void-hollow", "riftwild-commons"],
    worldEffects: ["void_wildlife", "strange_discoveries"],
  },
  {
    key: "storm_siege",
    name: "Storm Siege",
    description: "Peak lightning pins aerial routes; storm materials rain into canyons.",
    seasons: ["ember", "harvest"],
    rarityWeight: 35,
    regionAffinity: ["stormspire-peaks", "stoneheart-canyon"],
    worldEffects: ["flight_routes_closed", "storm_material_rain"],
  },
];

export type ActiveDisaster = {
  disaster: DisasterDef;
  worldDay: number;
  intensity: number;
} | null;

function roll(worldDay: number, salt: number): number {
  let x = (worldDay * 2654435761 + salt) >>> 0;
  x ^= x >>> 16;
  return x % 1000;
}

export function resolveActiveDisaster(clock: LivingWorldClock): ActiveDisaster {
  // Disasters check once per world day; quiet most days.
  if (roll(clock.worldDay, 7) > 120) return null;

  const candidates = DISASTER_CATALOG.filter((d) => d.seasons.includes(clock.season));
  if (candidates.length === 0) return null;

  const pick = candidates[roll(clock.worldDay, 99) % candidates.length];
  if (!pick) return null;
  if (roll(clock.worldDay, 13) > pick.rarityWeight) return null;

  return {
    disaster: pick,
    worldDay: clock.worldDay,
    intensity: 0.35 + (roll(clock.worldDay, 21) % 65) / 100,
  };
}
