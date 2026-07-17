import { describe, expect, it } from "vitest";
import { solToLamports } from "@/lib/items/lamports";
import {
  MARKETPLACE_FEE_POLICY,
  saleAllocationForPetsAndEggs,
  saleAllocationForItems,
} from "@/lib/marketplace/fee-policy";
import { validateListingCreate, LISTING_RULES } from "@/lib/marketplace/listing-rules";
import {
  isEggSellable,
  computeRemainingSupply,
  EGG_SUPPLY_GLOBAL,
  getEggSupplyDefinition,
} from "@/lib/economy/egg-supply";
import {
  evaluateBreedingEligibility,
  breedingFeeLamportsForUseIndex,
  BREEDING_RULES,
} from "@/lib/economy/breeding-rules";

describe("marketplace fees", () => {
  it("pets/eggs sale allocation sums to price", () => {
    const price = solToLamports("2.5");
    const alloc = saleAllocationForPetsAndEggs(price);
    const sum = alloc.lines.reduce((s, l) => s + l.allocatedAmountLamports, 0n);
    expect(sum).toBe(price);
    expect(MARKETPLACE_FEE_POLICY.petsAndEggs.totalFeeBps).toBe(1000);
  });

  it("item marketplace fee is lighter (~5%)", () => {
    const price = solToLamports("1");
    const split = saleAllocationForItems(price);
    expect(split.seller + split.projectReserve + split.holderRewards + split.ops + split.communityEvents).toBe(
      price,
    );
    expect(split.seller).toBe(solToLamports("0.95"));
  });
});

describe("listings + egg supply", () => {
  it("enforces listing price floor and duration", () => {
    const bad = validateListingCreate({
      category: "PETS",
      priceLamports: 1n,
      durationDays: 7,
      activePetEggListings: 0,
      activeItemListings: 0,
    });
    expect(bad.ok).toBe(false);

    const ok = validateListingCreate({
      category: "PETS",
      priceLamports: LISTING_RULES.minListingPriceLamports,
      durationDays: 7,
      activePetEggListings: 0,
      activeItemListings: 0,
    });
    expect(ok.ok).toBe(true);
  });

  it("starter eggs unsellable; remaining supply never negative", () => {
    expect(isEggSellable("STARTER")).toBe(false);
    const def = getEggSupplyDefinition("LIMITED_COLLECTOR");
    const remaining = computeRemainingSupply(def, {
      releasedToday: 999,
      releasedThisWeek: 999,
      totalReleased: (def.maxTotalSupply ?? 0) + 50,
    });
    expect(remaining.remainingTotal).toBe(0);
    expect(remaining.remainingToday).toBe(0);
    expect(EGG_SUPPLY_GLOBAL.slowReleaseEnabled).toBe(true);
  });
});

describe("breeding caps", () => {
  it("enforces use cap and cooldown", () => {
    expect(BREEDING_RULES.rarityGuaranteed).toBe(false);
    expect(breedingFeeLamportsForUseIndex(99)).toBe(solToLamports("0.35"));

    const capped = evaluateBreedingEligibility(
      {
        ageHours: 100,
        bond: 80,
        breedingUsesRemaining: 1,
        lastBredAt: null,
      },
      BREEDING_RULES.usesPerPet.active,
    );
    expect(capped.ok).toBe(false);

    const cooling = evaluateBreedingEligibility(
      {
        ageHours: 100,
        bond: 80,
        breedingUsesRemaining: 3,
        lastBredAt: new Date().toISOString(),
        nowMs: Date.now(),
      },
      1,
    );
    expect(cooling.ok).toBe(false);
    if (!cooling.ok) expect(cooling.reason).toBe("cooldown_active");
  });
});
