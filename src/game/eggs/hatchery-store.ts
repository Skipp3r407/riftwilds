import { randomUUID } from "crypto";
import { pickRarityFromRoll } from "@/game/economy/hatch-odds";
import {
  applyCareAction,
  applyCareDecay,
  applyCareGameplayTuning,
  careScore,
  DEFAULT_CARE_STATS,
  derivePetCondition,
  displayCareStats,
  type CareAction,
  type CareStats,
  type PetCareCondition,
} from "@/game/creatures/care";
import {
  DEFAULT_CARE_PROGRESS,
  type PetCareProgress,
} from "@/game/creatures/care-catalog";
import { LAUNCH_SPECIES, getSpeciesBySlug, pickSpeciesForEgg } from "@/game/creatures/species-catalog";
import { careBonusFromTraits } from "@/game/creatures/rpg-types";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import {
  FREE_STARTER_POOL_CAP,
  PREMIUM_EGG_CREDITS_PRICE,
} from "@/lib/economy/egg-supply";
import { getCreditBalance } from "@/lib/credits/ledger";
import { spendEggPurchase } from "@/lib/credits/sinks";
import { generatePetBiography } from "@/lib/pets/backstory-generator";
import type { PetBiography } from "@/lib/pets/lore-types";
import { assertOwnership } from "@/lib/security/authorization";
import type { Rarity } from "@prisma/client";

export type EggTypeKey =
  | "COMMON_RIFT"
  | "EMBER"
  | "TIDE"
  | "GROVE"
  | "STORM"
  | "STONE"
  | "FROST"
  | "RADIANT"
  | "VOID"
  | "ALLOY"
  | "SPIRIT"
  | "CELESTIAL"
  | "SEASONAL"
  | "EVENT"
  | "FOUNDER";

export type HatcheryEgg = {
  publicId: string;
  ownerKey: string;
  eggType: EggTypeKey;
  rarityPoolHint: string;
  hatchStatus: "UNCLAIMED" | "INCUBATING" | "READY" | "HATCHED";
  incubationStartedAt: string | null;
  incubationEndsAt: string | null;
  hatchMs: number;
  geneticsSeed: string;
  traitSeed: string;
  cosmeticSeed: string;
  generation: number;
  createdAt: string;
  creationSource: "STARTER_CLAIM" | "BREEDING" | "EVENT" | "SHOP";
};

export type HatcheryPet = {
  publicId: string;
  ownerKey: string;
  name: string;
  speciesSlug: string;
  speciesName: string;
  affinity: string;
  rarity: Rarity;
  temperament: string;
  eggPublicId: string;
  care: CareStats;
  condition: PetCareCondition;
  lastDecayAt: string;
  createdAt: string;
  memories: { kind: string; label: string; at: string; narrative?: string }[];
  /** Deterministic personal biography — generated once at hatch, versioned thereafter. */
  biography: PetBiography | null;
  biographyVersion: number;
  /** Care XP, streaks, journal, inventory — Credits economy progress. */
  careProgress: PetCareProgress;
};

/**
 * Persist demo hatchery state on globalThis so Next/Turbopack route bundles
 * share one Map. Module-scoped Maps can fork per route chunk — claim writes
 * then eggs GET reads an empty store (the "Your eggs: 0" demo bug).
 */
type HatcheryMaps = {
  eggs: Map<string, HatcheryEgg>;
  pets: Map<string, HatcheryPet>;
  claimsByOwner: Map<string, number>;
  /** Global free starter releases (enforces free pool cap). */
  freeStarterReleased: number;
  /** Test-only cap override — null uses FREE_STARTER_POOL_CAP. */
  freePoolCapOverride: number | null;
};

const globalForHatchery = globalThis as unknown as {
  __riftwildsHatchery?: HatcheryMaps;
};

