/**
 * Deterministic pet factory for tests and simulations.
 * Seeds map 1:1 onto LAUNCH_SPECIES so every species is exercisable.
 */

import { randomUUID } from "crypto";
import {
  DEFAULT_CARE_STATS,
  derivePetCondition,
  type CareStats,
  type PetCareCondition,
} from "@/game/creatures/care";
import { DEFAULT_CARE_PROGRESS } from "@/game/creatures/care-catalog";
import { LAUNCH_SPECIES, getSpeciesBySlug, type SpeciesDef } from "@/game/creatures/species-catalog";
import type { HatcheryPet } from "@/game/eggs/hatchery-store";
import { generatePetBiography } from "@/lib/pets/backstory-generator";
import type { Rarity } from "@prisma/client";

export type FactoryPetOptions = {
  /** Stable seed — same seed + speciesSlug yields the same publicId suffix. */
  seed?: string;
  ownerKey?: string;
  speciesSlug?: string;
  rarity?: Rarity;
  care?: Partial<CareStats>;
  name?: string;
  eggPublicId?: string;
  createdAt?: string;
  permanentDeathEnabled?: boolean;
};

export type FactoryPet = HatcheryPet & {
  species: SpeciesDef;
  portraitPath: string;
};

function hashSeed(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function idFromSeed(prefix: string, seed: string): string {
  const h = hashSeed(seed).toString(16).padStart(8, "0");
  return `${prefix}_${h}${seed.replace(/[^a-z0-9]/gi, "").slice(0, 4)}`;
}

const RARITIES: Rarity[] = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY", "MYTHIC"];

export function allLaunchSpecies(): SpeciesDef[] {
  return [...LAUNCH_SPECIES];
}

export function speciesIndex(slug: string): number {
  const idx = LAUNCH_SPECIES.findIndex((s) => s.slug === slug);
  if (idx < 0) throw new Error(`Unknown species slug: ${slug}`);
  return idx;
}

/** One deterministic pet per launch species (seeded by slug). */
export function createPetForEverySpecies(
  opts: Omit<FactoryPetOptions, "speciesSlug"> = {},
): FactoryPet[] {
  return LAUNCH_SPECIES.map((sp) =>
    createPet({
      ...opts,
      speciesSlug: sp.slug,
      seed: opts.seed ? `${opts.seed}:${sp.slug}` : `factory:${sp.slug}`,
    }),
  );
}

export function createPet(opts: FactoryPetOptions = {}): FactoryPet {
  const seed = opts.seed ?? `pet_${randomUUID().slice(0, 8)}`;
  const species =
    (opts.speciesSlug ? getSpeciesBySlug(opts.speciesSlug) : undefined) ??
    LAUNCH_SPECIES[hashSeed(seed) % LAUNCH_SPECIES.length]!;

  const care: CareStats = { ...DEFAULT_CARE_STATS, ...opts.care };
  const condition: PetCareCondition = derivePetCondition(
    care,
    opts.permanentDeathEnabled ?? false,
  );
  const rarity =
    opts.rarity ??
    (RARITIES.includes(species.rarityBias as Rarity)
      ? (species.rarityBias as Rarity)
      : "COMMON");

  const publicId = idFromSeed("pet", `${seed}:${species.slug}`);
  const createdAt = opts.createdAt ?? new Date("2026-01-01T00:00:00.000Z").toISOString();
  const biography = generatePetBiography({
    petPublicId: publicId,
    speciesSlug: species.slug,
    speciesName: species.name,
    affinity: species.affinity,
    rarity,
    geneticsSeed: `gen_${seed}`,
    temperament: species.temperament,
    eggType: "COMMON_RIFT",
    eggOriginSource: "STARTER_CLAIM",
    nativeRegion: species.habitat,
    hatchTimeIso: createdAt,
    generation: 0,
    favoriteFoodHint: species.food,
  });

  const pet: HatcheryPet = {
    publicId,
    ownerKey: opts.ownerKey ?? `owner_${hashSeed(seed).toString(16)}`,
    name: opts.name ?? species.name,
    speciesSlug: species.slug,
    speciesName: species.name,
    affinity: species.affinity,
    rarity,
    temperament: species.temperament,
    eggPublicId: opts.eggPublicId ?? idFromSeed("egg", `${seed}:egg`),
    care,
    condition,
    lastDecayAt: createdAt,
    createdAt,
    memories: [
      {
        kind: "FACTORY",
        label: "Created by pet factory",
        at: createdAt,
        narrative: biography.firstMemory,
      },
    ],
    biography,
    biographyVersion: biography.version,
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

  return {
    ...pet,
    species,
    portraitPath: `/assets/pets/${species.slug}.png`,
  };
}

/** Deterministic pair for breeding / matchup tests. */
export function createPetPair(
  slugA: string,
  slugB: string,
  seed = "pair",
): [FactoryPet, FactoryPet] {
  return [
    createPet({ speciesSlug: slugA, seed: `${seed}:a`, ownerKey: "owner_a" }),
    createPet({ speciesSlug: slugB, seed: `${seed}:b`, ownerKey: "owner_b" }),
  ];
}
