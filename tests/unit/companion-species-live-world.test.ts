import { describe, expect, it } from "vitest";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import {
  COZY_COMPANION_ACTORS,
  companionPetLabel,
  cozyActorForSpecies,
  DEFAULT_COZY_COMPANION,
  pickLoadedCompanionTex,
  resolveCompanionTexture,
} from "@/game/live-world/systems/premium/companion-species";

describe("Live World companion species → cozy texture", () => {
  it("maps common hatch-flow species to distinct cozy actors", () => {
    expect(cozyActorForSpecies("cindercub")).toBe("riftling-emberpup");
    expect(cozyActorForSpecies("mossprig")).toBe("riftling-mossbun");
    expect(cozyActorForSpecies("bubbloon")).toBe("riftling-tideling");
    expect(cozyActorForSpecies("frostnip")).toBe("riftling-frostnip");
    expect(cozyActorForSpecies("gearling")).toBe("riftling-alloybit");
    expect(cozyActorForSpecies("cogpup")).toBe("riftling-alloybit");
    expect(cozyActorForSpecies("voidling")).toBe("riftling-voidling");
    expect(cozyActorForSpecies("luminara")).toBe("riftling-radiantpup");
    expect(cozyActorForSpecies("voltkit")).toBe("riftling-stormkit");
    expect(cozyActorForSpecies("riftpup")).toBe("riftling-sparklet");
    expect(cozyActorForSpecies("commonspark")).toBe("riftling-sparklet");
    expect(cozyActorForSpecies("pebblit")).toBe("riftling-stoneling");
    expect(cozyActorForSpecies("wisplet")).toBe("riftling-spiritwisp");
  });

  it("does not default unknown species to alloybit", () => {
    expect(cozyActorForSpecies(undefined)).toBe(DEFAULT_COZY_COMPANION);
    expect(cozyActorForSpecies("not-a-real-species")).toBe(DEFAULT_COZY_COMPANION);
    expect(DEFAULT_COZY_COMPANION).toBe("riftling-sparklet");
    expect(DEFAULT_COZY_COMPANION).not.toBe("riftling-alloybit");
  });

  it("covers every launch species affinity with a cozy actor", () => {
    for (const sp of LAUNCH_SPECIES) {
      const actor = cozyActorForSpecies(sp.slug);
      expect(COZY_COMPANION_ACTORS).toContain(actor);
    }
  });

  it("resolves texture keys that selected pet species drives", () => {
    const glow = resolveCompanionTexture("commonspark");
    const alloy = resolveCompanionTexture("gearling");
    expect(glow.sheetTex).toBe("pw-actor-riftling-sparklet-sheet");
    expect(alloy.sheetTex).toBe("pw-actor-riftling-alloybit-sheet");
    expect(glow.sheetTex).not.toBe(alloy.sheetTex);
    expect(glow.walkAnim).not.toBe(alloy.walkAnim);
  });

  it("pickLoadedCompanionTex prefers species sheet over generic pet-riftling", () => {
    const choice = resolveCompanionTexture("cindercub");
    const loaded = new Set([
      "pw-actor-riftling-emberpup-sheet",
      "pw-actor-pet-riftling-sheet",
      "pet-companion",
    ]);
    expect(pickLoadedCompanionTex((k) => loaded.has(k), choice)).toBe(
      "pw-actor-riftling-emberpup-sheet",
    );
  });

  it("labels companion from hatch species, not Spark stub", () => {
    expect(companionPetLabel("gearling")).toBe("Gearling Companion");
    expect(companionPetLabel("cindercub")).toBe("Cindercub Companion");
    expect(companionPetLabel(null)).toBe("Companion");
  });

  it("keeps ambient actor ids out of companion texture keys", () => {
    for (const actor of COZY_COMPANION_ACTORS) {
      const choice = resolveCompanionTexture(
        actor === "riftling-emberpup" ? "cindercub" : "riftpup",
      );
      expect(choice.sheetTex.startsWith("pw-actor-")).toBe(true);
      expect(choice.sheetTex.includes("ambient")).toBe(false);
      expect(choice.staticTex.includes("ambient")).toBe(false);
    }
  });
});
