import { NextResponse } from "next/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { featureFlagDefaults, isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  addRuntimeListing,
  countActiveListingsForSeller,
  listMarketplaceCatalog,
} from "@/lib/marketplace/demo-listings";
import { validateListingCreate } from "@/lib/marketplace/listing-rules";
import { resolveSettlementGate } from "@/lib/marketplace/integrity";
import { solToLamports, lamportsToSolString } from "@/lib/items/lamports";
import { LISTING_RULES } from "@/lib/marketplace/listing-rules";
import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { eggListingDisclosure } from "@/lib/economy/egg-supply";

const createSchema = z.object({
  kind: z.enum(["EGG", "PET", "ITEM"]),
  category: z.enum([
    "EGGS",
    "PETS",
    "CARDS",
    "PACKS",
    "EQUIPMENT",
    "CONSUMABLES",
    "PROPERTY",
  ]),
  subfilter: z.string().optional(),
  title: z.string().min(2).max(80),
  priceSol: z.string().regex(/^\d+(\.\d{1,9})?$/),
  durationDays: z.number().int().min(1).max(7).default(7),
  bundleMode: z.enum(["PET_ONLY", "PET_PLUS_LOADOUT"]).optional(),
  bundledItems: z
    .array(z.object({ key: z.string(), name: z.string(), slot: z.string().optional() }))
    .optional(),
  eggSourceKind: z
    .enum([
      "STARTER",
      "OFFICIAL_SEASONAL",
      "STORY_ACHIEVEMENT",
      "BREEDING",
      "COMMUNITY_EVENT",
      "LIMITED_COLLECTOR",
    ])
    .optional(),
  generation: z.number().int().min(1).max(99).optional(),
  parents: z
    .array(z.object({ label: z.string(), publicId: z.string().optional() }))
    .nullable()
    .optional(),
  pet: z
    .object({
      rarity: z.string(),
      speciesSlug: z.string(),
      speciesName: z.string(),
      affinity: z.string(),
      level: z.number().int(),
      evolutionStage: z.string(),
      abilities: z.array(z.string()),
      ultimate: z.string().nullable(),
      battleRecord: z.object({ wins: z.number(), losses: z.number() }),
      breedingUsesRemaining: z.number().int(),
      generation: z.number().int(),
      founderStatus: z.boolean(),
    })
    .optional(),
  sellerLabel: z.string().min(2).max(64).default("demo-seller"),
});

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category") ?? "ALL";
  const subfilter = searchParams.get("subfilter") ?? undefined;

  const catalogEnabled =
    isFeatureEnabled("MARKETPLACE_DEMO_CATALOG_ENABLED") ||
    isFeatureEnabled("MARKETPLACE_ENABLED");

  if (!catalogEnabled) {
    return NextResponse.json({ error: "MARKETPLACE_CATALOG_DISABLED" }, { status: 403 });
  }

  const listings = listMarketplaceCatalog({
    category: category === "ALL" ? undefined : category,
    subfilter,
  });

  const gate = resolveSettlementGate({
    marketplaceEnabled: featureFlagDefaults.MARKETPLACE_ENABLED,
    realSolMarketplaceEnabled: featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED,
    solPurchasesEnabled: featureFlagDefaults.SOL_PURCHASES_ENABLED,
  });

  return NextResponse.json({
    flags: {
      MARKETPLACE_ENABLED: featureFlagDefaults.MARKETPLACE_ENABLED,
      MARKETPLACE_WRITES_ENABLED: featureFlagDefaults.MARKETPLACE_WRITES_ENABLED,
      MARKETPLACE_DEMO_CATALOG_ENABLED: featureFlagDefaults.MARKETPLACE_DEMO_CATALOG_ENABLED,
      REAL_SOL_MARKETPLACE_ENABLED: featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED,
      SOL_PURCHASES_ENABLED: featureFlagDefaults.SOL_PURCHASES_ENABLED,
    },
    settlement: gate,
    listings,
  });
}

