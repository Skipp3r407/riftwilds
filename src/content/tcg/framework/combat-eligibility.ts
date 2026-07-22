/**
 * Combat vs Inventory eligibility — Riftwilds redesign.
 *
 * Combat decks may only contain battle cards (Companions, Spells, Equipment,
 * Relics, Terrain, Rift Events, Traps, Utility spells). Food / medicine /
 * crafting / housing / quest / cosmetics / tools never shuffle into combat.
 *
 * Default: non-combat-named `rotr-s-item-*` → Inventory (Basic Pet Meal = Food).
 * Combat-named `rotr-s-item-*` (Ember Bolt, Grove Mend, …) stay Spells.
 *
 * Card artwork and lore stay in the catalog; ids are reclassified, not deleted.
 */

import {
  isCombatNamedItemSpell,
  resolveCardCategory,
  type TcgCardCategory,
} from "@/content/tcg/framework/card-categories";

/** Shown when a keeper tries to add an inventory item to a combat deck. */
export const INVENTORY_DECK_REJECT_MESSAGE =
  "This item belongs in your Inventory, not your Combat Deck.";

/** Domains for items that left (or never belonged in) combat decks. */
export const INVENTORY_DOMAINS = [
  "food",
  "medicine",
  "care",
  "housing",
  "toy",
  "potion",
  "material",
  "tool",
  "quest",
  "cosmetic",
  "recovery",
  "crafting",
  "collectible",
  "mount",
  "fishing",
  "mining",
  "woodcutting",
  "utility_world",
] as const;

export type InventoryDomain = (typeof INVENTORY_DOMAINS)[number];

/** Combat card families allowed in decks / Practice Board draw pools. */
export const COMBAT_CARD_KINDS = [
  "companion",
  "evolution",
  "commander",
  "spell",
  "equipment",
  "relic",
  "terrain",
  "trap",
  "rift_event",
  "utility_combat",
] as const;

export type CombatCardKind = (typeof COMBAT_CARD_KINDS)[number];

export type CardSystemClass =
  | { system: "combat"; kind: CombatCardKind; category: TcgCardCategory }
  | {
      system: "inventory";
      domain: InventoryDomain;
      category: TcgCardCategory;
      /** Stable inventory/shop catalog id when known. */
      inventoryItemId: string;
      careActionHint?:
        | "feed"
        | "play"
        | "train"
        | "heal"
        | "clean"
        | "rest"
        | "bond"
        | "use";
    };

/**
 * Companion Care / world-only suffixes. Battle heals, energy, status cleanses,
 * and Downed recovery stay combat Utility (not listed here).
 */
const FOOD_SUFFIXES = new Set([
  "basic-pet-meal",
  "premium-pet-meal",
  "crystal-berry-snack",
  "aurora-treat",
  "happiness-treat",
]);

const TOY_SUFFIXES = new Set([
  "rift-toy",
  "ripple-ball-toy",
  "whisper-bell-toy",
  "glowmoss-chew",
]);

const HOUSING_SUFFIXES = new Set([
  "comfortable-nest",
  "nest-fluff-pillow",
  "recovery-blanket",
  "starlit-lullaby-charm",
]);

const CARE_BOND_SUFFIXES = new Set([
  "bonding-charm",
  "bond-ribbon",
  "cleaning-kit",
  "grooming-comb-set",
  "moonpetal-bath-salts",
  "fresh-water-flask",
]);

/** Care-health medicine only (not battle HP potions). */
const CARE_MEDICINE_SUFFIXES = new Set([
  "medicine-pack",
  "dormancy-revival-bloom",
  "rift-salve-kit",
  "vitality-petal-tea",
]);

function suffixOfSItem(cardId: string): string | null {
  if (!cardId.startsWith("rotr-s-item-")) return null;
  return cardId.slice("rotr-s-item-".length);
}

