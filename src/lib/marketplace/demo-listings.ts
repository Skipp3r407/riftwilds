import {
  eggListingDisclosure,
  computeRemainingSupply,
  EGG_SUPPLY_CATALOG,
  type EggSourceKind,
} from "@/lib/economy/egg-supply";
import { getSpeciesLore } from "@/content/pets/lore";
import { LISTING_RULES } from "@/lib/marketplace/listing-rules";
import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { generatePetBiography } from "@/lib/pets/backstory-generator";
import { lamportsToSolString, solToLamports } from "@/lib/items/lamports";
import { buildPriceHistorySummary, serializePriceHistory } from "@/lib/marketplace/price-history";
import { getSpeciesBySlug } from "@/game/creatures/species-catalog";

function lorePreviewForPet(speciesSlug: string, rarity: string, seed: string) {
  const lore = getSpeciesLore(speciesSlug);
  const species = getSpeciesBySlug(speciesSlug);
  if (!lore || !species) {
    return {
      shortBio: null,
      personalBioPreview: null,
      originStory: null,
      temperament: null,
      favoriteActivity: null,
      uniqueHabit: null,
    };
  }
  const bio = generatePetBiography({
    petPublicId: seed,
    speciesSlug,
    speciesName: species.name,
    affinity: species.affinity,
    rarity,
    geneticsSeed: `mkt_${seed}`,
    temperament: species.temperament,
    eggType: "COMMON_RIFT",
    eggOriginSource: "STARTER_CLAIM",
    nativeRegion: species.habitat,
    generation: 1,
    favoriteFoodHint: species.food,
  });
  return {
    shortBio: lore.shortBio,
    personalBioPreview: bio.personalBio.slice(0, 220) + (bio.personalBio.length > 220 ? "…" : ""),
    originStory: bio.originStory,
    temperament: species.temperament,
    favoriteActivity: bio.favoriteActivity,
    uniqueHabit: bio.uniqueHabit,
  };
}

function feeDisclosure(kind: "EGG" | "PET" | "ITEM") {
  return {
    listingFeeSol: "0.002",
    saleFeeNote:
      kind === "ITEM"
        ? "Item sales use ~5% total fee (seller ~95%) when enabled."
        : "Pet/egg sales use 90% seller / 5% reserve / 3% holder / 1% ops / 1% events when sold.",
  };
}

function eggView(
  publicId: string,
  sourceKind: EggSourceKind,
  opts: {
    title: string;
    priceSol: string;
    generation: number;
    parents: { label: string; publicId?: string }[] | null;
    subfilter: string;
    sellerLabel: string;
  },
): MarketplaceListingView {
  const disc = eggListingDisclosure(sourceKind);
  return {
    publicId,
    kind: "EGG",
    category: "EGGS",
    subfilter: opts.subfilter,
    title: opts.title,
    sellerLabel: opts.sellerLabel,
    priceLamports: solToLamports(opts.priceSol).toString(),
    priceSol: opts.priceSol,
    currency: "DEMO_CREDITS",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 3600_000).toISOString(),
    expiresAt: new Date(Date.now() + LISTING_RULES.maxListingDurationDays * 86400_000).toISOString(),
    bundleMode: null,
    bundledItems: [],
    egg: {
      eggType: disc.eggType,
      sourceKind,
      generation: opts.generation,
      parents: opts.parents,
      possibleSpecies: disc.possibleSpecies,
      possibleAffinities: disc.possibleAffinities,
      possibleRarityRange: disc.possibleRarityRange,
      possibleCosmeticTraits: disc.possibleCosmeticTraits,
      hatchTimeHours: disc.hatchTimeHours,
      originalSource: disc.originalSource,
      ownershipHistory: [
        {
          ownerLabel: opts.sellerLabel,
          acquiredAt: new Date(Date.now() - 86400_000 * 3).toISOString(),
          method: sourceKind,
        },
      ],
      breedable: disc.breedable,
      holderRewardEligible: disc.holderRewardEligible,
      exactCreatureKnown: false,
    },
    pet: null,
    item: null,
    feeDisclosure: feeDisclosure("EGG"),
    demo: true,
  };
}

