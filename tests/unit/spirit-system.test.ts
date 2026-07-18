import { beforeEach, describe, expect, it } from "vitest";
import {
  claimStarterEgg,
  ensurePetCareProgress,
  hatchEgg,
  savePet,
} from "@/game/eggs/hatchery-store";
import {
  activityGatesForState,
  ancestorBonusesAreNonCombat,
  applyBondToCreditsCost,
  canListPetOnMarketplace,
  createLegendaryAncestor,
  deriveLifeStateFromCare,
  downRiftling,
  enableHardcore,
  enterSpiritForm,
  getSpiritQuest,
  hardcoreWarningPayload,
  pickRescueQuest,
  purchaseCreditsInsurance,
  quoteCreditsHealer,
  quoteSolInstantRecall,
  recoverRiftling,
  resetSpiritStoreForTests,
  saveInsurance,
  saveSpiritRecord,
  ensureSpiritRecord,
  solQuoteIgnoresRarity,
  SPIRIT_QUEST_CATALOG,
  SPIRIT_REALM_NPCS,
  SPIRIT_RECOVERY_CONFIG,
} from "@/game/spirit";
import { SPIRIT_REALM_CONTENT_PACK } from "@/content/regions/packs/spirit-realm";
import { packHasDistinctContent } from "@/content/regions/types";
import { validateListingCreate, LISTING_RULES } from "@/lib/marketplace/listing-rules";
import { ensureStarterCredits, resetCreditLedgerForTests } from "@/lib/credits/ledger";
import { creditLoyaltyTokens } from "@/lib/loyalty/tokens";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

function hatchPet(owner = `spirit_owner_${Math.random().toString(16).slice(2)}`) {
  const egg = claimStarterEgg(owner);
  const { pet } = hatchEgg(owner, egg.publicId, { skipWait: true });
  return { owner, pet };
}

