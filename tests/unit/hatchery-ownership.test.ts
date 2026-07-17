import { describe, expect, it } from "vitest";
import {
  claimStarterEgg,
  careForPet,
  hatchEgg,
  listEggsForOwner,
  listPetsForOwner,
} from "@/game/eggs/hatchery-store";
import { LAUNCH_SPECIES } from "@/game/creatures/species-catalog";
import { assertOwnership } from "@/lib/security/authorization";

describe("hatchery ownership + hatch", () => {
  it("defines at least 50 launch species", () => {
    expect(LAUNCH_SPECIES.length).toBeGreaterThanOrEqual(50);
  });

  it("enforces ownership via assertOwnership", () => {
    expect(() => assertOwnership("user_a", "user_a")).not.toThrow();
    expect(() => assertOwnership("user_a", "user_b")).toThrow("FORBIDDEN");
  });

  it("claims one starter egg per owner and blocks duplicates", () => {
    const owner = `owner_${Math.random().toString(16).slice(2)}`;
    const egg = claimStarterEgg(owner);
    expect(egg.hatchStatus).toBe("INCUBATING");
    expect(listEggsForOwner(owner)).toHaveLength(1);
    expect(() => claimStarterEgg(owner)).toThrow("STARTER_ALREADY_CLAIMED");
  });

  it("hatches only when ready and stores pet under owner", () => {
    const owner = `owner_${Math.random().toString(16).slice(2)}`;
    const egg = claimStarterEgg(owner);
    egg.hatchStatus = "READY";
    egg.incubationEndsAt = new Date(Date.now() - 1000).toISOString();
    const { pet, reveal } = hatchEgg(owner, egg.publicId);
    expect(pet.ownerKey).toBe(owner);
    expect(reveal.species).toBeTruthy();
    expect(reveal.rarity).toBeTruthy();
    expect(pet.biography).toBeTruthy();
    expect(pet.biography?.originStory.length).toBeGreaterThan(20);
    expect(pet.biographyVersion).toBeGreaterThanOrEqual(1);
    expect(() => hatchEgg("other", egg.publicId)).toThrow();
  });

  it("demo claim → list → hatch path keeps egg and riftling for owner", () => {
    const owner = `owner_demo_${Math.random().toString(16).slice(2)}`;
    const egg = claimStarterEgg(owner);
    expect(listEggsForOwner(owner).map((e) => e.publicId)).toContain(egg.publicId);

    const shared = (
      globalThis as unknown as {
        __riftwildsHatchery?: { eggs: Map<string, { ownerKey: string }> };
      }
    ).__riftwildsHatchery;
    expect(shared?.eggs.get(egg.publicId)?.ownerKey).toBe(owner);

    const { pet, reveal } = hatchEgg(owner, egg.publicId, { skipWait: true });
    expect(reveal.species).toBeTruthy();
    expect(listPetsForOwner(owner).some((p) => p.publicId === pet.publicId)).toBe(true);
    expect(pet.biography?.originStory.length ?? 0).toBeGreaterThan(20);
  });

  it("care actions require ownership", () => {
    const owner = `owner_${Math.random().toString(16).slice(2)}`;
    const egg = claimStarterEgg(owner);
    egg.hatchStatus = "READY";
    const { pet } = hatchEgg(owner, egg.publicId);
    const cared = careForPet(owner, pet.publicId, "FEED");
    expect(cared.care.hunger).toBeGreaterThan(pet.care.hunger - 1);
    expect(() => careForPet("intruder", pet.publicId, "FEED")).toThrow("FORBIDDEN");
  });
});