function hatcheryMaps(): HatcheryMaps {
  if (!globalForHatchery.__riftwildsHatchery) {
    globalForHatchery.__riftwildsHatchery = {
      eggs: new Map(),
      pets: new Map(),
      claimsByOwner: new Map(),
      freeStarterReleased: 0,
      freePoolCapOverride: null,
    };
  } else {
    const maps = globalForHatchery.__riftwildsHatchery;
    // HMR / older shape — keep existing Maps, add pool fields.
    if (typeof maps.freeStarterReleased !== "number") maps.freeStarterReleased = 0;
    if (!("freePoolCapOverride" in maps)) maps.freePoolCapOverride = null;
  }
  return globalForHatchery.__riftwildsHatchery;
}

function freePoolCap(): number {
  const override = hatcheryMaps().freePoolCapOverride;
  return override == null ? FREE_STARTER_POOL_CAP : override;
}

const eggs = hatcheryMaps().eggs;
const pets = hatcheryMaps().pets;
const claimsByOwner = hatcheryMaps().claimsByOwner;

const EGG_TYPE_LABELS: Record<EggTypeKey, string> = {
  COMMON_RIFT: "Common Rift Egg",
  EMBER: "Ember Egg",
  TIDE: "Tide Egg",
  GROVE: "Grove Egg",
  STORM: "Storm Egg",
  STONE: "Stone Egg",
  FROST: "Frost Egg",
  RADIANT: "Radiant Egg",
  VOID: "Void Egg",
  ALLOY: "Alloy Egg",
  SPIRIT: "Spirit Egg",
  CELESTIAL: "Celestial Egg",
  SEASONAL: "Seasonal Egg",
  EVENT: "Event Egg",
  FOUNDER: "Founder Egg",
};

function now() {
  return Date.now();
}

function refreshEggStatus(egg: HatcheryEgg): HatcheryEgg {
  if (egg.hatchStatus === "INCUBATING" && egg.incubationEndsAt) {
    if (now() >= new Date(egg.incubationEndsAt).getTime()) {
      egg.hatchStatus = "READY";
    }
  }
  return egg;
}

function refreshPetCare(pet: HatcheryPet): HatcheryPet {
  ensurePetCareProgress(pet);
  const elapsedMs = now() - new Date(pet.lastDecayAt).getTime();
  const hours = elapsedMs / (1000 * 60 * 60);
  if (hours > 0.01) {
    pet.care = applyCareDecay(pet.care, hours);
    pet.lastDecayAt = new Date().toISOString();
  }
  pet.condition = derivePetCondition(
    pet.care,
    isFeatureEnabled("PERMANENT_DEATH_ENABLED"),
  );
  return pet;
}

/** Ensure legacy in-memory pets get care progress scaffolding. */
export function ensurePetCareProgress(pet: HatcheryPet): PetCareProgress {
  if (!pet.careProgress) {
    pet.careProgress = {
      ...DEFAULT_CARE_PROGRESS,
      inventory: DEFAULT_CARE_PROGRESS.inventory.map((s) => ({ ...s })),
      journal: [],
      titles: [],
      badges: [],
      cosmetics: [],
      cooldowns: {},
    };
  }
  return pet.careProgress;
}

export function savePet(pet: HatcheryPet): void {
  pets.set(pet.publicId, pet);
}

export function eggTypeLabel(type: EggTypeKey): string {
  return EGG_TYPE_LABELS[type];
}

export type FreeStarterPoolStatus = {
  cap: number;
  released: number;
  remaining: number;
  exhausted: boolean;
};

export type HatcheryOfferStatus = FreeStarterPoolStatus & {
  canClaimFree: boolean;
  alreadyClaimedFree: boolean;
  canBuyPremium: boolean;
  premiumPriceCredits: number;
  creditBalance: number;
};

function ownerHasStarterClaim(ownerKey: string): boolean {
  // Hatched starters remain in the egg map with creationSource STARTER_CLAIM.
  return listEggsForOwner(ownerKey).some((e) => e.creationSource === "STARTER_CLAIM");
}

