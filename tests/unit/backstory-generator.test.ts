import { describe, expect, it } from "vitest";
import { generatePetBiography } from "@/lib/pets/backstory-generator";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";

describe("backstory generator", () => {
  const sample = LAUNCH_SPECIES[0]!;

  const base = {
    petPublicId: "pet_test_01",
    speciesSlug: sample.slug,
    speciesName: sample.name,
    affinity: sample.affinity,
    rarity: "COMMON",
    geneticsSeed: "gen_test_stable",
    temperament: sample.temperament,
    eggType: "COMMON_RIFT",
    nativeRegion: sample.habitat,
    generation: 0,
    favoriteFoodHint: sample.food,
  } as const;

  it("is deterministic for the same seed inputs", () => {
    const a = generatePetBiography({ ...base, eggOriginSource: "STARTER_CLAIM" });
    const b = generatePetBiography({ ...base, eggOriginSource: "STARTER_CLAIM" });
    expect(a.personalBio).toBe(b.personalBio);
    expect(a.originStory).toBe(b.originStory);
    expect(a.generationSeed).toBe(b.generationSeed);
  });

  it("does not invent wild discovery language for bred pets", () => {
    const bio = generatePetBiography({
      ...base,
      eggOriginSource: "BREEDING",
      parentLabels: ["Ashwing Parent", "Cindercub Parent"],
      generation: 2,
    });
    expect(bio.familyHistory).toBeTruthy();
    expect(bio.originStory.toLowerCase()).toMatch(/breed|parent|hatchery|homestead/);
    expect(bio.originStory.toLowerCase()).not.toMatch(/washed ashore|discovered near an unstable/);
  });

  it("includes personal quest hooks as data fields", () => {
    const bio = generatePetBiography({ ...base, eggOriginSource: "STARTER_CLAIM" });
    expect(bio.personalQuestHooks.length).toBeGreaterThanOrEqual(3);
    expect(bio.mysteryClue.length).toBeGreaterThan(10);
  });
});