export async function POST(req: Request) {
  if (
    !isFeatureEnabled("MARKETPLACE_WRITES_ENABLED") &&
    !isFeatureEnabled("MARKETPLACE_ENABLED")
  ) {
    return NextResponse.json(
      {
        error: "MARKETPLACE_WRITES_DISABLED",
        hint: "Set MARKETPLACE_WRITES_ENABLED or MARKETPLACE_ENABLED to create listings.",
      },
      { status: 403 },
    );
  }

  const body = createSchema.safeParse(await req.json().catch(() => null));
  if (!body.success) {
    return NextResponse.json({ error: "INVALID_BODY", details: body.error.flatten() }, { status: 400 });
  }

  const data = body.data;
  if (data.kind === "EGG" && !isFeatureEnabled("MARKETPLACE_EGG_SALES_ENABLED")) {
    return NextResponse.json({ error: "EGG_SALES_DISABLED" }, { status: 403 });
  }
  if (data.kind === "PET" && !isFeatureEnabled("MARKETPLACE_PET_SALES_ENABLED")) {
    return NextResponse.json({ error: "PET_SALES_DISABLED" }, { status: 403 });
  }
  if (
    data.bundleMode === "PET_PLUS_LOADOUT" &&
    !isFeatureEnabled("MARKETPLACE_BUNDLE_LISTINGS_ENABLED")
  ) {
    return NextResponse.json({ error: "BUNDLE_LISTINGS_DISABLED" }, { status: 403 });
  }

  const priceLamports = solToLamports(data.priceSol);
  const counts = countActiveListingsForSeller(data.sellerLabel);
  const eggAccountBound = data.eggSourceKind === "STARTER";

  const validation = validateListingCreate({
    category: data.category,
    priceLamports,
    durationDays: data.durationDays,
    bundleMode: data.bundleMode,
    bundledItemKeys: data.bundledItems?.map((i) => i.key),
    eggAccountBound,
    activePetEggListings: counts.petOrEgg,
    activeItemListings: counts.items,
  });

  if (!validation.ok) {
    return NextResponse.json({ error: validation.reason }, { status: 400 });
  }

  const publicId = `listing_${randomUUID().slice(0, 8)}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + data.durationDays * 86400_000);

  let egg: MarketplaceListingView["egg"] = null;
  let pet: MarketplaceListingView["pet"] = null;
  let item: MarketplaceListingView["item"] = null;

  if (data.kind === "EGG") {
    const source = data.eggSourceKind ?? "OFFICIAL_SEASONAL";
    const disc = eggListingDisclosure(source);
    egg = {
      eggType: disc.eggType,
      sourceKind: source,
      generation: data.generation ?? 1,
      parents: data.parents ?? null,
      possibleSpecies: disc.possibleSpecies,
      possibleAffinities: disc.possibleAffinities,
      possibleRarityRange: disc.possibleRarityRange,
      possibleCosmeticTraits: disc.possibleCosmeticTraits,
      hatchTimeHours: disc.hatchTimeHours,
      originalSource: disc.originalSource,
      ownershipHistory: [
        {
          ownerLabel: data.sellerLabel,
          acquiredAt: now.toISOString(),
          method: source,
        },
      ],
      breedable: disc.breedable,
      holderRewardEligible: disc.holderRewardEligible,
      exactCreatureKnown: false,
    };
  } else if (data.kind === "PET" && data.pet) {
    pet = {
      rarity: data.pet.rarity,
      speciesSlug: data.pet.speciesSlug,
      speciesName: data.pet.speciesName,
      affinity: data.pet.affinity,
      geneticsSummary: "Seller-disclosed genetics summary",
      cosmetics: [],
      evolutionStage: data.pet.evolutionStage,
      level: data.pet.level,
      abilities: data.pet.abilities,
      ultimate: data.pet.ultimate,
      battleRecord: data.pet.battleRecord,
      breeding: {
        available: data.pet.breedingUsesRemaining > 0,
        usesRemaining: data.pet.breedingUsesRemaining,
      },
      permanentTraits: [],
      seasonalOrigin: null,
      generation: data.pet.generation,
      founderStatus: data.pet.founderStatus,
      memories: [],
      achievements: [],
    };
  } else if (data.kind === "ITEM") {
    item = {
      key: data.title.toLowerCase().replace(/\s+/g, "-"),
      name: data.title,
      rarity: "COMMON",
      category: data.category,
    };
  }

  const listing: MarketplaceListingView = {
    publicId,
    kind: data.kind,
    category: data.category,
    subfilter: data.subfilter ?? null,
    title: data.title,
    sellerLabel: data.sellerLabel,
    priceLamports: priceLamports.toString(),
    priceSol: lamportsToSolString(priceLamports),
    currency: "DEMO_CREDITS",
    status: "ACTIVE",
    createdAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
    bundleMode: data.bundleMode ?? (data.kind === "PET" ? "PET_ONLY" : null),
    bundledItems: data.bundledItems ?? [],
    egg,
    pet,
    item,
    feeDisclosure: {
      listingFeeSol: lamportsToSolString(LISTING_RULES.listingFeeLamports),
      saleFeeNote:
        data.kind === "ITEM"
          ? "Item sales use ~5% total fee when enabled."
          : "Pet/egg sales use 90/5/3/1/1 when sold.",
    },
    demo: true,
  };

  addRuntimeListing(listing);

  return NextResponse.json({
    ok: true,
    listing,
    listingFeeLamports: LISTING_RULES.listingFeeLamports.toString(),
    note: "Demo listing stored in-memory. SOL settlement remains flag-gated.",
  });
}
