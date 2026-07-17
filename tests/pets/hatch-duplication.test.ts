import { describe, expect, it } from "vitest";
import { claimStarterEgg, hatchEgg } from "@/game/eggs/hatchery-store";

describe("hatching duplication safety", () => {
  it("rejects a second hatch of the same egg", () => {
    const owner = `owner_hatch_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const egg = claimStarterEgg(owner);
    egg.hatchStatus = "READY";

    const first = hatchEgg(owner, egg.publicId);
    expect(first.pet.eggPublicId).toBe(egg.publicId);

    expect(() => hatchEgg(owner, egg.publicId)).toThrow(/ALREADY_HATCHED/);
  });

  it("rejects hatch when not ready", () => {
    const owner = `owner_notready_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const egg = claimStarterEgg(owner);
    egg.hatchStatus = "INCUBATING";
    expect(() => hatchEgg(owner, egg.publicId)).toThrow(/NOT_READY/);
  });

  it("rejects starter claim duplication per owner", () => {
    const owner = `owner_claim_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    claimStarterEgg(owner);
    expect(() => claimStarterEgg(owner)).toThrow(/STARTER_ALREADY_CLAIMED/);
  });

  it("rejects hatch by non-owner", () => {
    const owner = `owner_own_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    const egg = claimStarterEgg(owner);
    egg.hatchStatus = "READY";
    expect(() => hatchEgg("intruder", egg.publicId)).toThrow();
  });
});
