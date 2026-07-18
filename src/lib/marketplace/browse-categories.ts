/**
 * Marketplace browse IA — extends listing categories with housing / cosmetics /
 * bundles / offers / wishlists scaffolding without breaking listing rules.
 */

import {
  MARKETPLACE_CATEGORIES,
  type MarketplaceCategoryTab,
} from "@/lib/marketplace/categories";
import type { MarketplaceAssetCategory } from "@/lib/marketplace/listing-rules";

export type BrowseCategoryId =
  | MarketplaceAssetCategory
  | "HOUSING"
  | "FURNITURE"
  | "COSMETICS"
  | "BUNDLES"
  | "OFFERS"
  | "WISHLISTS";

export type BrowseCategoryTab = {
  id: BrowseCategoryId;
  label: string;
  description: string;
  /** Maps to listing API category when live; null for pure scaffolding. */
  listingCategory: MarketplaceAssetCategory | null;
  enabled: boolean;
  scaffold: boolean;
  subfilters: { id: string; label: string }[];
};

function fromListing(tab: MarketplaceCategoryTab): BrowseCategoryTab {
  return {
    id: tab.id,
    label: tab.label,
    description: tab.description,
    listingCategory: tab.id,
    enabled: tab.enabled,
    scaffold: false,
    subfilters: tab.subfilters,
  };
}

export const MARKETPLACE_BROWSE_CATEGORIES: BrowseCategoryTab[] = [
  ...MARKETPLACE_CATEGORIES.map(fromListing),
  {
    id: "COSMETICS",
    label: "Card cosmetics",
    description: "Sleeves, board skins, and binder spines for Rift Battles.",
    listingCategory: "EQUIPMENT",
    enabled: true,
    scaffold: false,
    subfilters: [
      { id: "sleeve", label: "Sleeves" },
      { id: "board", label: "Board skins" },
      { id: "binder", label: "Binder spines" },
      { id: "emotes", label: "Emotes" },
    ],
  },
  {
    id: "BUNDLES",
    label: "Bundles",
    description: "Curated card packs and pet + loadout bundles.",
    listingCategory: "PACKS",
    enabled: true,
    scaffold: true,
    subfilters: [
      { id: "starter", label: "Starter packs" },
      { id: "affinity", label: "Affinity bundles" },
      { id: "pet_loadout", label: "Pet + loadout" },
    ],
  },
  {
    id: "HOUSING",
    label: "Housing",
    description: "Property shells — Living World future habitat.",
    listingCategory: "PROPERTY",
    enabled: true,
    scaffold: true,
    subfilters: [
      { id: "homestead", label: "Homestead" },
      { id: "plot", label: "Plot" },
      { id: "blueprint", label: "Blueprint" },
    ],
  },
  {
    id: "FURNITURE",
    label: "Furniture",
    description: "Habitat décor kits (Credits) — secondary to duel goods.",
    listingCategory: null,
    enabled: true,
    scaffold: true,
    subfilters: [
      { id: "seating", label: "Seating" },
      { id: "lighting", label: "Lighting" },
      { id: "trophies", label: "Trophies" },
      { id: "workshop", label: "Workshop" },
      { id: "riftling", label: "Riftling" },
    ],
  },
  {
    id: "OFFERS",
    label: "Offers",
    description: "Buyer offers on listings — authority later.",
    listingCategory: null,
    enabled: false,
    scaffold: true,
    subfilters: [{ id: "open", label: "Open offers" }],
  },
  {
    id: "WISHLISTS",
    label: "Wishlists",
    description: "Saved wants for friends and guild trades.",
    listingCategory: null,
    enabled: false,
    scaffold: true,
    subfilters: [{ id: "mine", label: "My wishlist" }],
  },
];

export function listBrowseCategories(opts?: { includeScaffold?: boolean }) {
  const includeScaffold = opts?.includeScaffold !== false;
  return MARKETPLACE_BROWSE_CATEGORIES.filter(
    (c) => includeScaffold || !c.scaffold,
  );
}
