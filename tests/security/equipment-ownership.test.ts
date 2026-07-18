import { beforeEach, describe, expect, it } from "vitest";
import { claimStarterEgg, hatchEgg } from "@/game/eggs/hatchery-store";
import {
  __resetInventoryForTests,
  grantOwnedItem,
} from "@/lib/equipment/inventory-store";
import {
  __resetLoadoutsForTests,
  equipItem,
} from "@/lib/equipment/loadout-store";

/**
 * Security: equip APIs must never trust client ownership claims.
 * These pure-store tests mirror route handler validation.
 */
describe("equipment ownership security", () => {
  beforeEach(() => {
    __resetLoadoutsForTests();
  });

  it("forbids equipping on another owner's hatchery pet", () => {
    const ownerA = `owner_a_${Math.random().toString(16).slice(2)}`;
    const ownerB = `owner_b_${Math.random().toString(16).slice(2)}`;
    __resetInventoryForTests(ownerA);
    __resetInventoryForTests(ownerB);

    const egg = claimStarterEgg(ownerA);
    egg.hatchStatus = "READY";
    const { pet } = hatchEgg(ownerA, egg.publicId, { skipWait: true });

    grantOwnedItem(ownerB, "wooden-paw-guard", 1);
    const result = equipItem({
      ownerKey: ownerB,
      publicPetId: pet.publicId,
      itemId: "wooden-paw-guard",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("PET_NOT_OWNED");
  });

  it("forbids equipping items not on the server ledger even if catalog-valid", () => {
    const owner = `owner_ledger_${Math.random().toString(16).slice(2)}`;
    __resetInventoryForTests(owner);
    // Starter bag has wooden-paw-guard, not celestial weapons
    const result = equipItem({
      ownerKey: owner,
      publicPetId: "live-companion",
      itemId: "celestial-riftblade",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("NOT_OWNED");
  });

  it("rejects OTHER_PLAYER safety flag regardless of ownership", () => {
    const owner = `owner_safe_${Math.random().toString(16).slice(2)}`;
    __resetInventoryForTests(owner);
    const result = equipItem({
      ownerKey: owner,
      publicPetId: "live-companion",
      itemId: "wooden-paw-guard",
      safety: { otherPlayer: true, actorIsOwner: false },
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("OTHER_PLAYER");
  });
});
