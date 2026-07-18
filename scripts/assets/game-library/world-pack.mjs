/**
 * Curated Live World install pack — visible in Commons / BootScene.
 * Catalog keeps 1000+; this subset is what players see in-game.
 */

/** @param {import('./defs.mjs').CatalogEntry[]} entries */
export function selectWorldPack(entries) {
  const byId = new Map(entries.map((e) => [e.id, e]));
  /** @type {string[]} */
  const ids = [];

  const take = (id) => {
    if (byId.has(id) && !ids.includes(id)) ids.push(id);
  };

  const takeWhere = (pred, limit) => {
    let n = 0;
    for (const e of entries) {
      if (n >= limit) break;
      if (pred(e)) {
        take(e.id);
        n++;
      }
    }
  };

  // Hero trees — summer mature (readable canopy)
  takeWhere((e) => e.family === "tree" && e.variant?.season === "summer" && e.variant?.size === "mature", 18);
  // Extra seasonal accents
  takeWhere((e) => e.family === "tree" && e.variant?.season === "autumn" && e.variant?.size === "mature", 6);
  takeWhere((e) => e.family === "tree" && e.variant?.size === "sapling" && e.variant?.season === "spring", 4);

  // Bushes / flowers / mushrooms / grass / rocks
  takeWhere((e) => e.family === "bush" && e.variant?.season === "summer" && e.variant?.size === "large", 14);
  takeWhere((e) => e.family === "flower" && e.variant?.size === "small", 16);
  takeWhere((e) => e.family === "mushroom" && e.variant?.size === "small", 12);
  takeWhere((e) => e.family === "grass" && e.biome === "commons", 8);
  takeWhere((e) => e.family === "rock" && e.variant?.palette === "moss", 10);

  // Props
  takeWhere((e) => e.family === "crate", 10);
  takeWhere((e) => e.family === "barrel", 10);
  takeWhere((e) => e.family === "lantern", 12);
  takeWhere((e) => e.family === "sign", 10);
  takeWhere((e) => e.family === "furniture", 10);
  takeWhere((e) => e.family === "goods", 10);
  takeWhere((e) => e.family === "tool", 6);

  // Structures
  takeWhere((e) => e.family === "stall", 10);
  takeWhere((e) => e.family === "fence", 10);
  takeWhere((e) => e.family === "gate", 4);
  takeWhere((e) => e.family === "bridge", 3);
  takeWhere((e) => e.family === "dock", 3);
  takeWhere((e) => e.family === "wall" && e.variant?.facing === "front", 5);
  takeWhere((e) => e.family === "door" && e.variant?.state === "closed", 4);

  // Creatures / people (static ambient props)
  takeWhere((e) => e.family === "animal", 14);
  takeWhere((e) => e.family === "riftling" && e.variant?.stage === "juvenile", 8);
  takeWhere((e) => e.family === "npc", 10);
  takeWhere((e) => e.family === "keeper", 4);

  // Always include original boot-critical ids
  for (const id of [
    "tree-oak-summer-mature",
    "bush-moss-summer-large",
    "flower-riftlily-cyan-small",
    "mushroom-cap-amber-small",
    "fence-wood-post",
    "crate-market-amber",
    "lantern-rift-glow",
  ]) {
    take(id);
  }

  return ids.map((id) => byId.get(id)).filter(Boolean);
}

/** Phaser / PROP_KEYS texture key for a catalog id. */
export function worldKeyForId(id) {
  return `lw-${id}`;
}

export function isLibraryWorldKey(key) {
  return typeof key === "string" && key.startsWith("lw-");
}

export function isLibraryTreeKey(key) {
  return isLibraryWorldKey(key) && key.startsWith("lw-tree-");
}