describe("Spirit system — life states & Downed", () => {
  beforeEach(() => {
    resetSpiritStoreForTests();
    resetCreditLedgerForTests();
  });

  it("maps health ≤ 0 to DOWNED in normal play (not permadead)", () => {
    expect(deriveLifeStateFromCare({ health: 0 }, { hardcoreEnabled: false })).toBe("DOWNED");
    expect(
      deriveLifeStateFromCare(
        { health: 0 },
        { hardcoreEnabled: true, countdownExpired: true },
      ),
    ).toBe("PERMADEAD");
    expect(deriveLifeStateFromCare({ health: 50 })).toBe("INJURED");
    expect(deriveLifeStateFromCare({ health: 100 })).toBe("HEALTHY");
  });

  it("downs a pet without permanent death and starts a countdown", () => {
    const { owner, pet } = hatchPet();
    const result = downRiftling({ petPublicId: pet.publicId, ownerKey: owner });
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.spirit.lifeState).toBe("DOWNED");
    expect(result.spirit.countdownEndsAt).toBeTruthy();
    expect(result.pet.care.health).toBe(0);
    const gates = activityGatesForState("DOWNED");
    expect(gates.canFight).toBe(false);
    expect(gates.canView).toBe(true);
    expect(gates.canHeal).toBe(true);
  });

  it("Credits healer recovers and preserves equipment snapshot ids", () => {
    const { owner, pet } = hatchPet();
    ensureStarterCredits(owner);
    downRiftling({ petPublicId: pet.publicId, ownerKey: owner });
    const rec = recoverRiftling({
      petPublicId: pet.publicId,
      ownerKey: owner,
      method: "CREDITS_HEALER",
      requestId: `cred_${pet.publicId}_1`,
    });
    expect(rec.ok).toBe(true);
    if (!rec.ok) return;
    expect(rec.spirit.lifeState).toBe("RECOVERED");
    expect(rec.pet.care.health).toBeGreaterThan(0);
    expect(rec.equipmentPreserved).toBe(true);
    expect(rec.creditsSpent).toBeGreaterThan(0);
  });

  it("rejects duplicate recovery requestIds (anti-dupe)", () => {
    const { owner, pet } = hatchPet();
    ensureStarterCredits(owner);
    downRiftling({ petPublicId: pet.publicId, ownerKey: owner });
    const id = `dupe_${pet.publicId}`;
    const first = recoverRiftling({
      petPublicId: pet.publicId,
      ownerKey: owner,
      method: "CREDITS_HEALER",
      requestId: id,
    });
    expect(first.ok).toBe(true);
    // Force down again
    downRiftling({ petPublicId: pet.publicId, ownerKey: owner });
    const second = recoverRiftling({
      petPublicId: pet.publicId,
      ownerKey: owner,
      method: "CREDITS_HEALER",
      requestId: id,
    });
    expect(second.ok).toBe(false);
    if (second.ok) return;
    expect(second.error).toBe("DUPLICATE");
  });

  it("recovers via recovery item from inventory", () => {
    const { owner, pet } = hatchPet();
    const progress = ensurePetCareProgress(pet);
    progress.inventory.push({ itemId: "spirit-crystal", qty: 1 });
    savePet(pet);
    downRiftling({ petPublicId: pet.publicId, ownerKey: owner });
    const rec = recoverRiftling({
      petPublicId: pet.publicId,
      ownerKey: owner,
      method: "RECOVERY_ITEM",
      itemId: "spirit-crystal",
      requestId: `item_${pet.publicId}`,
    });
    expect(rec.ok).toBe(true);
    if (!rec.ok) return;
    expect(rec.method).toBe("RECOVERY_ITEM");
  });

  it("loyalty token recovery works", () => {
    const { owner, pet } = hatchPet();
    creditLoyaltyTokens({
      userId: owner,
      amount: 100,
      reason: "test",
      requestId: `lt_grant_${pet.publicId}`,
    });
    downRiftling({ petPublicId: pet.publicId, ownerKey: owner });
    const rec = recoverRiftling({
      petPublicId: pet.publicId,
      ownerKey: owner,
      method: "LOYALTY_TOKEN",
      requestId: `lt_rec_${pet.publicId}`,
    });
    expect(rec.ok).toBe(true);
    if (!rec.ok) return;
    expect(rec.loyaltyTokensSpent).toBe(SPIRIT_RECOVERY_CONFIG.loyaltyTokenCost);
  });

  it("friend assist recovers when friend can pay", () => {
    const { owner, pet } = hatchPet();
    const friend = `friend_${Math.random().toString(16).slice(2)}`;
    ensureStarterCredits(friend);
    downRiftling({ petPublicId: pet.publicId, ownerKey: owner });
    const rec = recoverRiftling({
      petPublicId: pet.publicId,
      ownerKey: owner,
      method: "FRIEND_ASSIST",
      assistantKey: friend,
      requestId: `friend_${pet.publicId}`,
    });
    expect(rec.ok).toBe(true);
  });

  it("Spirit quest advances then recovers", () => {
    const { owner, pet } = hatchPet();
    downRiftling({ petPublicId: pet.publicId, ownerKey: owner });
    const entered = enterSpiritForm(pet.publicId, owner);
    expect(entered.ok).toBe(true);
    if (!entered.ok || !("questId" in entered)) return;
    const quest = getSpiritQuest(entered.questId)!;
    for (let i = 0; i < quest.steps.length; i++) {
      const step = quest.steps[i];
      const res = recoverRiftling({
        petPublicId: pet.publicId,
        ownerKey: owner,
        method: "SPIRIT_QUEST",
        questStepId: step.id,
        requestId: `sq_${pet.publicId}_${i}`,
      });
      if (i < quest.steps.length - 1) {
        expect(res.ok).toBe(false);
        if (!res.ok) expect(res.error).toBe("QUEST_IN_PROGRESS");
      } else {
        expect(res.ok).toBe(true);
      }
    }
  });
});

describe("Spirit system — SOL fees & marketplace", () => {
  it("SOL quote ignores rarity and market value", () => {
    expect(solQuoteIgnoresRarity(10)).toBe(true);
    expect(solQuoteIgnoresRarity(40)).toBe(true);
    expect(solQuoteIgnoresRarity(80)).toBe(true);
    const q = quoteSolInstantRecall({ level: 10, rarity: "MYTHIC" });
    expect(q.rarityIgnored).toBe(true);
    expect(q.lamports).toBeLessThanOrEqual(SPIRIT_RECOVERY_CONFIG.solRecall.maxLamports);
  });

  it("SOL recall is optional and flagged off by default", () => {
    expect(featureFlagDefaults.SOL_SPIRIT_RECALL_ENABLED).toBe(false);
    const { owner, pet } = hatchPet();
    ensureStarterCredits(owner);
    downRiftling({ petPublicId: pet.publicId, ownerKey: owner });
    const rec = recoverRiftling({
      petPublicId: pet.publicId,
      ownerKey: owner,
      method: "SOL_INSTANT_RECALL",
      requestId: `sol_${pet.publicId}`,
      walletAddress: "SoL11111111111111111111111111111111111111112",
      treasuryValidated: true,
    });
    // Flag off → substitute Credits path if affordable, or clear failure — never forced.
    if (rec.ok) {
      expect(rec.solLamports).toBe(0);
      expect(rec.creditsSpent).toBeGreaterThan(0);
    } else {
      expect(rec.error).toBeTruthy();
    }
  });

  it("marketplace blocks Downed / Spirit / quest-locked pets", () => {
    expect(canListPetOnMarketplace({ lifeState: "DOWNED" }).ok).toBe(false);
    expect(canListPetOnMarketplace({ lifeState: "SPIRIT_FORM" }).ok).toBe(false);
    expect(canListPetOnMarketplace({ lifeState: "HEALTHY" }).ok).toBe(true);
    expect(
      canListPetOnMarketplace({
        lifeState: "HEALTHY",
        spirit: {
          ...ensureSpiritRecord({ petPublicId: "x", ownerKey: "y" }),
          questLocked: true,
          activeQuestId: "sq-restore-memories",
        },
      }).ok,
    ).toBe(false);

    const blocked = validateListingCreate({
      category: "PETS",
      priceLamports: LISTING_RULES.minListingPriceLamports,
      durationDays: 7,
      activePetEggListings: 0,
      activeItemListings: 0,
      petLifeState: "DOWNED",
    });
    expect(blocked.ok).toBe(false);

    const ok = validateListingCreate({
      category: "PETS",
      priceLamports: LISTING_RULES.minListingPriceLamports,
      durationDays: 7,
      activePetEggListings: 0,
      activeItemListings: 0,
      petLifeState: "HEALTHY",
    });
    expect(ok.ok).toBe(true);
  });
});