function petView(opts: {
  publicId: string;
  title: string;
  priceSol: string;
  subfilter: string;
  sellerLabel: string;
  bundleMode: "PET_ONLY" | "PET_PLUS_LOADOUT";
  bundledItems: { key: string; name: string; slot?: string }[];
  pet: NonNullable<MarketplaceListingView["pet"]>;
}): MarketplaceListingView {
  return {
    publicId: opts.publicId,
    kind: "PET",
    category: "PETS",
    subfilter: opts.subfilter,
    title: opts.title,
    sellerLabel: opts.sellerLabel,
    priceLamports: solToLamports(opts.priceSol).toString(),
    priceSol: opts.priceSol,
    currency: "DEMO_CREDITS",
    status: "ACTIVE",
    createdAt: new Date(Date.now() - 7200_000).toISOString(),
    expiresAt: new Date(Date.now() + LISTING_RULES.maxListingDurationDays * 86400_000).toISOString(),
    bundleMode: opts.bundleMode,
    bundledItems: opts.bundledItems,
    egg: null,
    pet: opts.pet,
    item: null,
    feeDisclosure: feeDisclosure("PET"),
    demo: true,
  };
}

export function getDemoMarketplaceListings(): MarketplaceListingView[] {
  return [
    eggView("egg_demo_seasonal_01", "OFFICIAL_SEASONAL", {
      title: "Seasonal Rift Egg · Gen 1",
      priceSol: "0.12",
      generation: 1,
      parents: null,
      subfilter: "seasonal",
      sellerLabel: "wallet…A3f9",
    }),
    eggView("egg_demo_bred_01", "BREEDING", {
      title: "Bred Egg · Gen 2",
      priceSol: "0.18",
      generation: 2,
      parents: [
        { label: "Cinder Cub", publicId: "pet_parent_a" },
        { label: "Mossprig", publicId: "pet_parent_b" },
      ],
      subfilter: "bred",
      sellerLabel: "wallet…B7c2",
    }),
    eggView("egg_demo_event_01", "COMMUNITY_EVENT", {
      title: "Community Event Egg",
      priceSol: "0.09",
      generation: 1,
      parents: null,
      subfilter: "event",
      sellerLabel: "wallet…C1d4",
    }),
    petView({
      publicId: "pet_demo_cinder_01",
      title: "Cinder Cub · Rare",
      priceSol: "0.45",
      subfilter: "battle-trained",
      sellerLabel: "wallet…D9e1",
      bundleMode: "PET_ONLY",
      bundledItems: [],
      pet: {
        rarity: "RARE",
        speciesSlug: "cindercub",
        speciesName: "Cindercub",
        affinity: "EMBER",
        geneticsSummary: "Warm-line Ember strain · disclosed trait bands only",
        cosmetics: ["ember-freckles", "ash-paw tips"],
        evolutionStage: "young",
        level: 12,
        abilities: ["Ember Swipe", "Heat Guard", "Spark Dash"],
        ultimate: null,
        battleRecord: { wins: 14, losses: 9 },
        breeding: { available: true, usesRemaining: 4 },
        permanentTraits: ["heat-tolerant"],
        seasonalOrigin: null,
        generation: 1,
        founderStatus: false,
        memories: ["First Arena win", "Cared through a storm"],
        achievements: ["Training Graduate"],
        hatchDate: new Date(Date.now() - 86400_000 * 40).toISOString(),
        ...lorePreviewForPet("cindercub", "RARE", "pet_demo_cinder_01"),
      },
    }),
    petView({
      publicId: "pet_demo_luminara_01",
      title: "Luminara · Epic + Loadout Bundle",
      priceSol: "1.25",
      subfilter: "collector",
      sellerLabel: "wallet…E2f8",
      bundleMode: "PET_PLUS_LOADOUT",
      bundledItems: [
        { key: "radiant-focus", name: "Radiant Focus", slot: "weapon" },
        { key: "halo-band", name: "Halo Band", slot: "head" },
      ],
      pet: {
        rarity: "EPIC",
        speciesSlug: "luminara",
        speciesName: "Luminara",
        affinity: "RADIANT",
        geneticsSummary: "Bright-line Radiant · Gen 1 founder cohort adjacent",
        cosmetics: ["soft-halo", "constellation freckles"],
        evolutionStage: "adult",
        level: 22,
        abilities: ["Light Pierce", "Aegis Glow", "Cleanse Pulse"],
        ultimate: "Solar Benediction",
        battleRecord: { wins: 31, losses: 12 },
        breeding: { available: true, usesRemaining: 2 },
        permanentTraits: ["radiant-aura"],
        seasonalOrigin: "Launch Glow",
        generation: 1,
        founderStatus: true,
        memories: ["Watched the first boss fall"],
        achievements: ["Founder Companion", "Ranked Scout"],
        hatchDate: new Date(Date.now() - 86400_000 * 90).toISOString(),
        ...lorePreviewForPet("luminara", "EPIC", "pet_demo_luminara_01"),
      },
    }),
    {
      publicId: "item_demo_ember_talons",
      kind: "ITEM",
      category: "EQUIPMENT",
      subfilter: "weapon",
      title: "Ember Talons",
      sellerLabel: "wallet…F4a0",
      priceLamports: solToLamports("0.03").toString(),
      priceSol: "0.03",
      currency: "DEMO_CREDITS",
      status: "ACTIVE",
      createdAt: new Date(Date.now() - 1800_000).toISOString(),
      expiresAt: new Date(Date.now() + LISTING_RULES.maxListingDurationDays * 86400_000).toISOString(),
      bundleMode: null,
      bundledItems: [],
      egg: null,
      pet: null,
      item: {
        key: "ember-talons",
        name: "Ember Talons",
        rarity: "UNCOMMON",
        category: "WEAPON",
      },
      feeDisclosure: feeDisclosure("ITEM"),
      demo: true,
    },
  ];
}