function inventoryIdFromCardId(cardId: string): string {
  if (cardId.startsWith("rotr-s-item-")) return cardId.slice("rotr-s-item-".length);
  if (cardId.startsWith("rotr-r-mat-")) return cardId.slice("rotr-r-mat-".length);
  if (cardId.startsWith("rotr-prop-tool-")) return cardId.slice("rotr-prop-tool-".length);
  if (cardId.startsWith("rotr-x-quest-")) return cardId.slice("rotr-x-quest-".length);
  return cardId;
}

function classifySItemInventory(
  cardId: string,
  category: TcgCardCategory,
): CardSystemClass | null {
  const suffix = suffixOfSItem(cardId);
  if (!suffix) return null;
  if (isCombatNamedItemSpell(cardId)) return null;

  const inventoryItemId = inventoryIdFromCardId(cardId);

  if (FOOD_SUFFIXES.has(suffix)) {
    return {
      system: "inventory",
      domain: "food",
      category,
      inventoryItemId,
      careActionHint: "feed",
    };
  }
  if (TOY_SUFFIXES.has(suffix)) {
    return {
      system: "inventory",
      domain: "toy",
      category,
      inventoryItemId,
      careActionHint: "play",
    };
  }
  if (HOUSING_SUFFIXES.has(suffix)) {
    return {
      system: "inventory",
      domain: "housing",
      category,
      inventoryItemId,
      careActionHint: "rest",
    };
  }
  if (CARE_BOND_SUFFIXES.has(suffix)) {
    const careActionHint =
      suffix.includes("water") || suffix.includes("flask")
        ? "feed"
        : suffix.includes("clean") ||
            suffix.includes("groom") ||
            suffix.includes("bath")
          ? "clean"
          : "bond";
    return {
      system: "inventory",
      domain: "care",
      category,
      inventoryItemId,
      careActionHint,
    };
  }
  if (CARE_MEDICINE_SUFFIXES.has(suffix)) {
    return {
      system: "inventory",
      domain: "medicine",
      category,
      inventoryItemId,
      careActionHint: "heal",
    };
  }

  // Remaining `rotr-s-item-*` battle consumables → combat Utility (caller).
  return null;
}

/**
 * Classify a card id into combat vs inventory systems.
 * Does not delete content — only decides which system may use it.
 */
export function classifyCardSystem(
  cardId: string,
  rawType?: string,
): CardSystemClass {
  const category = resolveCardCategory(rawType ?? "spell", cardId);

  if (cardId.startsWith("rotr-r-mat-")) {
    return {
      system: "inventory",
      domain: "material",
      category,
      inventoryItemId: inventoryIdFromCardId(cardId),
    };
  }
  if (cardId.startsWith("rotr-prop-tool-")) {
    return {
      system: "inventory",
      domain: "tool",
      category,
      inventoryItemId: inventoryIdFromCardId(cardId),
    };
  }
  if (cardId.startsWith("rotr-x-quest-")) {
    return {
      system: "inventory",
      domain: "quest",
      category,
      inventoryItemId: inventoryIdFromCardId(cardId),
    };
  }
  if (cardId.includes("-cosmetic-") || cardId.includes("-mount-")) {
    return {
      system: "inventory",
      domain: cardId.includes("-mount-") ? "mount" : "cosmetic",
      category,
      inventoryItemId: inventoryIdFromCardId(cardId),
    };
  }
  if (cardId.includes("-fish-") || cardId.includes("-fishing-")) {
    return {
      system: "inventory",
      domain: "fishing",
      category,
      inventoryItemId: inventoryIdFromCardId(cardId),
    };
  }
  if (cardId.includes("-mine-") || cardId.includes("-mining-")) {
    return {
      system: "inventory",
      domain: "mining",
      category,
      inventoryItemId: inventoryIdFromCardId(cardId),
    };
  }
  if (cardId.includes("-woodcut") || cardId.includes("-logging-")) {
    return {
      system: "inventory",
      domain: "woodcutting",
      category,
      inventoryItemId: inventoryIdFromCardId(cardId),
    };
  }

  const sItem = classifySItemInventory(cardId, category);
  if (sItem) return sItem;

  if (isCombatNamedItemSpell(cardId) || category === "spell") {
    return { system: "combat", kind: "spell", category };
  }
  if (category === "companion") {
    return { system: "combat", kind: "companion", category };
  }
  if (category === "evolution") {
    return { system: "combat", kind: "evolution", category };
  }
  if (category === "commander") {
    return { system: "combat", kind: "commander", category };
  }
  if (category === "equipment") {
    return { system: "combat", kind: "equipment", category };
  }
  if (category === "relic") {
    return { system: "combat", kind: "relic", category };
  }
  if (category === "terrain") {
    return { system: "combat", kind: "terrain", category };
  }
  if (category === "trap") {
    return { system: "combat", kind: "trap", category };
  }
  if (category === "item") {
    // Battle consumables (heal / energy / status / Downed recovery) → Utility.
    return { system: "combat", kind: "utility_combat", category };
  }

  return { system: "combat", kind: "utility_combat", category };
}

