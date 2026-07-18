/**
 * Living Towns district catalog for Riftwild Commons.
 * Blueprint zones + prop scatter + HUD labels share these ids.
 */

export type CommonsDistrictId =
  | "central-plaza"
  | "market"
  | "residential"
  | "crafting"
  | "noble"
  | "dock"
  | "temple"
  | "military"
  | "farmland"
  | "guild"
  | "entertainment"
  | "hatchery"
  | "academy"
  | "recovery"
  | "forest-gate"
  | "outer-woods"
  | "secret-garden";

export type CommonsDistrictDef = {
  id: CommonsDistrictId;
  name: string;
  purpose: string;
  /** Terrain / prop mood for scatter + lighting hooks. */
  mood:
    | "plaza"
    | "market"
    | "home"
    | "forge"
    | "terrace"
    | "water"
    | "sacred"
    | "drill"
    | "crops"
    | "banner"
    | "festival"
    | "nest"
    | "study"
    | "heal"
    | "wild"
    | "hidden";
  /** Expected NPC density band (soft target for ambient cast). */
  npcDensity: "low" | "medium" | "high" | "hub";
};

/** Showcase order — urban design manifesto districts first. */
export const COMMONS_DISTRICTS: CommonsDistrictDef[] = [
  {
    id: "central-plaza",
    name: "Central Rift Plaza",
    purpose: "Civic hub — fountain, riftstone, stage, notice board, waystone",
    mood: "plaza",
    npcDensity: "hub",
  },
  {
    id: "market",
    name: "Market District",
    purpose: "Rift Exchange, stall rows, packing alleys, trade square",
    mood: "market",
    npcDensity: "high",
  },
  {
    id: "residential",
    name: "Keeper Row",
    purpose: "Homes, gardens, laundry lines, neighborhood well",
    mood: "home",
    npcDensity: "medium",
  },
  {
    id: "crafting",
    name: "Ember Craft Quarter",
    purpose: "Forge, anvils, charcoal yards, workshop smoke",
    mood: "forge",
    npcDensity: "medium",
  },
  {
    id: "entertainment",
    name: "Festival Lane",
    purpose: "Tavern patio, musicians, festival props, evening lanterns",
    mood: "festival",
    npcDensity: "high",
  },
  {
    id: "noble",
    name: "Archive Terrace",
    purpose: "Library, academy approach, terraced stairs, quiet gardens",
    mood: "terrace",
    npcDensity: "medium",
  },
  {
    id: "academy",
    name: "Player Academy",
    purpose: "Tutorials, FAQ, keeper schooling (interactive)",
    mood: "study",
    npcDensity: "low",
  },
  {
    id: "temple",
    name: "Portal Sanctum",
    purpose: "Portal ring, gateway stone, shrine, pilgrimage road",
    mood: "sacred",
    npcDensity: "medium",
  },
  {
    id: "military",
    name: "Southwatch Yard",
    purpose: "Arena gate, training posts, watchtowers, patrol routes",
    mood: "drill",
    npcDensity: "medium",
  },
  {
    id: "dock",
    name: "Stonebay Dock",
    purpose: "Pier, fishing, boats, water stairs, net racks",
    mood: "water",
    npcDensity: "medium",
  },
  {
    id: "farmland",
    name: "Commons Crofts",
    purpose: "Public plots, irrigation ditch, hedgerows",
    mood: "crops",
    npcDensity: "low",
  },
  {
    id: "guild",
    name: "Guild Quarter",
    purpose: "Guild hall, banners, muster court",
    mood: "banner",
    npcDensity: "medium",
  },
  {
    id: "recovery",
    name: "Recovery Gardens",
    purpose: "Healing center, quiet benches, herb beds",
    mood: "heal",
    npcDensity: "low",
  },
  {
    id: "hatchery",
    name: "Hatchery Nest",
    purpose: "Egg care, nursery paths, soft lighting",
    mood: "nest",
    npcDensity: "medium",
  },
  {
    id: "forest-gate",
    name: "East Forest Gate",
    purpose: "City gate to Elderwood trails",
    mood: "wild",
    npcDensity: "low",
  },
  {
    id: "outer-woods",
    name: "Outer Woods",
    purpose: "Optional beginner danger fringe outside walls",
    mood: "wild",
    npcDensity: "low",
  },
  {
    id: "secret-garden",
    name: "Secret Garden",
    purpose: "Hidden pocket park behind the grove",
    mood: "hidden",
    npcDensity: "low",
  },
];

export const COMMONS_DISTRICT_BY_ID = Object.fromEntries(
  COMMONS_DISTRICTS.map((d) => [d.id, d]),
) as Record<CommonsDistrictId, CommonsDistrictDef>;
