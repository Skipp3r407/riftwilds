/**
 * Unified classification surface for docs / tooltips / inventory DB.
 * Combat legality source of truth: `combat-eligibility.ts`.
 */

import type { TcgCard } from "@/content/tcg/types";
import {
  classificationCategoryLabel,
  classifyCardSystem,
  INVENTORY_DECK_REJECT_MESSAGE,
  isCombatEligibleCard,
  isInventoryOnlyCard,
  useLocationLabel,
  type InventoryDomain,
} from "@/content/tcg/framework/combat-eligibility";

export const INVENTORY_REJECT_MESSAGE = INVENTORY_DECK_REJECT_MESSAGE;

export const CLASSIFICATION_CATEGORIES = [
  "companion",
  "spell",
  "relic",
  "equipment",
  "terrain",
  "trap",
  "utility",
  "food",
  "medicine",
  "crafting",
  "quest",
  "housing",
  "cosmetic",
  "collectible",
  "mount",
  "evolution",
  "fishing",
  "mining",
  "woodcutting",
  "tool",
  "commander",
] as const;

export type ClassificationCategory = (typeof CLASSIFICATION_CATEGORIES)[number];

export type UseLocation =
  | "combat"
  | "inventory"
  | "companion_care"
  | "commander_seat";

export type CardClassification = {
  cardId: string;
  category: ClassificationCategory;
  useLocation: UseLocation;
  combatDeckLegal: boolean;
  inventoryItemId: string | null;
  careItemId: string | null;
  label: string;
  useLocationLabel: string;
};

/** Inventory id → care-catalog id for Feed / Play consume. */
const INVENTORY_TO_CARE_ID: Record<string, string> = {
  "basic-pet-meal": "basic-meal",
  "premium-pet-meal": "premium-meal",
  "crystal-berry-snack": "riftberry",
  "aurora-treat": "glowberry-cluster",
  "happiness-treat": "riftberry",
  "fresh-water-flask": "fresh-water",
  "cleaning-kit": "cleaning-kit",
  "rift-toy": "rift-toy",
  "glowmoss-chew": "moss-chew-stick",
  "ripple-ball-toy": "ripple-ball",
  "whisper-bell-toy": "whisper-bell",
  "grooming-comb-set": "grooming-comb",
  "bonding-charm": "aurora-ribbon",
  "bond-ribbon": "aurora-ribbon",
  "moonpetal-bath-salts": "cleaning-kit",
  "starlit-lullaby-charm": "dreamnest-charm",
  "comfortable-nest": "nest-fluff",
  "nest-fluff-pillow": "nest-fluff",
  "recovery-blanket": "dreamnest-charm",
  "medicine-pack": "field-medicine",
  "vitality-petal-tea": "vitality-tonic",
  "rift-salve-kit": "field-medicine",
  "dormancy-revival-bloom": "field-medicine",
};

function domainToCategory(domain: InventoryDomain): ClassificationCategory {
  switch (domain) {
    case "food":
      return "food";
    case "medicine":
    case "potion":
    case "recovery":
      return "medicine";
    case "housing":
      return "housing";
    case "toy":
    case "tool":
    case "care":
      return "tool";
    case "quest":
      return "quest";
    case "cosmetic":
      return "cosmetic";
    case "material":
    case "crafting":
      return "crafting";
    case "mount":
      return "mount";
    case "fishing":
      return "fishing";
    case "mining":
      return "mining";
    case "woodcutting":
      return "woodcutting";
    default:
      return "collectible";
  }
}

export function classifyCard(
  card: Pick<TcgCard, "id" | "type">,
): CardClassification {
  const cls = classifyCardSystem(card.id, card.type);
  const label = classificationCategoryLabel(card.id, card.type);
  const locLabel = useLocationLabel(card.id, card.type);

  if (cls.system === "inventory") {
    const category = domainToCategory(cls.domain);
    const useLocation: UseLocation =
      cls.domain === "food" ||
      cls.domain === "care" ||
      cls.domain === "toy" ||
      cls.domain === "housing" ||
      cls.domain === "medicine"
        ? "companion_care"
        : "inventory";
    return {
      cardId: card.id,
      category,
      useLocation,
      combatDeckLegal: false,
      inventoryItemId: cls.inventoryItemId,
      careItemId: INVENTORY_TO_CARE_ID[cls.inventoryItemId] ?? null,
      label,
      useLocationLabel: locLabel,
    };
  }

  if (cls.kind === "commander") {
    return {
      cardId: card.id,
      category: "commander",
      useLocation: "commander_seat",
      combatDeckLegal: false,
      inventoryItemId: null,
      careItemId: null,
      label,
      useLocationLabel: locLabel,
    };
  }

  const kindToCat: Record<string, ClassificationCategory> = {
    companion: "companion",
    evolution: "evolution",
    spell: "spell",
    equipment: "equipment",
    relic: "relic",
    terrain: "terrain",
    trap: "trap",
    rift_event: "spell",
    utility_combat: "utility",
  };

  return {
    cardId: card.id,
    category: kindToCat[cls.kind] ?? "utility",
    useLocation: "combat",
    combatDeckLegal: true,
    inventoryItemId: null,
    careItemId: null,
    label,
    useLocationLabel: locLabel,
  };
}

export function isCombatDeckLegalCard(
  card: Pick<TcgCard, "id" | "type">,
): boolean {
  return isCombatEligibleCard(card.id, card.type);
}

export function isInventoryOnlyTcgCardId(cardId: string): boolean {
  return isInventoryOnlyCard(cardId);
}

export function inventoryItemIdForTcgCard(cardId: string): string | null {
  const cls = classifyCardSystem(cardId);
  return cls.system === "inventory" ? cls.inventoryItemId : null;
}

export function careItemIdForInventoryId(inventoryItemId: string): string | null {
  return INVENTORY_TO_CARE_ID[inventoryItemId] ?? null;
}

export function careItemIdForTcgCard(cardId: string): string | null {
  const inv = inventoryItemIdForTcgCard(cardId);
  if (!inv) return null;
  return careItemIdForInventoryId(inv);
}

export function classificationTooltipLines(classification: CardClassification): {
  category: string;
  useLocation: string;
} {
  return {
    category: classification.label,
    useLocation: classification.useLocationLabel,
  };
}

export function listInventoryOnlyTcgCardIds(): string[] {
  // Lazy: callers that need the full list should use listMigratedInventoryItems.
  return [];
}

/** Re-export eligibility helpers for a single import surface. */
export {
  INVENTORY_DECK_REJECT_MESSAGE,
  isCombatEligibleCard,
  isInventoryOnlyCard,
  classifyCardSystem,
  filterCombatEligibleIds,
  classificationCategoryLabel,
  useLocationLabel,
} from "@/content/tcg/framework/combat-eligibility";