/** True when the card may appear in combat main decks / Practice Board hands. */
export function isCombatEligibleCard(
  cardId: string,
  rawType?: string,
): boolean {
  const cls = classifyCardSystem(cardId, rawType);
  // Commander is combat system but never shuffled into the main deck.
  if (cls.system === "combat" && cls.kind === "commander") return false;
  return cls.system === "combat";
}

/** True when the card belongs in Inventory / Companion Care, never combat decks. */
export function isInventoryOnlyCard(
  cardId: string,
  rawType?: string,
): boolean {
  return classifyCardSystem(cardId, rawType).system === "inventory";
}

export function filterCombatEligibleIds(cardIds: string[]): string[] {
  return cardIds.filter((id) => isCombatEligibleCard(id));
}

export function inventoryRejectReason(
  cardId: string,
  rawType?: string,
): string | null {
  if (!isInventoryOnlyCard(cardId, rawType)) return null;
  return INVENTORY_DECK_REJECT_MESSAGE;
}

/** Full taxonomy label for tooltips / docs. */
export function classificationCategoryLabel(
  cardId: string,
  rawType?: string,
): string {
  const cls = classifyCardSystem(cardId, rawType);
  if (cls.system === "inventory") {
    const labels: Record<InventoryDomain, string> = {
      food: "Food",
      medicine: "Medicine",
      care: "Care",
      housing: "Housing",
      toy: "Toy",
      potion: "Potion",
      material: "Crafting",
      tool: "Tool",
      quest: "Quest",
      cosmetic: "Cosmetic",
      recovery: "Recovery",
      crafting: "Crafting",
      collectible: "Collectible",
      mount: "Mount",
      fishing: "Fishing",
      mining: "Mining",
      woodcutting: "Woodcutting",
      utility_world: "Collectible",
    };
    return labels[cls.domain];
  }
  const labels: Record<CombatCardKind, string> = {
    companion: "Companion",
    evolution: "Evolution",
    commander: "Commander",
    spell: "Spell",
    equipment: "Equipment",
    relic: "Relic",
    terrain: "Terrain",
    trap: "Trap",
    rift_event: "Spell",
    utility_combat: "Utility",
  };
  return labels[cls.kind];
}

export function useLocationLabel(cardId: string, rawType?: string): string {
  const cls = classifyCardSystem(cardId, rawType);
  if (cls.system === "inventory") {
    if (
      cls.domain === "food" ||
      cls.domain === "care" ||
      cls.domain === "toy" ||
      cls.domain === "housing" ||
      cls.domain === "medicine"
    ) {
      return "Companion Care / Inventory";
    }
    return "Inventory";
  }
  if (cls.kind === "commander") return "Commander seat (not shuffled)";
  return "Combat Deck / Battle";
}
