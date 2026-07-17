/**
 * Pet lore & biography types for Riftwilds (original IP).
 * Content is authored in src/content/pets; biographies are generated deterministically at hatch.
 */

import { z } from "zod";

export const BIOGRAPHY_GENERATOR_VERSION = 1;

export const LoreStatusSchema = z.enum([
  "DRAFT",
  "COMPLETE",
  "REVIEWED",
  "LOCKED",
]);
export type LoreStatus = z.infer<typeof LoreStatusSchema>;

export const SpeciesLoreSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  pluralName: z.string().min(1),
  pronunciation: z.string().min(1),
  title: z.string().min(1),
  shortBio: z.string().min(40),
  standardBio: z.string().min(120),
  fullLore: z.string().min(300),
  origin: z.string().min(20),
  ancientHistory: z.string().min(20),
  modernHistory: z.string().min(20),
  nativeRegion: z.string().min(1),
  secondaryHabitats: z.array(z.string()).default([]),
  affinity: z.string().min(1),
  secondaryAffinities: z.array(z.string()).default([]),
  naturalBehavior: z.string().min(20),
  socialBehavior: z.string().min(10),
  intelligenceLevel: z.string().min(1),
  communicationStyle: z.string().min(1),
  diet: z.string().min(1),
  favoriteFoods: z.array(z.string()).min(1),
  foodsDisliked: z.array(z.string()).default([]),
  sleepingHabits: z.string().min(1),
  activityCycle: z.string().min(1),
  weatherPreference: z.string().min(1),
  environmentalRole: z.string().min(10),
  naturalPredators: z.array(z.string()).default([]),
  naturalAllies: z.array(z.string()).default([]),
  rivalSpecies: z.array(z.string()).default([]),
  relationshipWithRiftkeepers: z.string().min(10),
  culturalImportance: z.string().min(10),
  ancientLegend: z.string().min(20),
  commonMisunderstanding: z.string().min(10),
  hiddenTruth: z.string().min(10),
  conservationStatus: z.string().min(1),
  typicalLifespan: z.string().min(1),
  typicalSize: z.string().min(1),
  movementStyle: z.string().min(1),
  signatureSound: z.string().min(1),
  signatureScent: z.string().optional(),
  commonPersonalityTendencies: z.array(z.string()).min(1),
  rarePersonalityTendencies: z.array(z.string()).default([]),
  naturalTalents: z.array(z.string()).min(1),
  naturalWeaknesses: z.array(z.string()).min(1),
  explorationAbilities: z.array(z.string()).default([]),
  battleTendencies: z.string().min(1),
  evolutionPhilosophy: z.string().min(10),
  breedingBehavior: z.string().min(10),
  eggAppearance: z.string().min(10),
  hatchBehavior: z.string().min(10),
  youngStageBehavior: z.string().min(10),
  adultStageBehavior: z.string().min(10),
  evolvedStageBehavior: z.string().min(10),
  liveWorldHabits: z.string().min(10),
  marketplaceCollectorNote: z.string().min(10),
  storyHooks: z.array(z.string()).default([]),
  regionQuestHooks: z.array(z.string()).default([]),
  petQuestPossibilities: z.array(z.string()).default([]),
  historicalTimeline: z
    .array(
      z.object({
        era: z.string(),
        event: z.string(),
      }),
    )
    .default([]),
  myths: z.array(z.string()).default([]),
  spoilerHiddenTruth: z.boolean().default(true),
  status: LoreStatusSchema.default("COMPLETE"),
  version: z.number().int().positive().default(1),
});

export type SpeciesLore = z.infer<typeof SpeciesLoreSchema>;

export const PetBiographySchema = z.object({
  version: z.number().int().positive(),
  generatorVersion: z.number().int().positive(),
  title: z.string(),
  personalBio: z.string(),
  originStory: z.string(),
  firstMemory: z.string(),
  temperamentSummary: z.string(),
  favoriteFood: z.string(),
  favoriteActivity: z.string(),
  favoriteRegion: z.string(),
  favoriteWeather: z.string(),
  preferredSleepLocation: z.string(),
  favoriteToy: z.string(),
  greatestFear: z.string(),
  strongestInstinct: z.string(),
  socialStyle: z.string(),
  bondStyle: z.string(),
  uniqueHabit: z.string(),
  hiddenTalent: z.string(),
  personalDream: z.string(),
  motto: z.string(),
  signatureBehavior: z.string(),
  mysteryClue: z.string(),
  questHook: z.string(),
  emotionalNeed: z.string(),
  comfortAction: z.string(),
  dislikedEnvironment: z.string(),
  friendshipPreference: z.string(),
  rivalryTendency: z.string(),
  reactionToDanger: z.string(),
  reactionToStrangers: z.string(),
  reactionToOtherPets: z.string(),
  reactionToOwner: z.string(),
  reactionToVictory: z.string(),
  reactionToDefeat: z.string(),
  eggOriginId: z.string(),
  firstMemoryId: z.string(),
  bondStage: z.enum([
    "NEWLY_BONDED",
    "FAMILIAR",
    "TRUSTED",
    "CLOSE_COMPANION",
    "DEEPLY_BONDED",
    "LIFELONG_PARTNER",
  ]),
  familyHistory: z.string().nullable(),
  personalQuestHooks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      summary: z.string(),
      category: z.string(),
    }),
  ),
  generationSeed: z.string(),
  generatedAt: z.string(),
  locked: z.boolean(),
});

export type PetBiography = z.infer<typeof PetBiographySchema>;

export type BackstoryGenerationInput = {
  petPublicId: string;
  speciesSlug: string;
  speciesName: string;
  affinity: string;
  secondaryAffinity?: string | null;
  rarity: string;
  geneticsSeed: string;
  temperament: string;
  eggType: string;
  eggOriginSource:
    | "STARTER_CLAIM"
    | "BREEDING"
    | "EVENT"
    | "SHOP"
    | "WILD_FIND"
    | "BOSS"
    | "SEASONAL";
  nativeRegion: string;
  hatchLocation?: string;
  hatchTimeIso?: string;
  generation: number;
  parentIds?: string[] | null;
  parentLabels?: string[] | null;
  mutationTraits?: string[];
  cosmeticTraits?: string[];
  seasonalOrigin?: string | null;
  eventOrigin?: string | null;
  founderStatus?: boolean;
  favoriteFoodHint?: string;
};

export type StoryTemplate = {
  id: string;
  text: string;
  compatibleRegions?: string[];
  compatibleAffinities?: string[];
  compatibleTemperaments?: string[];
  incompatibleSources?: string[];
  minimumRarity?: string;
  tags?: string[];
};

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}
