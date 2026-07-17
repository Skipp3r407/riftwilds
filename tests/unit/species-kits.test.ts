import { describe, expect, it } from "vitest";
import {
  assertLaunchKitsComplete,
  LAUNCH_SPECIES,
  getSpeciesBySlug,
} from "@/game/creatures/species-catalog";
import { SPECIES_KITS } from "@/game/creatures/species-kits";
import { abilitiesForSpecies } from "@/game/arena/abilities";
import { buildCombatant } from "@/game/arena/combatants";

describe("species RPG kits", () => {
  it("covers all 50 launch species with abilities and traits", () => {
    expect(LAUNCH_SPECIES).toHaveLength(50);
    expect(Object.keys(SPECIES_KITS)).toHaveLength(50);
    expect(assertLaunchKitsComplete()).toBe(true);
  });

  it("gives each species a distinct signature ability id", () => {
    const ids = LAUNCH_SPECIES.flatMap((sp) => sp.abilities.map((a) => a.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("wires Cindercub kit into arena combatants", () => {
    const cub = getSpeciesBySlug("cindercub");
    expect(cub?.abilities.some((a) => a.id === "spark-claw")).toBe(true);
    const abilities = abilitiesForSpecies("cindercub", "EMBER");
    expect(abilities?.some((a) => a.id === "spark-claw")).toBe(true);
    const combatant = buildCombatant({
      id: "t1",
      name: "Cub",
      speciesSlug: "cindercub",
      affinity: "EMBER",
      level: 5,
    });
    expect(combatant.abilities.some((a) => a.name === "Spark Claw")).toBe(true);
    expect(combatant.attack).toBeGreaterThan(30);
  });
});