export function getFreeStarterPoolStatus(): FreeStarterPoolStatus {
  const released = hatcheryMaps().freeStarterReleased;
  const cap = freePoolCap();
  const remaining = Math.max(0, cap - released);
  return {
    cap,
    released,
    remaining,
    exhausted: remaining <= 0,
  };
}

/** Offer state for hatchery UI — free claim vs premium Credits buy. */
export function getHatcheryOfferStatus(ownerKey: string): HatcheryOfferStatus {
  const pool = getFreeStarterPoolStatus();
  const alreadyClaimedFree = ownerHasStarterClaim(ownerKey);
  const canClaimFree = !alreadyClaimedFree && !pool.exhausted;
  return {
    ...pool,
    canClaimFree,
    alreadyClaimedFree,
    canBuyPremium: !canClaimFree,
    premiumPriceCredits: PREMIUM_EGG_CREDITS_PRICE,
    creditBalance: getCreditBalance(ownerKey),
  };
}

function createIncubatingEgg(
  ownerKey: string,
  creationSource: HatcheryEgg["creationSource"],
): HatcheryEgg {
  const hatchMs = 30_000; // 30s demo incubation
  const started = new Date();
  const ends = new Date(started.getTime() + hatchMs);
  const publicId = `egg_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const egg: HatcheryEgg = {
    publicId,
    ownerKey,
    eggType: "COMMON_RIFT",
    rarityPoolHint: "Published hatchery odds",
    hatchStatus: "INCUBATING",
    incubationStartedAt: started.toISOString(),
    incubationEndsAt: ends.toISOString(),
    hatchMs,
    geneticsSeed: `gen_${randomUUID().replace(/-/g, "").slice(0, 10)}`,
    traitSeed: `trt_${randomUUID().replace(/-/g, "").slice(0, 10)}`,
    cosmeticSeed: `cos_${randomUUID().replace(/-/g, "").slice(0, 10)}`,
    generation: 0,
    createdAt: started.toISOString(),
    creationSource,
  };
  eggs.set(publicId, egg);
  return egg;
}

export function claimStarterEgg(ownerKey: string): HatcheryEgg {
  if (!isFeatureEnabled("EGG_SYSTEM_ENABLED") && !isFeatureEnabled("STARTER_EGG_CLAIMS_ENABLED")) {
    throw new Error("EGG_SYSTEM_DISABLED");
  }
  const count = claimsByOwner.get(ownerKey) ?? 0;
  if (count >= 1) {
    // Recover from forked in-memory instances where the claim counter
    // survived but the egg Map did not (pre-globalThis demos / HMR).
    const held = listEggsForOwner(ownerKey).some((e) => e.creationSource === "STARTER_CLAIM");
    if (held) throw new Error("STARTER_ALREADY_CLAIMED");
    claimsByOwner.set(ownerKey, 0);
  }

  const pool = getFreeStarterPoolStatus();
  if (pool.exhausted) {
    throw new Error("FREE_POOL_EXHAUSTED");
  }

  const egg = createIncubatingEgg(ownerKey, "STARTER_CLAIM");
  claimsByOwner.set(ownerKey, (claimsByOwner.get(ownerKey) ?? 0) + 1);
  hatcheryMaps().freeStarterReleased += 1;
  return egg;
}

export type PremiumEggPurchaseResult =
  | { ok: true; egg: HatcheryEgg; balance: number; priceCredits: number }
  | {
      ok: false;
      error:
        | "EGG_SYSTEM_DISABLED"
        | "FREE_CLAIM_STILL_AVAILABLE"
        | "insufficient_credits"
        | "invalid_amount"
        | "purchase_failed";
      message: string;
      balance?: number;
      priceCredits: number;
    };

/**
 * Buy a Common Rift Egg with Credits when free claim is unavailable.
 * Debits ledger first, then grants egg (creationSource SHOP). Never SOL.
 */
export function purchasePremiumEgg(
  ownerKey: string,
  opts?: { requestId?: string },
): PremiumEggPurchaseResult {
  const priceCredits = PREMIUM_EGG_CREDITS_PRICE;
  if (!isFeatureEnabled("EGG_SYSTEM_ENABLED") && !isFeatureEnabled("STARTER_EGG_CLAIMS_ENABLED")) {
    return {
      ok: false,
      error: "EGG_SYSTEM_DISABLED",
      message: "Egg system is disabled",
      priceCredits,
    };
  }

  const offer = getHatcheryOfferStatus(ownerKey);
  if (offer.canClaimFree) {
    return {
      ok: false,
      error: "FREE_CLAIM_STILL_AVAILABLE",
      message: "Claim your free starter egg before buying a premium egg",
      balance: offer.creditBalance,
      priceCredits,
    };
  }

  const requestId =
    opts?.requestId ?? `egg-purchase:${ownerKey}:${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const spend = spendEggPurchase({
    userId: ownerKey,
    amount: priceCredits,
    requestId,
  });
  if (!spend.ok) {
    return {
      ok: false,
      error: spend.error === "insufficient_credits" ? "insufficient_credits" : "purchase_failed",
      message: spend.message,
      balance: spend.balance ?? getCreditBalance(ownerKey),
      priceCredits,
    };
  }

  const egg = createIncubatingEgg(ownerKey, "SHOP");
  // Attach egg id on replay-safe metadata path — spend already committed.
  return {
    ok: true,
    egg,
    balance: spend.balance,
    priceCredits,
  };
}

/** Test helper — set free starter releases (does not wipe eggs). */
export function setFreeStarterReleasedForTests(released: number): void {
  hatcheryMaps().freeStarterReleased = Math.max(0, Math.floor(released));
}

/**
 * Test helper — override free pool cap (use a tiny cap so exhaustion tests
 * do not block concurrent suites that still claim free eggs).
 * Pass `null` to restore FREE_STARTER_POOL_CAP.
 */
export function setFreeStarterPoolCapForTests(cap: number | null): void {
  hatcheryMaps().freePoolCapOverride =
    cap == null ? null : Math.max(0, Math.floor(cap));
}

/** Test helper — wipe in-memory hatchery maps + free pool counter. */
export function resetHatcheryStoreForTests(): void {
  hatcheryMaps().eggs.clear();
  hatcheryMaps().pets.clear();
  hatcheryMaps().claimsByOwner.clear();
  hatcheryMaps().freeStarterReleased = 0;
  hatcheryMaps().freePoolCapOverride = null;
}

export function listEggsForOwner(ownerKey: string): HatcheryEgg[] {
  return [...eggs.values()]
    .filter((e) => e.ownerKey === ownerKey)
    .map(refreshEggStatus)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listPetsForOwner(ownerKey: string): HatcheryPet[] {
  return [...pets.values()]
    .filter((p) => p.ownerKey === ownerKey)
    .map(refreshPetCare)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getPet(publicId: string): HatcheryPet | undefined {
  const pet = pets.get(publicId);
  return pet ? refreshPetCare(pet) : undefined;
}

export function getEgg(publicId: string): HatcheryEgg | undefined {
  const egg = eggs.get(publicId);
  return egg ? refreshEggStatus(egg) : undefined;
}

export type HatchReveal = {
  pet: HatcheryPet;
  reveal: {
    species: string;
    speciesSlug: string;
    affinity: string;
    rarity: Rarity;
    temperament: string;
    geneticsSeed: string;
    startingStats: CareStats;
    evolutionPaths: string[];
    signatureAbility: { name: string; description: string } | null;
    signatureTrait: { name: string; description: string } | null;
  };
};

/** Demo-only: end incubation immediately so keepers can hatch without waiting. */
export function skipIncubationForDemo(ownerKey: string, eggPublicId: string): HatcheryEgg {
  const egg = getEgg(eggPublicId);
  if (!egg) throw new Error("EGG_NOT_FOUND");
  assertOwnership(egg.ownerKey, ownerKey);
  if (egg.hatchStatus === "HATCHED") throw new Error("ALREADY_HATCHED");
  if (egg.hatchStatus === "READY") return egg;
  egg.hatchStatus = "READY";
  egg.incubationEndsAt = new Date().toISOString();
  eggs.set(egg.publicId, egg);
  return egg;
}

export function hatchEgg(
  ownerKey: string,
  eggPublicId: string,
  opts?: { skipWait?: boolean },
): HatchReveal {
  if (!isFeatureEnabled("HATCHING_ENABLED")) throw new Error("HATCHING_DISABLED");
  if (opts?.skipWait) skipIncubationForDemo(ownerKey, eggPublicId);
  const egg = getEgg(eggPublicId);
  if (!egg) throw new Error("EGG_NOT_FOUND");
  assertOwnership(egg.ownerKey, ownerKey);
  refreshEggStatus(egg);
  if (egg.hatchStatus === "HATCHED") throw new Error("ALREADY_HATCHED");
  if (egg.hatchStatus !== "READY") throw new Error("NOT_READY");

  const roll = Number.parseInt(randomUUID().replace(/-/g, "").slice(0, 8), 16) % 10000;
  const rarity = pickRarityFromRoll(roll);
  const species = pickSpeciesForEgg(egg.eggType, rarity, egg.geneticsSeed);
  const petPublicId = `pet_${randomUUID().replace(/-/g, "").slice(0, 12)}`;
  const care = { ...DEFAULT_CARE_STATS };
  const hatchedAt = new Date().toISOString();
  const eggOriginSource =
    egg.creationSource === "BREEDING"
      ? "BREEDING"
      : egg.creationSource === "EVENT"
        ? "EVENT"
        : egg.creationSource === "SHOP"
          ? "SHOP"
          : "STARTER_CLAIM";

  let biography: PetBiography | null = null;
  if (isFeatureEnabled("PET_LORE_ENABLED")) {
    biography = generatePetBiography({
      petPublicId,
      speciesSlug: species.slug,
      speciesName: species.name,
      affinity: species.affinity,
      rarity,
      geneticsSeed: egg.geneticsSeed,
      temperament: species.temperament,
      eggType: egg.eggType,
      eggOriginSource,
      nativeRegion: species.habitat,
      hatchLocation: "Hatchery",
      hatchTimeIso: hatchedAt,
      generation: egg.generation,
      favoriteFoodHint: species.food,
      founderStatus: egg.eggType === "FOUNDER",
    });
  }

  const pet: HatcheryPet = {
    publicId: petPublicId,
    ownerKey,
    name: species.name,
    speciesSlug: species.slug,
    speciesName: species.name,
    affinity: species.affinity,
    rarity,
    temperament: species.temperament,
    eggPublicId: egg.publicId,
    care,
    condition: derivePetCondition(care, false),
    lastDecayAt: hatchedAt,
    createdAt: hatchedAt,
    memories: [
      {
        kind: "HATCH",
        label: "Hatched in the Hatchery",
        at: hatchedAt,
        narrative: biography?.firstMemory,
      },
      { kind: "FIRST_OWNER", label: "First keeper recorded", at: hatchedAt },
    ],
    biography,
    biographyVersion: biography?.version ?? 0,
    careProgress: {
      ...DEFAULT_CARE_PROGRESS,
      inventory: DEFAULT_CARE_PROGRESS.inventory.map((s) => ({ ...s })),
      journal: [],
      titles: [],
      badges: [],
      cosmetics: [],
      cooldowns: {},
    },
  };
  egg.hatchStatus = "HATCHED";
  eggs.set(egg.publicId, egg);
  pets.set(petPublicId, pet);

  const signatureAbility = species.abilities[0]
    ? { name: species.abilities[0].name, description: species.abilities[0].description }
    : null;
  const signatureTrait = species.traits[0]
    ? { name: species.traits[0].name, description: species.traits[0].description }
    : null;

  return {
    pet,
    reveal: {
      species: species.name,
      speciesSlug: species.slug,
      affinity: species.affinity,
      rarity,
      temperament: species.temperament,
      geneticsSeed: egg.geneticsSeed,
      startingStats: care,
      evolutionPaths: species.evolutionPaths,
      signatureAbility,
      signatureTrait,
    },
  };
}

/**
 * Low-level care apply (no Credits). Prefer `performCareAction` from care-service
 * for player-facing care so Credits debit through the ledger first.
 */
export function careForPet(
  ownerKey: string,
  petPublicId: string,
  action: CareAction,
): HatcheryPet {
  if (!isFeatureEnabled("PET_CARE_ENABLED") && !isFeatureEnabled("CARE_ENABLED")) {
    throw new Error("CARE_DISABLED");
  }
  const pet = getPet(petPublicId);
  if (!pet) throw new Error("PET_NOT_FOUND");
  assertOwnership(pet.ownerKey, ownerKey);
  ensurePetCareProgress(pet);
  const before = { ...pet.care };
  let next = applyCareAction(before, action);
  next = applyCareGameplayTuning(before, next, action);
  const species = getSpeciesBySlug(pet.speciesSlug);
  if (species) {
    const clamp = (n: number) => Math.min(100, Math.max(0, n));
    const bonus = { happiness: 0, bond: 0, energy: 0, health: 0 };
    if (
      action === "PLAY" ||
      action === "ENCOURAGE" ||
      action === "PET" ||
      action === "SOCIALIZE"
    ) {
      bonus.happiness = careBonusFromTraits(species.traits, "happiness");
      bonus.bond = careBonusFromTraits(species.traits, "bond");
    }
    if (action === "FEED" || action === "COOK_MEAL" || action === "TREAT") {
      bonus.bond = Math.max(bonus.bond, Math.floor(careBonusFromTraits(species.traits, "bond") / 2));
    }
    if (action === "REST" || action === "SLEEP") {
      bonus.energy = careBonusFromTraits(species.traits, "energy");
    }
    if (
      action === "HEAL" ||
      action === "MEDICINE" ||
      action === "VET" ||
      action === "RECOVERY_CENTER"
    ) {
      bonus.health = careBonusFromTraits(species.traits, "health");
    }
    next = {
      ...next,
      happiness: clamp(next.happiness + bonus.happiness),
      bond: clamp(next.bond + bonus.bond),
      energy: clamp(next.energy + bonus.energy),
      health: clamp(next.health + bonus.health),
    };
  }
  pet.care = next;
  pet.condition = derivePetCondition(
    pet.care,
    isFeatureEnabled("PERMANENT_DEATH_ENABLED"),
  );
  pet.lastDecayAt = new Date().toISOString();
  if (action === "FEED" && !pet.memories.some((m) => m.kind === "FIRST_MEAL")) {
    pet.memories.push({
      kind: "FIRST_MEAL",
      label: "First meal shared",
      at: new Date().toISOString(),
    });
  }
  pets.set(pet.publicId, pet);
  return pet;
}

export function petCareSummary(pet: HatcheryPet) {
  const progress = ensurePetCareProgress(pet);
  return {
    publicId: pet.publicId,
    name: pet.name,
    condition: pet.condition,
    careScore: careScore(pet.care),
    stats: displayCareStats(pet.care),
    careXp: progress.careXp,
    careLevel: progress.careLevel,
    careStreak: progress.careStreak,
    titles: progress.titles,
    badges: progress.badges,
    rewardEligibleHint:
      pet.condition === "HEALTHY" || pet.condition === "TIRED" || pet.condition === "UNHAPPY",
  };
}

export function speciesCount(): number {
  return LAUNCH_SPECIES.length;
}