/** In-memory listing store for feature-flagged write shells. */
const runtimeListings = new Map<string, MarketplaceListingView>();
const cancelCooldowns = new Map<string, number>();
const purchaseRequestIds = new Set<string>();

export function listMarketplaceCatalog(filter?: {
  category?: string;
  subfilter?: string;
}): MarketplaceListingView[] {
  const base = [...getDemoMarketplaceListings(), ...runtimeListings.values()].filter(
    (l) => l.status === "ACTIVE",
  );
  return base.filter((l) => {
    if (filter?.category && filter.category !== "ALL" && l.category !== filter.category) {
      return false;
    }
    if (filter?.subfilter && l.subfilter !== filter.subfilter) return false;
    return true;
  });
}

export function getMarketplaceListing(publicId: string): MarketplaceListingView | null {
  return (
    runtimeListings.get(publicId) ??
    getDemoMarketplaceListings().find((l) => l.publicId === publicId) ??
    null
  );
}

export function countActiveListingsForSeller(sellerLabel: string): {
  petOrEgg: number;
  items: number;
} {
  const all = listMarketplaceCatalog();
  let petOrEgg = 0;
  let items = 0;
  for (const l of all) {
    if (l.sellerLabel !== sellerLabel) continue;
    if (l.kind === "ITEM") items += 1;
    else petOrEgg += 1;
  }
  return { petOrEgg, items };
}

export function addRuntimeListing(listing: MarketplaceListingView): void {
  runtimeListings.set(listing.publicId, listing);
}

export function cancelRuntimeListing(
  publicId: string,
  sellerLabel: string,
): { ok: true } | { ok: false; reason: string } {
  const listing = runtimeListings.get(publicId);
  if (!listing) {
    const demo = getDemoMarketplaceListings().find((l) => l.publicId === publicId);
    if (demo) return { ok: false, reason: "demo_listing_not_cancellable" };
    return { ok: false, reason: "not_found" };
  }
  if (listing.sellerLabel !== sellerLabel) {
    return { ok: false, reason: "not_seller" };
  }
  const key = `${sellerLabel}:${listing.kind}:${publicId}`;
  const until = cancelCooldowns.get(key);
  if (until && until > Date.now()) {
    return { ok: false, reason: "cancel_cooldown" };
  }
  listing.status = "CANCELLED";
  runtimeListings.set(publicId, listing);
  cancelCooldowns.set(key, Date.now() + LISTING_RULES.cancelCooldownHours * 3600_000);
  return { ok: true };
}

