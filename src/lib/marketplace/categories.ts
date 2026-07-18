import type { MarketplaceAssetCategory } from "@/lib/marketplace/listing-rules";

export type MarketplaceCategoryTab = {
  id: MarketplaceAssetCategory;
  label: string;
  description: string;
  enabled: boolean;
  /** Demote Live World companion goods below the card desk. */
  demoted?: boolean;
  subfilters: { id: string; label: string }[];
};

export const MARKETPLACE_CATEGORIES: MarketplaceCategoryTab[] = [
  {
    id: "PACKS",
    label: "Card packs",
    description: "Disclosed card packs — no paid mystery gear. Credits-first trades.",
    enabled: true,
    subfilters: [
      { id: "starter", label: "Starter" },
      { id: "affinity", label: "Affinity" },
      { id: "seasonal", label: "Seasonal" },
    ],
  },
  {
    id: "CARDS",
    label: "Single cards",
    description: "Single Rift Battle cards for binders and decks — Credits-first trades.",
    enabled: true,
    subfilters: [
      { id: "unit", label: "Units" },
      { id: "spell", label: "Spells" },
      { id: "ember", label: "Ember" },
      { id: "tide", label: "Tide" },
      { id: "grove", label: "Grove" },
      { id: "rare-plus", label: "Rare+" },
    ],
  },
  {
    id: "COLLECTIBLES",
    label: "Collectibles",
    description:
      "Cosmetic collectible editions (alt art, foil) — not gameplay power. SOL listings stay flag-gated.",
    enabled: true,
    subfilters: [
      { id: "alt-art", label: "Alternate art" },
      { id: "foil", label: "Foil" },
      { id: "animated", label: "Animated" },
      { id: "founder", label: "Founder" },
    ],
  },
  {
    id: "EQUIPMENT",
    label: "Cosmetics & binders",
    description: "Sleeves, board skins, binder QoL — prestige only. Legacy loadout gear is demoted.",
    enabled: true,
    subfilters: [
      { id: "sleeve", label: "Card sleeves" },
      { id: "board", label: "Board skins" },
      { id: "binder", label: "Binder pages" },
      { id: "deck", label: "Deck slots" },
      { id: "weapon", label: "Legacy weapons" },
      { id: "armor", label: "Legacy armor" },
    ],
  },
  {
    id: "EGGS",
    label: "Eggs",
    description: "Unopened eggs — disclosed ranges only until hatch.",
    enabled: true,
    demoted: true,
    subfilters: [
      { id: "official", label: "Official" },
      { id: "bred", label: "Bred" },
      { id: "seasonal", label: "Seasonal" },
      { id: "event", label: "Event" },
      { id: "founder", label: "Founder" },
    ],
  },
  {
    id: "PETS",
    label: "Pets",
    description: "Hatched pets with known traits — companion secondary market.",
    enabled: true,
    demoted: true,
    subfilters: [
      { id: "hatchling", label: "Hatchling" },
      { id: "young", label: "Young" },
      { id: "adult", label: "Adult" },
      { id: "evolved", label: "Evolved" },
      { id: "battle-trained", label: "Battle-trained" },
      { id: "breeding", label: "Breeding" },
      { id: "collector", label: "Collector" },
    ],
  },
  {
    id: "CONSUMABLES",
    label: "Consumables",
    description: "Potions, care items, and materials.",
    enabled: true,
    demoted: true,
    subfilters: [
      { id: "potion", label: "Potions" },
      { id: "care", label: "Care" },
      { id: "material", label: "Materials" },
    ],
  },
  {
    id: "PROPERTY",
    label: "Property",
    description: "Homesteads and land — Living World future.",
    enabled: false,
    demoted: true,
    subfilters: [{ id: "homestead", label: "Homestead (stub)" }],
  },
];

export function getMarketplaceCategory(id: MarketplaceAssetCategory) {
  return MARKETPLACE_CATEGORIES.find((c) => c.id === id);
}
