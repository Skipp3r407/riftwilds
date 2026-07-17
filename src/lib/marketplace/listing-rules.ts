/**
 * Marketplace listing controls — caps, fees, durations, integrity hooks.
 */

import { solToLamports } from "@/lib/items/lamports";

export type MarketplaceAssetCategory =
  | "EGGS"
  | "PETS"
  | "EQUIPMENT"
  | "CONSUMABLES"
  | "PROPERTY";

export type ListingBundleMode = "PET_ONLY" | "PET_PLUS_LOADOUT";

export const LISTING_RULES = {
  maxActiveListingsPerWallet: {
    petOrEgg: 5,
    items: 20,
  },
  minListingPriceLamports: solToLamports("0.001"),
  maxListingDurationDays: 7,
  /** Hours before a cancelled listing slot can be reused for the same asset. */
  cancelCooldownHours: 6,
  /** Small non-refundable listing fee (~0.002 SOL). */
  listingFeeLamports: solToLamports("0.002"),
  /**
   * Sale fee band (percent of sale). Active policy uses 10% total non-seller
   * (90/5/3/1/1). Items may use a lighter ~5% total fee policy.
   */
  saleFeePercentBand: { min: 5, max: 10, petsAndEggsActive: 10, itemsActive: 5 },
  suspiciousPrice: {
    /** Warn when ask is ≥ this multiple of recent similar avg (when history exists). */
    highMultipleOfAvg: 8,
    /** Warn when ask is ≤ this fraction of recent similar avg. */
    lowFractionOfAvg: 0.15,
  },
  ownership: {
    requireVerifiedOwnership: true,
    blockDuplicatePurchaseRequestIds: true,
  },
  disclosures: {
    noGuaranteedValue:
      "Sellers set asking prices. Riftwilds does not assign a guaranteed monetary value to eggs, pets, or items.",
    listingFeeNonRefundable: "Listing fees are non-refundable even if the listing expires or is cancelled.",
    bundleExplicit:
      "Buyers only receive items explicitly included in a loadout bundle. Equipped items are never auto-transferred.",
  },
} as const;

export type ListingCreateInput = {
  category: MarketplaceAssetCategory;
  priceLamports: bigint;
  durationDays: number;
  bundleMode?: ListingBundleMode;
  bundledItemKeys?: string[];
  eggAccountBound?: boolean;
  activePetEggListings: number;
  activeItemListings: number;
};

export type ListingValidationResult =
  | { ok: true; listingFeeLamports: bigint; expiresInDays: number }
  | { ok: false; reason: string };

export function validateListingCreate(input: ListingCreateInput): ListingValidationResult {
  if (input.eggAccountBound) {
    return { ok: false, reason: "starter_eggs_account_bound" };
  }
  if (input.priceLamports < LISTING_RULES.minListingPriceLamports) {
    return { ok: false, reason: "below_min_listing_price" };
  }
  if (input.durationDays < 1 || input.durationDays > LISTING_RULES.maxListingDurationDays) {
    return { ok: false, reason: "invalid_listing_duration" };
  }
  const isItem = input.category === "EQUIPMENT" || input.category === "CONSUMABLES";
  if (isItem) {
    if (input.activeItemListings >= LISTING_RULES.maxActiveListingsPerWallet.items) {
      return { ok: false, reason: "max_item_listings" };
    }
  } else if (input.category === "EGGS" || input.category === "PETS") {
    if (input.activePetEggListings >= LISTING_RULES.maxActiveListingsPerWallet.petOrEgg) {
      return { ok: false, reason: "max_pet_egg_listings" };
    }
  } else if (input.category === "PROPERTY") {
    return { ok: false, reason: "property_not_enabled" };
  }

  if (input.bundleMode === "PET_PLUS_LOADOUT") {
    if (!input.bundledItemKeys || input.bundledItemKeys.length === 0) {
      return { ok: false, reason: "bundle_requires_selected_items" };
    }
  }
  if (input.bundleMode === "PET_ONLY" && input.bundledItemKeys && input.bundledItemKeys.length > 0) {
    return { ok: false, reason: "pet_only_cannot_include_items" };
  }

  return {
    ok: true,
    listingFeeLamports: LISTING_RULES.listingFeeLamports,
    expiresInDays: input.durationDays,
  };
}

export function serializeListingRules() {
  return {
    maxActiveListingsPerWallet: { ...LISTING_RULES.maxActiveListingsPerWallet },
    minListingPriceSol: "0.001",
    maxListingDurationDays: LISTING_RULES.maxListingDurationDays,
    cancelCooldownHours: LISTING_RULES.cancelCooldownHours,
    listingFeeSol: "0.002",
    saleFeePercentBand: { ...LISTING_RULES.saleFeePercentBand },
    suspiciousPrice: { ...LISTING_RULES.suspiciousPrice },
    ownership: { ...LISTING_RULES.ownership },
    disclosures: { ...LISTING_RULES.disclosures },
  };
}
