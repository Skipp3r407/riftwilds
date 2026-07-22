/**
 * Typed inventory / companion-care item models.
 * Combat cards stay in the TCG binder; these track world quantities.
 */

import type { ClassificationCategory, UseLocation } from "@/content/tcg/framework/card-classification";
import type { ItemRarity } from "@/lib/items/types";

export type InventoryItemDef = {
  id: string;
  name: string;
  description: string;
  category: ClassificationCategory;
  useLocation: UseLocation;
  rarity: ItemRarity;
  stackable: boolean;
  maxStack: number;
  iconPath: string;
  /** Optional TCG catalog id (art / lore mirror — never deckable). */
  tcgCardId: string | null;
  /** Optional Companion Care catalog id for Feed / Play / Heal consume. */
  careItemId: string | null;
  /** Feed Companion effects (display + care bridge). */
  careEffects?: {
    hunger?: number;
    energy?: number;
    mood?: number;
    trust?: number;
    bond?: number;
    xp?: number;
  };
};

export type PlayerInventoryStack = {
  itemId: string;
  quantity: number;
};

export type PlayerInventorySnapshot = {
  ownerKey: string;
  stacks: PlayerInventoryStack[];
  updatedAt: string;
};

export type CompanionCareProfile = {
  publicPetId: string;
  name: string;
  hunger: number;
  energy: number;
  mood: number;
  trust: number;
  bond: number;
  xp: number;
  favorites: string[];
};
