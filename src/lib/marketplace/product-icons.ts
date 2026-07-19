/**
 * Shared product art keys for marketplace demo listings + shop catalog.
 */

import type { EggSourceKind } from "@/lib/economy/egg-supply";
import { creatureThumbPath } from "@/lib/assets/paths";
import type { MarketplaceAssetCategory } from "@/lib/marketplace/listing-rules";

const SHOP = "/assets/ui/shop";
const POTIONS = "/assets/items/potions/icons";

export const MARKETPLACE_PRODUCT_ICONS: Record<string, string> = {
  "ember-spark-pack": `${SHOP}/pack-ember.png`,
  "tideglass-pack": `${SHOP}/pack-tide.png`,
  "grove-moss-pack": `${SHOP}/pack-grove.png`,
  "stormspire-pack": `${SHOP}/pack-storm.png`,
  "binder-page": `${SHOP}/binder-page.png`,
  "extra-deck-slot": `${SHOP}/deck-slot.png`,
  "cyan-rift-sleeve": `${SHOP}/sleeve-cyan.png`,
  "amber-hearth-sleeve": `${SHOP}/sleeve-amber.png`,
  "ember-felt-board": `${SHOP}/board-ember.png`,
  "keeper-folio": `${SHOP}/binder-folio.png`,
  "ember-talons": "/assets/items/weapons/icons/ember-talons.png",
  "heart-of-the-volcano": "/assets/items/weapons/icons/heart-of-the-volcano.png",
  "cinder-swipe": `${SHOP}/pack-ember.png`,
  "tide-guard": `${SHOP}/pack-tide.png`,
  "foil-keeper-folio": `${SHOP}/binder-folio.png`,
  "alt-art-storm-sleeve": `${SHOP}/sleeve-cyan.png`,
  "emberheart-elixir": `${POTIONS}/emberheart-elixir.png`,
  "focus-tonic": `${POTIONS}/focus-tonic.png`,
  "small-healing-salve": `${POTIONS}/small-healing-salve.png`,
};

/** Desk / category strip art — existing UI assets only. */
export const MARKETPLACE_CATEGORY_ART: Record<MarketplaceAssetCategory | "ALL", string> = {
  ALL: "/assets/marketplace/desk-atmosphere.png",
  PACKS: `${SHOP}/pack-ember.png`,
  CARDS: `${SHOP}/binder-page.png`,
  EQUIPMENT: `${SHOP}/sleeve-cyan.png`,
  COLLECTIBLES: `${SHOP}/binder-folio.png`,
  EGGS: "/assets/eggs/celestial.svg",
  PETS: "/assets/ui/empty-states/pets.png",
  CONSUMABLES: `${POTIONS}/emberheart-elixir.png`,
  PROPERTY: "/assets/ui/ecosystem/housing-catalog.png",
};

const EGG_SOURCE_ART: Record<EggSourceKind, string> = {
  STARTER: "/assets/eggs/common-rift.svg",
  OFFICIAL_SEASONAL: "/assets/eggs/celestial.svg",
  STORY_ACHIEVEMENT: "/assets/eggs/radiant.svg",
  BREEDING: "/assets/eggs/grove.svg",
  COMMUNITY_EVENT: "/assets/eggs/spirit.svg",
  LIMITED_COLLECTOR: "/assets/eggs/void.svg",
};

export function resolveMarketplaceProductIcon(key: string | null | undefined): string | null {
  if (!key) return null;
  return MARKETPLACE_PRODUCT_ICONS[key] ?? null;
}

export function resolveMarketplaceCategoryArt(
  category: MarketplaceAssetCategory | "ALL" | string,
): string {
  if (category in MARKETPLACE_CATEGORY_ART) {
    return MARKETPLACE_CATEGORY_ART[category as MarketplaceAssetCategory | "ALL"];
  }
  return MARKETPLACE_CATEGORY_ART.ALL;
}

export function resolveMarketplaceEggArt(sourceKind: EggSourceKind | string | null | undefined): string {
  if (sourceKind && sourceKind in EGG_SOURCE_ART) {
    return EGG_SOURCE_ART[sourceKind as EggSourceKind];
  }
  return "/assets/eggs/common-rift.svg";
}

export function resolveMarketplacePetArt(speciesSlug: string | null | undefined): string {
  if (!speciesSlug) return "/assets/ui/empty-states/pets.png";
  return creatureThumbPath(speciesSlug);
}
