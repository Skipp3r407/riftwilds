/**
 * Professions scaffolding with interdependence.
 * Gather → Craft → Market/Repair loops; no profession farms unlimited Credits.
 */

export type ProfessionId =
  | "forager"
  | "miner"
  | "angler"
  | "artisan"
  | "tinker"
  | "caretaker"
  | "courier"
  | "restorer";

export type ProfessionDef = {
  id: ProfessionId;
  name: string;
  description: string;
  /** Materials this profession produces. */
  outputs: string[];
  /** Materials / services required from other professions. */
  inputsFrom: ProfessionId[];
  creditFaucetReason: "GATHER" | "CRAFT" | "JOB_BOARD" | "RESTORATION_PARTICIPATION";
  creditSinkReason: "CRAFT_FEE" | "REPAIR" | "TRAVEL_FEE" | "RESTORATION_DONATION" | "NPC_SHOP_BUY";
  maxLevel: number;
  dailyCreditCap: number;
};

export const PROFESSION_CATALOG: ProfessionDef[] = [
  {
    id: "forager",
    name: "Forager",
    description: "Harvests moss, herbs, and soft flora for caretakers and artisans.",
    outputs: ["grove-moss", "elder-herb", "lantern-petal"],
    inputsFrom: ["courier"],
    creditFaucetReason: "GATHER",
    creditSinkReason: "CRAFT_FEE",
    maxLevel: 50,
    dailyCreditCap: 120,
  },
  {
    id: "miner",
    name: "Miner",
    description: "Pulls ore and fossils for tinkers and artisans.",
    outputs: ["ember-ore", "fossil-shard", "alloy-scrap"],
    inputsFrom: ["tinker"],
    creditFaucetReason: "GATHER",
    creditSinkReason: "REPAIR",
    maxLevel: 50,
    dailyCreditCap: 120,
  },
  {
    id: "angler",
    name: "Angler",
    description: "Coastal and marsh catches for caretakers and market stalls.",
    outputs: ["tide-fish", "marsh-eel"],
    inputsFrom: ["courier"],
    creditFaucetReason: "GATHER",
    creditSinkReason: "NPC_SHOP_BUY",
    maxLevel: 50,
    dailyCreditCap: 100,
  },
  {
    id: "artisan",
    name: "Artisan",
    description: "Crafts rations, salves, and goods from forager/miner inputs.",
    outputs: ["travel-ration", "grove-salve", "repair-kit-basic"],
    inputsFrom: ["forager", "miner", "angler"],
    creditFaucetReason: "CRAFT",
    creditSinkReason: "CRAFT_FEE",
    maxLevel: 50,
    dailyCreditCap: 200,
  },
  {
    id: "tinker",
    name: "Tinker",
    description: "Builds tools and markers; depends on miner scrap.",
    outputs: ["starter-pick", "map-marker", "cog-core"],
    inputsFrom: ["miner", "artisan"],
    creditFaucetReason: "CRAFT",
    creditSinkReason: "REPAIR",
    maxLevel: 50,
    dailyCreditCap: 180,
  },
  {
    id: "caretaker",
    name: "Caretaker",
    description: "Riftling care specialty — shop sinks absorb care bonuses.",
    outputs: ["care-session", "bond-token"],
    inputsFrom: ["forager", "angler", "artisan"],
    creditFaucetReason: "JOB_BOARD",
    creditSinkReason: "NPC_SHOP_BUY",
    maxLevel: 50,
    dailyCreditCap: 90,
  },
  {
    id: "courier",
    name: "Courier",
    description: "Moves goods between regions; travel fees are the primary sink.",
    outputs: ["delivery-token"],
    inputsFrom: ["artisan", "tinker"],
    creditFaucetReason: "JOB_BOARD",
    creditSinkReason: "TRAVEL_FEE",
    maxLevel: 50,
    dailyCreditCap: 150,
  },
  {
    id: "restorer",
    name: "Restorer",
    description: "Channels Credits into world restoration burns.",
    outputs: ["restoration-seal"],
    inputsFrom: ["courier", "artisan", "tinker"],
    creditFaucetReason: "RESTORATION_PARTICIPATION",
    creditSinkReason: "RESTORATION_DONATION",
    maxLevel: 50,
    dailyCreditCap: 90,
  },
];

export const PROFESSION_BY_ID = Object.fromEntries(
  PROFESSION_CATALOG.map((p) => [p.id, p]),
) as Record<ProfessionId, ProfessionDef>;
