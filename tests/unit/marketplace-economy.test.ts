import { describe, expect, it } from "vitest";
import { isEggSellable, eggListingDisclosure, EGG_SUPPLY_GLOBAL } from "@/lib/economy/egg-supply";
import {
  evaluateBreedingEligibility,
  breedingFeeLamportsForUseIndex,
  splitBreedingFee,
} from "@/lib/economy/breeding-rules";
import { validateListingCreate, LISTING_RULES } from "@/lib/marketplace/listing-rules";
import { buildPriceHistorySummary } from "@/lib/marketplace/price-history";
import { solToLamports } from "@/lib/items/lamports";
import { MARKETPLACE_FEE_POLICY } from "@/lib/marketplace/fee-policy";
import { applyRankedNormalization } from "@/game/arena/ranked-normalization";

describe("egg supply", () => {
  it("keeps starter eggs unsellable", () => {
    expect(isEggSellable("STARTER")).toBe(false);
    expect(eggListingDisclosure("STARTER").exactCreatureKnown).toBe(false);
    expect(eggListingDisclosure("STARTER").accountBound).toBe(true);
  });

  it("keeps weekly release in the configured band", () => {
    expect(EGG_SUPPLY_GLOBAL.weeklyOfficialRelease.active).toBeGreaterThanOrEqual(25);
    expect(EGG_SUPPLY_GLOBAL.weeklyOfficialRelease.active).toBeLessThanOrEqual(100);
  });
});

describe("breeding rules", () => {
  it("applies rising fees and fee split", () => {
    expect(breedingFeeLamportsForUseIndex(0)).toBe(solToLamports("0.05"));
    expect(breedingFeeLamportsForUseIndex(4)).toBe(solToLamports("0.35"));
    const split = splitBreedingFee(solToLamports("0.20"));
    expect(split.projectReserve + split.holderVault + split.development + split.communityEvents).toBe(
      solToLamports("0.20"),
    );
  });

  it("blocks under-age pets", () => {
    const result = evaluateBreedingEligibility(
      {
        ageHours: 10,
        bond: 80,
        breedingUsesRemaining: 3,
        lastBredAt: null,
      },
      0,
    );
    expect(result.ok).toBe(false);
  });
});

describe("listing rules", () => {
  it("rejects starter eggs and pet-only bundles with items", () => {
    expect(
      validateListingCreate({
        category: "EGGS",
        priceLamports: solToLamports("0.01"),
        durationDays: 7,
        eggAccountBound: true,
        activePetEggListings: 0,
        activeItemListings: 0,
      }).ok,
    ).toBe(false);

    expect(
      validateListingCreate({
        category: "PETS",
        priceLamports: solToLamports("0.01"),
        durationDays: 7,
        bundleMode: "PET_ONLY",
        bundledItemKeys: ["x"],
        activePetEggListings: 0,
        activeItemListings: 0,
      }).ok,
    ).toBe(false);
  });

  it("enforces listing caps and fee constants", () => {
    expect(LISTING_RULES.maxActiveListingsPerWallet.petOrEgg).toBe(5);
    expect(LISTING_RULES.listingFeeLamports).toBe(solToLamports("0.002"));
    expect(MARKETPLACE_FEE_POLICY.petsAndEggs.sellerBps).toBe(9000);
  });
});

describe("price history language", () => {
  it("uses similar-sold range language and never intrinsic worth", () => {
    const snap = buildPriceHistorySummary({
      askingPriceLamports: solToLamports("0.5"),
      similarRaritySales: [
        { priceLamports: solToLamports("0.4"), soldAt: "2026-07-01T00:00:00.000Z" },
        { priceLamports: solToLamports("0.6"), soldAt: "2026-07-02T00:00:00.000Z" },
      ],
    });
    expect(snap.summaryLine).toMatch(/Similar pets recently sold between/);
    expect(snap.summaryLine.toLowerCase()).not.toContain("this pet is worth");
  });
});

describe("ranked normalization", () => {
  it("caps equipment and paid ability power", () => {
    const result = applyRankedNormalization(
      {
        level: 40,
        baseAttack: 100,
        baseDefense: 80,
        baseSpeed: 60,
        baseMaxHp: 200,
        equipAttackBonus: 80,
        equipDefenseBonus: 80,
        equipSpeedBonus: 80,
        equipMaxHpBonus: 80,
        abilityPower: 200,
        abilityBaselinePower: 100,
        paidUpgradeApplied: true,
      },
      true,
    );
    expect(result.level).toBe(20);
    expect(result.equipAttackBonusApplied).toBeLessThanOrEqual(Math.floor(result.attack * 0.18) + 80);
    expect(result.abilityPower).toBeLessThanOrEqual(108);
    expect(result.flags.equipmentNormalized).toBe(true);
  });
});
