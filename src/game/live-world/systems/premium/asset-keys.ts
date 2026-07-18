/**
 * Texture keys for premium Live World art under public/assets/game/
 */

export const TERRAIN_KEYS = [
  "grass-lush",
  "grass-flowers-blue",
  "grass-fern",
  "grass-flowers-white",
  "grass-master",
  "grass-dense",
  "grass-dry",
  "plaza-stone",
  "plaza-medallion",
  "plaza-street",
  "plaza-diamond",
  "plaza-moss",
  "path-curve",
  "path-rocky",
  "path-vertical",
  "path-roots",
  "path-bloom",
  "path-to-stone",
  "path-corner",
  "path-ruined",
  "path-worn",
  "path-master",
  "water-master",
  "water-stream",
  "cliff-edge",
  "settlement-soil",
  "farm-soil",
  "training-dirt",
] as const;

export const PROP_KEYS = [
  "barrel",
  "crate",
  "rift-crystal",
  "riftstone-monument",
  "lantern-post",
  "bush-berry",
  "tree-small",
  "rock-moss",
  "flowers",
  "market-stall",
  "anvil-forge",
  "bench",
  "signpost",
  "training-dummy",
  "campfire",
  "bridge",
  "ruin-arch",
  "banner-pole",
  "watchtower",
  "resource-berry",
  "resource-herb",
  "resource-fish",
] as const;

export const ACTOR_KEYS = ["player-keeper", "pet-riftling"] as const;

export function actorTex(key: (typeof ACTOR_KEYS)[number] | string): string {
  return `pw-actor-${key}`;
}

export const BUILDING_KEYS = [
  "hatchery",
  "arena",
  "market",
  "guild",
  "workshop",
  "library",
  "academy",
  "recovery-center",
  "homestead-path",
  "portal-circle",
] as const;

export type TerrainKey = (typeof TERRAIN_KEYS)[number];
export type PropKey = (typeof PROP_KEYS)[number];
export type BuildingKey = (typeof BUILDING_KEYS)[number];

export function terrainTex(key: string): string {
  return `pw-terrain-${key}`;
}

export function propTex(key: string): string {
  return `pw-prop-${key}`;
}

export function buildingTex(key: string): string {
  return `pw-building-${key}`;
}

/** Map blueprint building id suffix → texture key. */
export function buildingKeyFromObjectId(id: string): BuildingKey | null {
  const slug = id.replace(/^building-/, "").replace(/^riftwild-commons-/, "");
  const aliases: Record<string, BuildingKey> = {
    hatchery: "hatchery",
    arena: "arena",
    market: "market",
    guild: "guild",
    workshop: "workshop",
    "crafting-workshop": "workshop",
    library: "library",
    academy: "academy",
    "player-academy": "academy",
    "recovery-center": "recovery-center",
    "homestead-path": "homestead-path",
    forge: "workshop",
  };
  return aliases[slug] ?? (BUILDING_KEYS.includes(slug as BuildingKey) ? (slug as BuildingKey) : null);
}
