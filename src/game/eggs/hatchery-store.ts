import { randomUUID } from "crypto";
import { pickRarityFromRoll } from "@/game/economy/hatch-odds";
import {
  applyCareAction,
  applyCareDecay,
  careScore,
  DEFAULT_CARE_STATS,
  derivePetCondition,
  type CareAction,
  type CareStats,
  type PetCareCondition,
} from "@/game/creatures/care";
import { LAUNCH_SPECIES, getSpeciesBySlug, pickSpeciesForEgg } from "@/game/creatures/species-catalog";
import { careBonusFromTraits } from "@/game/creatures/rpg-types";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
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
    };
  }
  return globalForHatchery.__riftwildsHatchery;
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

export function eggTypeLabel(type: EggTypeKey): string {
  return EGG_TYPE_LABELS[type];
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
    creationSource: "STARTER_CLAIM",
  };
  eggs.set(publicId, egg);
  claimsByOwner.set(ownerKey, count + 1);
  return egg;
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
  pet.care = applyCareAction(pet.care, action);
  const species = getSpeciesBySlug(pet.speciesSlug);
  if (species) {
    const clamp = (n: number) => Math.min(100, Math.max(0, n));
    const bonus = { happiness: 0, bond: 0, energy: 0, health: 0 };
    if (action === "PLAY" || action === "ENCOURAGE") {
      bonus.happiness = careBonusFromTraits(species.traits, "happiness");
      bonus.bond = careBonusFromTraits(species.traits, "bond");
    }
    if (action === "FEED") {
      bonus.bond = Math.max(bonus.bond, Math.floor(careBonusFromTraits(species.traits, "bond") / 2));
    }
    if (action === "REST") {
      bonus.energy = careBonusFromTraits(species.traits, "energy");
    }
    if (action === "HEAL" || action === "MEDICINE" || action === "RECOVERY_CENTER") {
      bonus.health = careBonusFromTraits(species.traits, "health");
    }
    pet.care = {
      ...pet.care,
      happiness: clamp(pet.care.happiness + bonus.happiness),
      bond: clamp(pet.care.bond + bonus.bond),
      energy: clamp(pet.care.energy + bonus.energy),
      health: clamp(pet.care.health + bonus.health),
    };
  }
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
  return {
    publicId: pet.publicId,
    name: pet.name,
    condition: pet.condition,
    careScore: careScore(pet.care),
    stats: pet.care,
    rewardEligibleHint:
      pet.condition === "HEALTHY" || pet.condition === "TIRED" || pet.condition === "UNHAPPY",
  };
}

export function speciesCount(): number {
  return LAUNCH_SPECIES.length;
}
