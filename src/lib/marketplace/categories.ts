import type { MarketplaceAssetCategory } from "@/lib/marketplace/listing-rules";

export type MarketplaceCategoryTab = {
  id: MarketplaceAssetCategory;
  label: string;
  description: string;
  enabled: boolean;
  subfilters: { id: string; label: string }[];
};

export const MARKETPLACE_CATEGORIES: MarketplaceCategoryTab[] = [
  {
    id: "CARDS",
    label: "Cards",
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
    id: "PACKS",
    label: "Packs",
    description: "Disclosed card packs — no paid mystery gear.",
    enabled: true,
    subfilters: [
      { id: "starter", label: "Starter" },
      { id: "affinity", label: "Affinity" },
      { id: "seasonal", label: "Seasonal" },
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
    id: "EGGS",
    label: "Eggs",
    description: "Unopened eggs — disclosed ranges only until hatch.",
    enabled: true,
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
    description: "Hatched pets with known traits and battle records.",
    enabled: true,
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
    id: "EQUIPMENT",
    label: "Equipment",
    description: "Legacy loadout gear — secondary to cards & packs.",
    enabled: true,
    subfilters: [
      { id: "weapon", label: "Weapons" },
      { id: "armor", label: "Armor" },
      { id: "scroll", label: "Scrolls" },
      { id: "sleeve", label: "Card sleeves" },
    ],
  },
  {
    id: "CONSUMABLES",
    label: "Consumables",
    description: "Potions, care items, and materials.",
    enabled: true,
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
    subfilters: [{ id: "homestead", label: "Homestead (stub)" }],
  },
];

export function getMarketplaceCategory(id: MarketplaceAssetCategory) {
  return MARKETPLACE_CATEGORIES.find((c) => c.id === id);
}
