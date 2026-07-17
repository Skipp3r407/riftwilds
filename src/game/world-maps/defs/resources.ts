/** Resource node catalog referenced by map blueprints. */

export type ResourceDef = {
  id: string;
  name: string;
  regionIds: string[];
  gatherSeconds: number;
  rarity: "common" | "uncommon" | "rare" | "epic";
  toolHint?: string;
};

export const RESOURCE_DEFS: ResourceDef[] = [
  // Commons
  { id: "berry-bush", name: "Rift Berry Bush", regionIds: ["riftwild-commons", "elderwood-forest"], gatherSeconds: 4, rarity: "common" },
  { id: "pond-fish", name: "Commons Pond Fish", regionIds: ["riftwild-commons", "moonwater-coast"], gatherSeconds: 6, rarity: "common", toolHint: "fishing_rod" },
  { id: "starter-herb", name: "Plaza Herb", regionIds: ["riftwild-commons"], gatherSeconds: 3, rarity: "common" },
  // Ember
  { id: "ember-crystal", name: "Ember Crystal", regionIds: ["ember-crater"], gatherSeconds: 8, rarity: "uncommon", toolHint: "pickaxe" },
  { id: "charstone", name: "Charstone", regionIds: ["ember-crater"], gatherSeconds: 5, rarity: "common", toolHint: "pickaxe" },
  { id: "ashroot", name: "Ashroot", regionIds: ["ember-crater"], gatherSeconds: 4, rarity: "common" },
  { id: "flamecap", name: "Flamecap Mushroom", regionIds: ["ember-crater"], gatherSeconds: 5, rarity: "uncommon" },
  { id: "molten-metal", name: "Molten Metal", regionIds: ["ember-crater"], gatherSeconds: 10, rarity: "rare", toolHint: "tongs" },
  { id: "cinder-bloom", name: "Cinder Bloom", regionIds: ["ember-crater"], gatherSeconds: 6, rarity: "uncommon" },
  { id: "volcanic-glass", name: "Volcanic Glass", regionIds: ["ember-crater"], gatherSeconds: 7, rarity: "rare" },
  // Coast
  { id: "moon-pearl", name: "Moon Pearl", regionIds: ["moonwater-coast"], gatherSeconds: 9, rarity: "rare" },
  { id: "tide-shell", name: "Tide Shell", regionIds: ["moonwater-coast"], gatherSeconds: 3, rarity: "common" },
  { id: "seaweed-bundle", name: "Seaweed Bundle", regionIds: ["moonwater-coast"], gatherSeconds: 4, rarity: "common" },
  { id: "coral-shard", name: "Coral Shard", regionIds: ["moonwater-coast"], gatherSeconds: 6, rarity: "uncommon" },
  { id: "driftwood", name: "Driftwood", regionIds: ["moonwater-coast"], gatherSeconds: 3, rarity: "common" },
  // Elderwood
  { id: "grove-herb", name: "Grove Herb", regionIds: ["elderwood-forest"], gatherSeconds: 4, rarity: "common" },
  { id: "ancient-bark", name: "Ancient Bark", regionIds: ["elderwood-forest"], gatherSeconds: 7, rarity: "uncommon" },
  { id: "mossmeal", name: "Mossmeal", regionIds: ["elderwood-forest"], gatherSeconds: 3, rarity: "common" },
  { id: "glowcap", name: "Glowcap", regionIds: ["elderwood-forest"], gatherSeconds: 5, rarity: "uncommon" },
  // Stormspire
  { id: "lightning-crystal", name: "Lightning Crystal", regionIds: ["stormspire-peaks"], gatherSeconds: 8, rarity: "rare" },
  { id: "wind-silk", name: "Wind Silk", regionIds: ["stormspire-peaks"], gatherSeconds: 5, rarity: "uncommon" },
  // Stoneheart
  { id: "stoneheart-ore", name: "Stoneheart Ore", regionIds: ["stoneheart-canyon"], gatherSeconds: 7, rarity: "uncommon", toolHint: "pickaxe" },
  { id: "fossil-shard", name: "Fossil Shard", regionIds: ["stoneheart-canyon"], gatherSeconds: 8, rarity: "rare" },
  // Frostveil
  { id: "frost-crystal", name: "Frost Crystal", regionIds: ["frostveil-basin"], gatherSeconds: 7, rarity: "uncommon" },
  { id: "ice-bloom", name: "Ice Bloom", regionIds: ["frostveil-basin"], gatherSeconds: 5, rarity: "uncommon" },
  // Radiant
  { id: "radiant-crystal", name: "Radiant Crystal", regionIds: ["radiant-citadel"], gatherSeconds: 8, rarity: "rare" },
  { id: "sunpetal", name: "Sunpetal", regionIds: ["radiant-citadel"], gatherSeconds: 5, rarity: "uncommon" },
  // Void
  { id: "void-crystal", name: "Void Crystal", regionIds: ["void-hollow"], gatherSeconds: 10, rarity: "epic" },
  { id: "rift-dust", name: "Rift Dust", regionIds: ["void-hollow"], gatherSeconds: 6, rarity: "rare" },
  // Alloy
  { id: "alloy-fragment", name: "Alloy Fragment", regionIds: ["alloy-ruins"], gatherSeconds: 6, rarity: "uncommon" },
  { id: "circuit-crystal", name: "Circuit Crystal", regionIds: ["alloy-ruins"], gatherSeconds: 8, rarity: "rare" },
  // Spirit
  { id: "spirit-bloom", name: "Spirit Bloom", regionIds: ["spirit-marsh"], gatherSeconds: 6, rarity: "uncommon" },
  { id: "memory-shard", name: "Memory Shard", regionIds: ["spirit-marsh"], gatherSeconds: 9, rarity: "rare" },
  // Celestial
  { id: "celestial-shard", name: "Celestial Shard", regionIds: ["celestial-rift"], gatherSeconds: 12, rarity: "epic" },
  { id: "star-dust", name: "Star Dust", regionIds: ["celestial-rift"], gatherSeconds: 8, rarity: "rare" },
];

export const RESOURCE_BY_ID = Object.fromEntries(
  RESOURCE_DEFS.map((r) => [r.id, r]),
) as Record<string, ResourceDef>;
