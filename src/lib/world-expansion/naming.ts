import type { BiomeKey, TemplateKey } from "@/lib/world-expansion/types";

const PREFIX: Record<BiomeKey, string[]> = {
  forest: ["Elder", "Moss", "Lantern", "Fern", "Hollow"],
  coastal: ["Salt", "Tide", "Pearl", "Drift", "Gull"],
  mountain: ["Stone", "Peak", "Ridge", "Frost", "Granite"],
  farmland: ["Green", "Wheat", "Orchard", "Croft", "Harvest"],
  merchant: ["Coin", "Bazaar", "Caravan", "Silk", "Ledger"],
  harbor: ["Harbor", "Skiff", "Anchor", "Net", "Pier"],
  meadow: ["Dawn", "Soft", "Welcome", "Meadow", "Firstlight"],
  guild: ["Banner", "Muster", "Oath", "Crest", "Hall"],
  island: ["Cove", "Isle", "Reef", "Bridge", "Lagoon"],
  rift_edge: ["Rift", "Veil", "Storm", "Echo", "Pulse"],
};

const SUFFIX = [
  "Rest",
  "Crossing",
  "Haven",
  "Reach",
  "Glen",
  "Ward",
  "Commons",
  "Landing",
  "Terrace",
  "Fold",
];

/** Deterministic lore-friendly name from seed + template. */
export function nameFromSeed(seed: string, templateKey: TemplateKey, biome: BiomeKey): string {
  const n = hash(seed + templateKey);
  const prefixes = PREFIX[biome];
  const p = prefixes[n % prefixes.length]!;
  const s = SUFFIX[(n >>> 8) % SUFFIX.length]!;
  const roman = ["", " II", " III", " IV"][(n >>> 16) % 4]!;
  return `${p}${s}${roman}`.replace(/([a-z])([A-Z])/g, "$1 $2").replace(/^./, (c) => c);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function districtName(kind: string, seed: string, index: number): string {
  const flavors: Record<string, string[]> = {
    residential: ["Lantern Row", "Hearth Lane", "Quiet Croft"],
    merchant: ["Market Bend", "Stall Walk", "Trade Bend"],
    crafting: ["Ember Lane", "Anvil Court", "Sparks Alley"],
    farming: ["Greenfold", "Scarecrow Reach", "Orchard Mile"],
    fishing: ["Reed Pier", "Net Slip", "Tide Walk"],
    magic: ["Rift Circle", "Veil Garden", "Cyan Ring"],
    guild: ["Banner Court", "Muster Yard", "Oath Steps"],
    military: ["Watch Rise", "Gate Yard", "Drill Green"],
    entertainment: ["Song Plaza", "Festival Lane", "Campfire Ring"],
    temple: ["Quiet Steeple", "Shrine Walk", "Reflection Grove"],
    luxury: ["Goldleaf Terrace", "Vista Court", "Estate Overlook"],
  };
  const list = flavors[kind] ?? ["District"];
  const n = hash(`${seed}:${kind}:${index}`);
  return list[n % list.length]!;
}