describe("Spirit system — Hardcore, bond, insurance, realm", () => {
  beforeEach(() => {
    resetSpiritStoreForTests();
  });

  it("Hardcore requires warning + checkbox", () => {
    const warn = hardcoreWarningPayload();
    expect(warn.tone).toBe("danger");
    expect(warn.normalPlaySafe).toBe(true);
    const denied = enableHardcore({ checkboxAccepted: false, warningAcknowledged: true });
    expect(denied.ok).toBe(false);
    const ok = enableHardcore({
      checkboxAccepted: true,
      warningAcknowledged: true,
      typedConfirm: "HARDCORE",
    });
    expect(ok.ok).toBe(true);
  });

  it("bond reduces Credits healer cost", () => {
    const low = applyBondToCreditsCost(SPIRIT_RECOVERY_CONFIG.creditsHealerBase, 10);
    const high = applyBondToCreditsCost(SPIRIT_RECOVERY_CONFIG.creditsHealerBase, 100);
    expect(high).toBeLessThan(low);
  });

  it("insurance can zero Credits healer quote", () => {
    const policy = purchaseCreditsInsurance({ ownerKey: "o", petPublicId: "p" });
    saveInsurance(policy);
    const quote = quoteCreditsHealer({ bond: 50, insurance: policy });
    expect(quote.free).toBe(true);
    expect(quote.credits).toBe(0);
  });

  it("ancestors never grant combat power", () => {
    const a = createLegendaryAncestor({
      petPublicId: "pet_anc",
      ownerKey: "o",
      name: "Lantern Elder",
      speciesSlug: "soulmoth",
    });
    expect(ancestorBonusesAreNonCombat(a)).toBe(true);
  });

  it("Spirit Realm pack + NPCs + rescue quests exist", () => {
    expect(packHasDistinctContent(SPIRIT_REALM_CONTENT_PACK)).toBe(true);
    expect(SPIRIT_REALM_NPCS.length).toBeGreaterThanOrEqual(8);
    expect(SPIRIT_QUEST_CATALOG.length).toBeGreaterThanOrEqual(1);
    const q = pickRescueQuest({ bond: 90, petPublicId: "pet_hi" });
    expect(q.id).toBe("sq-speak-ancestors");
  });

  it("permadeath memorial path requires Hardcore", async () => {
    const { owner, pet } = hatchPet();
    const spirit = ensureSpiritRecord({ petPublicId: pet.publicId, ownerKey: owner });
    expect(spirit.hardcore.enabled).toBe(false);
    const { permadeathToMemorial } = await import("@/game/spirit/recovery-service");
    const denied = permadeathToMemorial({
      petPublicId: pet.publicId,
      ownerKey: owner,
      cause: "test",
    });
    expect(denied.ok).toBe(false);
    const enabled = enableHardcore({
      checkboxAccepted: true,
      warningAcknowledged: true,
      typedConfirm: "HARDCORE",
    });
    expect(enabled.ok).toBe(true);
    if (!enabled.ok) return;
    saveSpiritRecord({ ...spirit, hardcore: enabled.hardcore });
    const mem = permadeathToMemorial({
      petPublicId: pet.publicId,
      ownerKey: owner,
      cause: "Hardcore expedition",
    });
    expect(mem.ok).toBe(true);
  });
});
