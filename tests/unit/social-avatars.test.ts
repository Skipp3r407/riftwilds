import { beforeEach, describe, expect, it } from "vitest";
import { createPet } from "../factories/pet-factory";
import {
  resetHatcheryStoreForTests,
  savePet,
} from "@/game/eggs/hatchery-store";
import { creaturePortraitPath } from "@/lib/assets/paths";
import {
  creditCredits,
  resetCreditLedgerForTests,
} from "@/lib/credits/ledger";
import { resetEntitlementsForTests } from "@/lib/economy/sol/entitlements";
import {
  brandAvatarKey,
  ensureSocialProfile,
  ensureSystemKeepersSeeded,
  evaluateSpeciesAvatarUnlock,
  getAvatarCatalog,
  listCharacterAvatarOptions,
  listRiftlingAvatarSlugs,
  listSpeciesAvatarOptions,
  loreAvatarKey,
  npcAvatarKey,
  parseAvatarKey,
  petAvatarKey,
  purchaseSpeciesAvatarWithCredits,
  purchaseSpeciesAvatarWithSol,
  resetSocialStoreForTests,
  setAvatar,
  speciesAvatarKey,
  STARTER_RIFTLING_AVATAR_SLUGS,
} from "@/lib/social";

describe("social avatars", () => {
  beforeEach(() => {
    resetSocialStoreForTests();
    resetHatcheryStoreForTests();
    resetCreditLedgerForTests();
    resetEntitlementsForTests();
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

  it("expands Riftling cosmetics beyond free starters and keeps starters unlocked", () => {
    const owner = "guest_avatar_no_pets";
    ensureSocialProfile(owner);

    const catalog = getAvatarCatalog(owner);
    const petsSection = catalog.sections.find((s) => s.id === "pets");
    const riftlings = catalog.sections.find((s) => s.id === "riftlings");
    const allSlugs = listRiftlingAvatarSlugs();

    expect(petsSection).toBeUndefined();
    expect(riftlings?.title).toBe("Riftling avatars");
    expect(allSlugs.length).toBeGreaterThanOrEqual(40);
    expect(riftlings?.options.length).toBe(allSlugs.length);
    expect(catalog.unlockSummary.freeStarters).toBe(STARTER_RIFTLING_AVATAR_SLUGS.length);
    expect(catalog.unlockSummary.total).toBe(allSlugs.length);
    expect(catalog.cosmeticsNote.toLowerCase()).toContain("cosmetic");

    const free = riftlings?.options.filter((o) =>
      STARTER_RIFTLING_AVATAR_SLUGS.includes(
        o.key.replace("species:", "") as (typeof STARTER_RIFTLING_AVATAR_SLUGS)[number],
      ),
    );
    expect(free?.every((o) => o.unlocked && o.kind === "species")).toBe(true);
    expect(riftlings?.options.some((o) => !o.unlocked)).toBe(true);
    expect(riftlings?.options[0]?.src).toBe(creaturePortraitPath(allSlugs[0]!));
    expect(riftlings?.options[0]?.thumbSrc).toContain("/assets/pets/thumbs/");
  });

  it("lists owned pets under Your Riftlings and keeps species cosmetics", () => {
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
    const riftlings = catalog.sections.find((s) => s.id === "riftlings")?.options ?? [];

    expect(catalog.sections.find((s) => s.id === "pets")?.title).toBe("Your Riftlings");
    expect(pets).toHaveLength(1);
    expect(pets[0]?.key).toBe(petAvatarKey(pet.publicId));
    expect(pets[0]?.src).toBe(creaturePortraitPath("cindercub"));
    expect(pets[0]?.label).toBe("Ember Buddy");
    expect(riftlings.length).toBe(listRiftlingAvatarSlugs().length);
  });

  it("unlocks a non-starter species avatar for free when the player owns that pet", () => {
    const owner = "guest_avatar_owned_species";
    ensureSocialProfile(owner);
    const pet = createPet({
      ownerKey: owner,
      speciesSlug: "ashwing",
      seed: "avatar-ashwing",
      name: "Ash Buddy",
    });
    savePet(pet);

    const evald = evaluateSpeciesAvatarUnlock(owner, "ashwing");
    expect(evald?.unlocked).toBe(true);
    expect(evald?.paths.ownedPet).toBe(true);

    const ok = setAvatar(owner, { kind: "species", speciesSlug: "ashwing" });
    expect(ok.ok).toBe(true);
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

  it("sets a starter Riftling species avatar without owning that pet", () => {
    const owner = "guest_avatar_species";
    ensureSocialProfile(owner);

    const speciesOptions = listSpeciesAvatarOptions(owner);
    expect(speciesOptions.some((o) => o.key === speciesAvatarKey("mossprig"))).toBe(true);

    const ok = setAvatar(owner, { kind: "species", speciesSlug: "mossprig" });
    expect(ok.ok).toBe(true);
    if (!ok.ok) return;
    expect(ok.key).toBe(speciesAvatarKey("mossprig"));
    expect(ok.src).toBe(creaturePortraitPath("mossprig"));
    expect(ok.profile.avatarKey).toBe(speciesAvatarKey("mossprig"));
    expect(ok.profile.avatarSrc).toBe(creaturePortraitPath("mossprig"));

    const catalog = getAvatarCatalog(owner);
    expect(catalog.selectedKey).toBe(speciesAvatarKey("mossprig"));
    expect(catalog.selectedSrc).toBe(creaturePortraitPath("mossprig"));
  });

  it("rejects locked species avatars until purchased or unlocked", () => {
    const owner = "guest_avatar_locked";
    ensureSocialProfile(owner);

    const locked = evaluateSpeciesAvatarUnlock(owner, "celestora");
    expect(locked?.unlocked).toBe(false);

    const denied = setAvatar(owner, { kind: "species", speciesSlug: "celestora" });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBe("locked");
  });

  it("rejects unknown species avatars", () => {
    const owner = "guest_avatar_bad_species";
    ensureSocialProfile(owner);

    const denied = setAvatar(owner, { kind: "species", speciesSlug: "not-a-riftling" });
    expect(denied.ok).toBe(false);
    if (!denied.ok) expect(denied.error).toBe("not_found");
  });

  it("purchases a locked avatar with Credits and persists unlock", () => {
    const owner = "guest_avatar_credits";
    ensureSocialProfile(owner);

    const before = evaluateSpeciesAvatarUnlock(owner, "ashwing");
    expect(before?.unlocked).toBe(false);
    const price = before!.paths.creditsPrice;

    creditCredits({
      userId: owner,
      amount: price + 50,
      reason: "ADMIN_ADJUST",
      requestId: "avatar-test-fund",
    });

    const bought = purchaseSpeciesAvatarWithCredits({
      ownerKey: owner,
      speciesSlug: "ashwing",
      requestId: "avatar-buy-ashwing-1",
    });
    expect(bought.ok).toBe(true);
    if (!bought.ok) return;
    expect(bought.key).toBe(speciesAvatarKey("ashwing"));
    expect(bought.profile.unlockedAvatarKeys).toContain(speciesAvatarKey("ashwing"));

    const after = evaluateSpeciesAvatarUnlock(owner, "ashwing");
    expect(after?.unlocked).toBe(true);
    expect(after?.paths.purchased).toBe(true);

    const set = setAvatar(owner, { kind: "species", speciesSlug: "ashwing" });
    expect(set.ok).toBe(true);

    const replay = purchaseSpeciesAvatarWithCredits({
      ownerKey: owner,
      speciesSlug: "ashwing",
      requestId: "avatar-buy-ashwing-2",
    });
    expect(replay.ok).toBe(false);
    if (!replay.ok) expect(replay.error).toBe("already_unlocked");
  });

  it("blocks SOL avatar purchase while SOL_PURCHASES_ENABLED is off", () => {
    const owner = "guest_avatar_sol";
    ensureSocialProfile(owner);

    const result = purchaseSpeciesAvatarWithSol({
      ownerKey: owner,
      speciesSlug: "ashwing",
      requestId: "avatar-sol-ashwing-1",
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toBe("sol_coming_soon");
      expect(result.solPrice).toBeTruthy();
      expect(result.message.toLowerCase()).toContain("coming soon");
    }

    const stillLocked = evaluateSpeciesAvatarUnlock(owner, "ashwing");
    expect(stillLocked?.unlocked).toBe(false);
    expect(stillLocked?.paths.solPurchaseEnabled).toBe(false);
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
    expect(parseAvatarKey("species:cindercub")).toEqual({
      kind: "species",
      speciesSlug: "cindercub",
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
