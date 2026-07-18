/**
 * Texture keys for premium Live World art under public/assets/game/
 */

import {
  LIBRARY_WORLD_KEYS,
  isLibraryTreeKey,
  isLibraryWorldKey,
} from "@/content/assets/library-world-keys";

export { LIBRARY_WORLD_KEYS, isLibraryWorldKey, isLibraryTreeKey };
export {
  isLibraryBushKey,
  isLibraryFlowerKey,
} from "@/content/assets/library-world-keys";

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

/** Canopy trees — all share occlusion / sway treatment in world-props. */
export const TREE_PROP_KEYS = [
  "tree-small",
  "tree-oak",
  "tree-pine",
  "tree-birch",
  "tree-flowering",
  "tree-rift",
  "tree-orchard",
] as const;

/** Legacy short aliases (still installed by assets:install:library). */
export const LIBRARY_PROP_KEYS = [
  "lib-tree-oak-summer",
  "lib-bush-moss",
  "lib-flower-riftlily",
  "lib-mushroom-amber",
  "lib-fence-post",
  "lib-crate-market",
  "lib-lantern-rift",
] as const;

export const PROP_KEYS = [
  "barrel",
  "crate",
  "rift-crystal",
  "riftstone-monument",
  "lantern-post",
  "bush-berry",
  ...TREE_PROP_KEYS,
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
  ...LIBRARY_PROP_KEYS,
  ...LIBRARY_WORLD_KEYS,
] as const;

export type TreePropKey = (typeof TREE_PROP_KEYS)[number];

export function isTreeProp(key: string): key is TreePropKey {
  return (
    (TREE_PROP_KEYS as readonly string[]).includes(key) ||
    key === "lib-tree-oak-summer" ||
    isLibraryTreeKey(key)
  );
}

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
    "market-annex": "market",
    guild: "guild",
    workshop: "workshop",
    "crafting-workshop": "workshop",
    library: "library",
    academy: "academy",
    "player-academy": "academy",
    "recovery-center": "recovery-center",
    "homestead-path": "homestead-path",
    "cottage-north": "homestead-path",
    "cottage-south": "homestead-path",
    "tavern-tankard": "homestead-path",
    forge: "workshop",
  };
  return aliases[slug] ?? (BUILDING_KEYS.includes(slug as BuildingKey) ? (slug as BuildingKey) : null);
}
