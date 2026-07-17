import { NextResponse } from "next/server";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { serializeListingRules } from "@/lib/marketplace/listing-rules";
import { serializeMarketplaceFeePolicy } from "@/lib/marketplace/fee-policy";
import { MARKETPLACE_CATEGORIES } from "@/lib/marketplace/categories";
import { serializeBreedingRules } from "@/lib/economy/breeding-rules";
import { EGG_SUPPLY_GLOBAL, EGG_SUPPLY_CATALOG } from "@/lib/economy/egg-supply";
import { serializeRankedNormalization } from "@/game/arena/ranked-normalization";
import { LISTING_RULES } from "@/lib/marketplace/listing-rules";

export async function GET() {
  return NextResponse.json({
    flags: {
      MARKETPLACE_ENABLED: featureFlagDefaults.MARKETPLACE_ENABLED,
      MARKETPLACE_DEMO_CATALOG_ENABLED: featureFlagDefaults.MARKETPLACE_DEMO_CATALOG_ENABLED,
      MARKETPLACE_WRITES_ENABLED: featureFlagDefaults.MARKETPLACE_WRITES_ENABLED,
      MARKETPLACE_EGG_SALES_ENABLED: featureFlagDefaults.MARKETPLACE_EGG_SALES_ENABLED,
      MARKETPLACE_PET_SALES_ENABLED: featureFlagDefaults.MARKETPLACE_PET_SALES_ENABLED,
      MARKETPLACE_BUNDLE_LISTINGS_ENABLED: featureFlagDefaults.MARKETPLACE_BUNDLE_LISTINGS_ENABLED,
      REAL_SOL_MARKETPLACE_ENABLED: featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED,
      SOL_PURCHASES_ENABLED: featureFlagDefaults.SOL_PURCHASES_ENABLED,
      BREEDING_ENABLED: featureFlagDefaults.BREEDING_ENABLED,
      RANKED_EQUIPMENT_NORMALIZATION_ENABLED:
        featureFlagDefaults.RANKED_EQUIPMENT_NORMALIZATION_ENABLED,
    },
    listingRules: serializeListingRules(),
    feePolicy: serializeMarketplaceFeePolicy(),
    categories: MARKETPLACE_CATEGORIES,
    eggSupply: {
      global: EGG_SUPPLY_GLOBAL,
      sources: Object.values(EGG_SUPPLY_CATALOG),
    },
    breeding: serializeBreedingRules(),
    rankedNormalization: serializeRankedNormalization(),
    disclosures: LISTING_RULES.disclosures,
  });
}
