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
    description: "Weapons, armor, and loadout gear.",
    enabled: true,
    subfilters: [
      { id: "weapon", label: "Weapons" },
      { id: "armor", label: "Armor" },
      { id: "scroll", label: "Scrolls" },
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
    description: "Homesteads and land — coming later.",
    enabled: false,
    subfilters: [{ id: "homestead", label: "Homestead (stub)" }],
  },
];

export function getMarketplaceCategory(id: MarketplaceAssetCategory) {
  return MARKETPLACE_CATEGORIES.find((c) => c.id === id);
}
