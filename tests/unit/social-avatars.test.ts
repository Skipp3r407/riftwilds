import { beforeEach, describe, expect, it } from "vitest";
import { createPet } from "../factories/pet-factory";
import {
  resetHatcheryStoreForTests,
  savePet,
} from "@/game/eggs/hatchery-store";
import { creaturePortraitPath } from "@/lib/assets/paths";
import {
  brandAvatarKey,
  ensureSocialProfile,
  ensureSystemKeepersSeeded,
  getAvatarCatalog,
  listCharacterAvatarOptions,
  loreAvatarKey,
  npcAvatarKey,
  parseAvatarKey,
  petAvatarKey,
  resetSocialStoreForTests,
  setAvatar,
} from "@/lib/social";

describe("social avatars", () => {
  beforeEach(() => {
    resetSocialStoreForTests();
    resetHatcheryStoreForTests();
    ensureSystemKeepersSeeded();
  });

  it("lists character avatars from named NPCs and lore", () => {
    const characters = listCharacterAvatarOptions();
    expect(characters.length).toBeGreaterThan(10);
    expect(characters.every((c) => c.unlocked)).toBe(true);
    expect(characters.some((c) => c.key === npcAvatarKey("elara-venn"))).toBe(true);
    expect(characters.some((c) => c.key === loreAvatarKey("elara-venn"))).toBe(true);
    expect(characters.some((c) => c.src.includes("/assets/npcs/"))).toBe(true);
  });

  it("includes owned pets in the catalog with portrait paths", () => {
    const owner = "guest_avatar_owner";
    ensureSocialProfile(owner);
    const pet = createPet({
      ownerKey: owner,
      speciesSlug: "cindercub",
      seed: "avatar-pet-1",
      name: "Ember Buddy",
    });
    savePet(pet);

    const catalog = getAvatarCatalog(owner);
    const pets = catalog.sections.find((s) => s.id === "pets")?.options ?? [];
    expect(pets).toHaveLength(1);
    expect(pets[0]?.key).toBe(petAvatarKey(pet.publicId));
    expect(pets[0]?.src).toBe(creaturePortraitPath("cindercub"));
    expect(pets[0]?.label).toBe("Ember Buddy");
  });

  it("sets a pet avatar only when the player owns the pet", () => {
    const owner = "guest_avatar_a";
    const other = "guest_avatar_b";
    ensureSocialProfile(owner);
    ensureSocialProfile(other);

    const mine = createPet({
      ownerKey: owner,
      speciesSlug: "frostnip",
      seed: "avatar-owned",
    });
    const theirs = createPet({
      ownerKey: other,
      speciesSlug: "ashwing",
      seed: "avatar-stolen",
    });
    savePet(mine);
    savePet(theirs);

    const ok = setAvatar(owner, { kind: "pet", petPublicId: mine.publicId });
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.src).toBe(creaturePortraitPath("frostnip"));
    expect(ok.profile.avatarKey).toBe(petAvatarKey(mine.publicId));
    expect(ok.profile.avatarSrc).toBe(creaturePortraitPath("frostnip"));

    const denied = setAvatar(owner, { kind: "pet", petPublicId: theirs.publicId });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBe("not_owned");
  });

  it("allows NPC and brand avatars without ownership checks", () => {
    const owner = "guest_avatar_npc";
    ensureSocialProfile(owner);

    const npc = setAvatar(owner, { kind: "npc", npcSlug: "mira-shellbright" });
    expect(npc.ok).toBe(true);
    if (!npc.ok) return;
    expect(npc.key).toBe(npcAvatarKey("mira-shellbright"));
    expect(npc.src).toContain("mira-shellbright");

    const brand = setAvatar(owner, { kind: "brand", brandId: "mark" });
    expect(brand.ok).toBe(true);
    if (!brand.ok) return;
    expect(brand.key).toBe(brandAvatarKey("mark"));
    expect(brand.src).toContain("riftwilds-mark");
  });

  it("rejects unknown NPC / lore keys", () => {
    const owner = "guest_avatar_bad";
    ensureSocialProfile(owner);

    const badNpc = setAvatar(owner, { kind: "npc", npcSlug: "not-a-real-keeper" });
    expect(badNpc.ok).toBe(false);
    if (!badNpc.ok) expect(badNpc.error).toBe("not_found");

    const badLore = setAvatar(owner, { kind: "lore", characterId: "missing-hero" });
    expect(badLore.ok).toBe(false);
    if (!badLore.ok) expect(badLore.error).toBe("not_found");
  });

  it("parses avatar keys for API convenience", () => {
    expect(parseAvatarKey("pet:pet_abc")).toEqual({
      kind: "pet",
      petPublicId: "pet_abc",
    });
    expect(parseAvatarKey("npc:elara-venn")).toEqual({
      kind: "npc",
      npcSlug: "elara-venn",
    });
    expect(parseAvatarKey("lore:first-riftling")).toEqual({
      kind: "lore",
      characterId: "first-riftling",
    });
    expect(parseAvatarKey("brand:mark")).toEqual({
      kind: "brand",
      brandId: "mark",
    });
    expect(parseAvatarKey("weird")).toBeNull();
  });

  it("surfaces selectedKey in catalog after set", () => {
    const owner = "guest_avatar_selected";
    ensureSocialProfile(owner);
    setAvatar(owner, { kind: "lore", characterId: "first-riftling" });
    const catalog = getAvatarCatalog(owner);
    expect(catalog.selectedKey).toBe(loreAvatarKey("first-riftling"));
    expect(catalog.selectedSrc).toContain("comic-first-riftling");
  });
});
