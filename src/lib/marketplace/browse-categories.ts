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
    id: "HOUSING",
    label: "Housing",
    description: "Homestead shells and land parcels — browse scaffolding.",
    listingCategory: "PROPERTY",
    enabled: false,
    scaffold: true,
    subfilters: [
      { id: "homestead", label: "Homestead" },
      { id: "plot", label: "Plot" },
    ],
  },
  {
    id: "FURNITURE",
    label: "Furniture",
    description: "Room furniture and décor kits.",
    listingCategory: null,
    enabled: false,
    scaffold: true,
    subfilters: [
      { id: "seating", label: "Seating" },
      { id: "lighting", label: "Lighting" },
      { id: "trophies", label: "Trophies" },
    ],
  },
  {
    id: "COSMETICS",
    label: "Cosmetics",
    description: "Keeper and Riftling flair — token utility sink.",
    listingCategory: null,
    enabled: false,
    scaffold: true,
    subfilters: [
      { id: "skins", label: "Skins" },
      { id: "emotes", label: "Emotes" },
      { id: "auras", label: "Auras" },
    ],
  },
  {
    id: "BUNDLES",
    label: "Bundles",
    description: "Pet + loadout and curated packs.",
    listingCategory: "PETS",
    enabled: true,
    scaffold: true,
    subfilters: [
      { id: "pet_loadout", label: "Pet + loadout" },
      { id: "starter", label: "Starter packs" },
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