export function purchaseRuntimeListing(
  publicId: string,
  requestId: string,
): { ok: true; mode: "demo_credits" } | { ok: false; reason: string } {
  if (purchaseRequestIds.has(requestId)) {
    return { ok: false, reason: "duplicate_request_id" };
  }
  const listing = getMarketplaceListing(publicId);
  if (!listing || listing.status !== "ACTIVE") {
    return { ok: false, reason: "not_available" };
  }
  purchaseRequestIds.add(requestId);
  if (runtimeListings.has(publicId)) {
    const l = runtimeListings.get(publicId)!;
    l.status = "SOLD";
    runtimeListings.set(publicId, l);
  }
  return { ok: true, mode: "demo_credits" };
}

export function getDemoPriceHistory(publicId: string) {
  const listing = getMarketplaceListing(publicId);
  const ask = listing ? BigInt(listing.priceLamports) : solToLamports("0.45");
  const rarity = listing?.pet?.rarity ?? "RARE";
  const species = listing?.pet?.speciesSlug ?? "cindercub";
  const similar = [
    { priceLamports: solToLamports("0.38"), soldAt: "2026-07-10T12:00:00.000Z", rarity, speciesSlug: species },
    { priceLamports: solToLamports("0.52"), soldAt: "2026-07-12T18:00:00.000Z", rarity, speciesSlug: species },
    { priceLamports: solToLamports("0.41"), soldAt: "2026-07-14T09:30:00.000Z", rarity, speciesSlug: "bubbloon" },
    { priceLamports: solToLamports("0.60"), soldAt: "2026-07-15T21:00:00.000Z", rarity: "EPIC", speciesSlug: species },
  ];
  const speciesSales = similar.filter((s) => s.speciesSlug === species);
  const snap = buildPriceHistorySummary({
    askingPriceLamports: ask,
    lastSaleLamports: solToLamports("0.41"),
    similarRaritySales: similar.filter((s) => s.rarity === rarity),
    speciesSales,
    recentSales: similar,
    lowestListingLamports: solToLamports("0.35"),
    traitNotes: listing?.pet
      ? [
          `Ability set includes: ${listing.pet.abilities.slice(0, 3).join(", ")}`,
          listing.pet.ultimate ? `Ultimate: ${listing.pet.ultimate}` : "No ultimate unlocked",
        ]
      : ["Egg listings compare disclosed ranges and generation — not hatch outcomes."],
  });
  return serializePriceHistory(snap);
}

export function getDemoSupplyStats() {
  const kinds = Object.keys(EGG_SUPPLY_CATALOG) as EggSourceKind[];
  const demoCounters: Record<
    EggSourceKind,
    { releasedToday: number; releasedThisWeek: number; totalReleased: number }
  > = {
    STARTER: { releasedToday: 42, releasedThisWeek: 210, totalReleased: 210 },
    OFFICIAL_SEASONAL: { releasedToday: 8, releasedThisWeek: 28, totalReleased: 120 },
    STORY_ACHIEVEMENT: { releasedToday: 5, releasedThisWeek: 22, totalReleased: 80 },
    BREEDING: { releasedToday: 6, releasedThisWeek: 34, totalReleased: 90 },
    COMMUNITY_EVENT: { releasedToday: 3, releasedThisWeek: 15, totalReleased: 40 },
    LIMITED_COLLECTOR: { releasedToday: 1, releasedThisWeek: 4, totalReleased: 18 },
  };

  return kinds.map((kind) => {
    const def = EGG_SUPPLY_CATALOG[kind];
    const counters = demoCounters[kind];
    const remaining = computeRemainingSupply(def, counters);
    return {
      kind,
      displayName: def.displayName,
      accountBound: def.accountBound,
      sellable: def.sellable,
      maxTotalSupply: def.maxTotalSupply,
      maxReleasedPerDay: def.maxReleasedPerDay,
      maxReleasedPerWeek: def.maxReleasedPerWeek,
      maxPerWallet: def.maxPerWallet,
      ...counters,
      ...remaining,
      hatchTimerHours: def.hatchTimerHours,
      tradeCooldownHours: def.tradeCooldownHours,
      slowRelease: def.slowRelease,
    };
  });
}

export function formatDemoPrice(lamports: string): string {
  return lamportsToSolString(BigInt(lamports));
}
