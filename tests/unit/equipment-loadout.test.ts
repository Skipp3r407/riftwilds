import { beforeEach, describe, expect, it } from "vitest";
import {
  __resetInventoryForTests,
  grantOwnedItem,
  ownsItem,
} from "@/lib/equipment/inventory-store";
import {
  __resetLoadoutsForTests,
  activatePreset,
  equipItem,
  getActiveLoadout,
  getAppearance,
  listCompatibleOwned,
  unequipSlot,
} from "@/lib/equipment/loadout-store";
import {
  anatomyTagsForBodyType,
  checkAnatomyCompatibility,
  validateEquipCompatibility,
} from "@/lib/equipment/compatibility";
import { checkEquipmentSafety } from "@/lib/equipment/safety";
import { getCatalogItem } from "@/lib/items/catalog";

describe("equipment loadout + ownership", () => {
  const owner = "guest_equip_test_owner";
  const petId = "live-companion";

  beforeEach(() => {
    __resetInventoryForTests(owner);
    __resetLoadoutsForTests();
  });

  it("seeds starter ownership and allows equip of owned wooden-paw-guard", () => {
    expect(ownsItem(owner, "wooden-paw-guard")).toBe(true);
    const result = equipItem({
      ownerKey: owner,
      publicPetId: petId,
      itemId: "wooden-paw-guard",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.loadout.slots.weapon).toBe("wooden-paw-guard");
    expect(result.appearance.layers.some((l) => l.itemId === "wooden-paw-guard")).toBe(true);
    expect(result.loadout.revision).toBeGreaterThanOrEqual(2);
  });

  it("rejects equip of unowned catalog items", () => {
    const mythic = getCatalogItem("ember-talons");
    expect(mythic).toBeTruthy();
    expect(ownsItem(owner, "ember-talons")).toBe(false);
    const result = equipItem({
      ownerKey: owner,
      publicPetId: petId,
      itemId: "ember-talons",
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("NOT_OWNED");
  });

  it("grants purchase into inventory then allows Equip Now path", () => {
    const grant = grantOwnedItem(owner, "ember-spark-claws", 1);
    expect(grant.ok).toBe(true);
    expect(ownsItem(owner, "ember-spark-claws")).toBe(true);
    const result = equipItem({
      ownerKey: owner,
      publicPetId: petId,
      itemId: "ember-spark-claws",
    });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.appearance.revision).toBe(result.loadout.revision);
  });

  it("blocks other-player and combat equip mutations", () => {
    const other = checkEquipmentSafety({
      inCombat: false,
      inCutscene: false,
      otherPlayer: true,
      actorIsOwner: false,
    });
    expect(other.ok).toBe(false);
    expect(other.inspectOnly).toBe(true);

    const combat = equipItem({
      ownerKey: owner,
      publicPetId: petId,
      itemId: "wooden-paw-guard",
      safety: { inCombat: true, actorIsOwner: true },
    });
    expect(combat.ok).toBe(false);
    if (combat.ok) return;
    expect(combat.reason).toBe("SAFETY_BLOCKED");
  });

  it("validates anatomy compatibility with clear reasons", () => {
    const avian = anatomyTagsForBodyType("AVIAN");
    const wingItem = getCatalogItem("breeze-wing-bands");
    expect(wingItem).toBeTruthy();
    if (!wingItem) return;
    const ok = checkAnatomyCompatibility(wingItem, avian);
    expect(ok.ok).toBe(true);

    const serpent = anatomyTagsForBodyType("SERPENTINE");
    const bad = checkAnatomyCompatibility(wingItem, serpent);
    expect(bad.ok).toBe(false);
    if (bad.ok) return;
    expect(bad.reason).toBe("INCOMPATIBLE_ANATOMY");
    expect(bad.message.toLowerCase()).toContain("anatomy");
  });

  it("lists compatible owned gear and supports unequip + presets", () => {
    const list = listCompatibleOwned({ ownerKey: owner, publicPetId: petId });
    expect(list.some((r) => r.itemId === "wooden-paw-guard" && r.compatible)).toBe(true);

    equipItem({ ownerKey: owner, publicPetId: petId, itemId: "cloth-pet-vest" });
    const unequip = unequipSlot({
      ownerKey: owner,
      publicPetId: petId,
      slot: "armor",
    });
    expect(unequip.ok).toBe(true);

    const adventure = activatePreset(owner, petId, "Adventure");
    expect(adventure.presetName).toBe("Adventure");
    expect(adventure.active).toBe(true);
    expect(getActiveLoadout(owner, petId).presetName).toBe("Adventure");
  });

  it("builds appearance snapshot with attachment anchors", () => {
    equipItem({ ownerKey: owner, publicPetId: petId, itemId: "wooden-paw-guard" });
    const snap = getAppearance(owner, petId);
    expect(snap).toBeTruthy();
    expect(snap?.layers[0]?.attachment).toBeTruthy();
    expect(snap?.layers[0]?.iconPath).toContain("/assets/items/");
  });

  it("rejects non-equippable materials", () => {
    grantOwnedItem(owner, "ember-dust", 1);
    const result = validateEquipCompatibility({
      itemId: "ember-dust",
      petAnatomy: anatomyTagsForBodyType("QUADRUPED"),
    });
    expect(result.ok).toBe(false);
    if (result.ok) return;
    expect(result.reason).toBe("NOT_EQUIPPABLE");
  });
});
