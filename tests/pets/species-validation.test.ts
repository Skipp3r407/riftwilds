import { describe, expect, it } from "vitest";
import { existsSync } from "fs";
import path from "path";
import {
  LAUNCH_SPECIES,
  assertLaunchKitsComplete,
  getSpeciesBySlug,
  pickSpeciesForEgg,
} from "@/game/creatures/species-catalog";
import { creaturePortraitPath } from "@/lib/assets/paths";
import {
  allLaunchSpecies,
  createPet,
  createPetForEverySpecies,
  createPetPair,
} from "../factories/pet-factory";

const ROOT = path.resolve(__dirname, "../..");

describe("LAUNCH_SPECIES catalog", () => {
  it("ships exactly 50 unique slugs", () => {
    expect(LAUNCH_SPECIES).toHaveLength(50);
    const slugs = LAUNCH_SPECIES.map((s) => s.slug);
    expect(new Set(slugs).size).toBe(50);
  });

  it("has complete RPG kits", () => {
    expect(assertLaunchKitsComplete()).toBe(true);
  });

  it("resolves every slug and portrait path pattern", () => {
    for (const sp of LAUNCH_SPECIES) {
      expect(getSpeciesBySlug(sp.slug)?.name).toBe(sp.name);
      expect(creaturePortraitPath(sp.slug)).toBe(`/assets/pets/${sp.slug}.png`);
    }
  });

  it("has portrait PNGs on disk for every launch species", () => {
    const missing = LAUNCH_SPECIES.filter((sp) => {
      const disk = path.join(ROOT, "public", "assets", "pets", `${sp.slug}.png`);
      return !existsSync(disk);
    }).map((s) => s.slug);
    expect(missing).toEqual([]);
  });

  it("pickSpeciesForEgg is deterministic for a seed", () => {
    const a = pickSpeciesForEgg("EMBER", "COMMON", "seed-fixed-1");
    const b = pickSpeciesForEgg("EMBER", "COMMON", "seed-fixed-1");
    expect(a.slug).toBe(b.slug);
    expect(a.affinity).toBe("EMBER");
  });
});

describe("pet factory", () => {
  it("creates one pet per launch species deterministically", () => {
    const a = createPetForEverySpecies({ seed: "batch" });
    const b = createPetForEverySpecies({ seed: "batch" });
    expect(a).toHaveLength(allLaunchSpecies().length);
    expect(a.map((p) => p.publicId)).toEqual(b.map((p) => p.publicId));
    expect(new Set(a.map((p) => p.speciesSlug)).size).toBe(50);
  });

  it("creates pairs for matchup tests", () => {
    const [p1, p2] = createPetPair("cindercub", "frostnip", "duel");
    expect(p1.speciesSlug).toBe("cindercub");
    expect(p2.speciesSlug).toBe("frostnip");
    expect(p1.portraitPath).toBe("/assets/pets/cindercub.png");
  });

  it("applies care overrides", () => {
    const pet = createPet({
      speciesSlug: "mossprig",
      seed: "care",
      care: { hunger: 10, bond: 90 },
    });
    expect(pet.care.hunger).toBe(10);
    expect(pet.care.bond).toBe(90);
  });
});
