/**
 * Canonical Riftwilds card category ecosystem.
 * Content JSON uses these types; engine maps them to UNIT / SPELL / AURA.
 */

export const TCG_CARD_CATEGORIES = [
  "companion",
  "spell",
  "item",
  "equipment",
  "terrain",
  "relic",
  "trap",
  "commander",
  "evolution",
] as const;

export type TcgCardCategory = (typeof TCG_CARD_CATEGORIES)[number];

/** Template / frame layouts — one distinct chrome per category (+ legacy other). */
export const TCG_TEMPLATE_LAYOUTS = [
  "companion",
  "spell",
  "item",
  "equipment",
  "terrain",
  "relic",
  "trap",
  "commander",
  "evolution",
  "other",
] as const;

export type TcgTemplateLayout = (typeof TCG_TEMPLATE_LAYOUTS)[number];

export const CATEGORY_LABELS: Record<TcgCardCategory, string> = {
  companion: "Companion",
  spell: "Spell",
  item: "Item",
  equipment: "Equipment",
  terrain: "Terrain",
  relic: "Relic",
  trap: "Trap",
  commander: "Commander",
  evolution: "Evolution",
};

export const CATEGORY_PURPOSE: Record<TcgCardCategory, string> = {
  companion:
    "Core battle units — ATK/DEF/HP/Speed, cost, keywords, role, element, family, evolution.",
  spell: "One-time magic — cost, speed, target, effect; discarded after resolve.",
  item: "Consumables — leather/wood/potion frames; consume on use; battle + world hooks.",
  equipment: "Attach to companions; persist until destroy, unequip, or death.",
  terrain: "One per player — environmental board effects; replacing swaps the prior.",
  relic: "Permanent board artifacts — persist for the match (not attach mods).",
  trap: "Face-down set; auto-trigger when conditions met.",
  commander: "One per deck, not shuffled into the main deck.",
  evolution: "Upgrade companions with art, stats, and abilities along a family line.",
};

/**
 * Soft deck guidance (29 main + 1 commander = 30).
 * Hard caps remain battle rules v2 — see DECK_COMPOSITION_RESOLUTION.
 */
export const DECK_COMPOSITION_GUIDANCE = {
  companions: 18,
  spells: 4,
  items: 3,
  equipment: 2,
  terrain: 1,
  relic: 1,
  commander: 1,
  flex: 1,
  /** Main deck pieces (excludes commander). */
  mainDeck: 29,
  totalPieces: 30,
} as const;

/**
 * Where soft guidance conflicts with battle rules v2 hard caps:
 * - Hard: minCreatures 14, maxSpells 10, maxSupportCombined 6, main 29 + commander 1.
 * - Items count toward maxSpells (one-shot consume path).
 * - Equipment + terrain + relic + trap count toward maxSupportCombined.
 * - Evolution cards count as companions (UNIT / creature bucket).
 * - Guidance totals (18+4+3+2+1+1+flex) fit inside those caps; prefer guidance when building.
 */
export const DECK_COMPOSITION_RESOLUTION = {
  itemsCountAs: "spells" as const,
  evolutionCountsAs: "companions" as const,
  supportTypes: ["equipment", "terrain", "relic", "trap"] as const,
  hardCapsSource: "battle-rules-v2",
  note:
    "Soft guidance is preferred for starters; legality uses battle rules v2. Items share the spell cap; support shares equipment/terrain/relic/trap.",
};

/** Legacy content types still accepted; remapped at normalize / migration. */
export const LEGACY_TYPE_TO_CATEGORY: Record<string, TcgCardCategory> = {
  creature: "companion",
  companion: "companion",
  token: "companion",
  legendary: "evolution",
  evolution: "evolution",
  spell: "spell",
  item: "item",
  equipment: "equipment",
  location: "terrain",
  weather: "terrain",
  terrain: "terrain",
  relic: "relic",
  artifact: "relic",
  trap: "trap",
  hero: "commander",
  commander: "commander",
  event: "spell",
  quest: "spell",
};

/** Combat-named `rotr-s-item-*` ids that stay Spell (not consumable Item). */
export const S_ITEM_COMBAT_SPELL_SUFFIXES = [
  "ember-bolt",
  "tide-spiral",
  "thorn-burst",
  "lightning-arc",
  "stone-crash",
  "frost-shard",
  "radiant-beam",
  "void-pulse",
  "alloy-wave",
  "spirit-flame",
  "ember-shield",
  "tide-barrier",
  "bark-wall",
  "storm-veil",
  "stone-guard",
  "frost-shell",
  "radiant-ward",
  "void-cloak",
  "alloy-barrier",
  "spirit-protection",
  "grove-mend",
  "moonwater-healing",
  "root-bind",
  "frost-slow",
  "battle-focus",
  "speed-wind",
  "volcanic-heartburst",
  "moon-tide-collapse",
  "worldroot-awakening",
  "sky-rift-tempest",
  "ancient-mountain-guard",
  "eternal-winter-ring",
  "dawnstar-ascension",
  "eclipse-singularity",
  "titan-core-overdrive",
  "ancestral-lantern-parade",
] as const;

const COMBAT_S_ITEM = new Set(
  S_ITEM_COMBAT_SPELL_SUFFIXES.map((s) => `rotr-s-item-${s}`),
);

export function isCombatNamedItemSpell(cardId: string): boolean {
  return COMBAT_S_ITEM.has(cardId);
}

/**
 * Resolve canonical category from raw type + id heuristics.
 * Consumable `rotr-s-item-*` (non-combat) → item even if still typed spell.
 */
export function resolveCardCategory(
  type: string,
  cardId?: string,
): TcgCardCategory {
  if (
    cardId?.startsWith("rotr-s-item-") &&
    !isCombatNamedItemSpell(cardId) &&
    (type === "spell" || type === "item")
  ) {
    return "item";
  }
  if (cardId?.startsWith("rotr-evo-") && (type === "legendary" || type === "evolution")) {
    return "evolution";
  }
  return LEGACY_TYPE_TO_CATEGORY[type] ?? "spell";
}

export function categoryToTemplateLayout(
  category: TcgCardCategory,
): TcgTemplateLayout {
  return category;
}

export function isCompanionCategory(category: string): boolean {
  return category === "companion" || category === "evolution";
}

export function isUnitCategory(category: string): boolean {
  return (
    category === "companion" ||
    category === "evolution" ||
    category === "commander"
  );
}

export function isItemCategory(category: string): boolean {
  return category === "item";
}

export function isSpellCategory(category: string): boolean {
  return category === "spell";
}

export function isEquipmentCategory(category: string): boolean {
  return category === "equipment";
}

export function isTerrainCategory(category: string): boolean {
  return category === "terrain";
}

export function isRelicCategory(category: string): boolean {
  return category === "relic";
}

export function isTrapCategory(category: string): boolean {
  return category === "trap";
}

export function isCommanderCategory(category: string): boolean {
  return category === "commander";
}
