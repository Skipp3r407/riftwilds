import { describe, expect, it } from "vitest";
import { solToLamports, lamportsToSolString, splitMarketplaceProceeds } from "@/lib/items/lamports";
import { quoteDirectPurchase, getItemPriceLamports } from "@/lib/items/pricing";
import { applyRarityStatCap, RARITY_POWER_CAP_BPS } from "@/lib/items/rarity";
import { WEAPON_CATALOG, catalogStats, getWeaponById } from "@/lib/items/catalog";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

describe("lamports accounting", () => {
  it("converts SOL without float math for balances", () => {
    expect(solToLamports("1")).toBe(1_000_000_000n);
    expect(solToLamports("0.002")).toBe(2_000_000n);
    expect(lamportsToSolString(1_500_000_000n)).toBe("1.5");
  });

  it("splits marketplace fees to 100%", () => {
    const price = solToLamports("1");
    const split = splitMarketplaceProceeds(price, {
      sellerPercent: 90,
      growthPercent: 5,
      petRewardPercent: 3,
      operationsPercent: 1,
      eventsPercent: 1,
    });
    expect(split.seller + split.growth + split.petReward + split.operations + split.events).toBe(
      price,
    );
  });
});

describe("pricing", () => {
  it("quotes disclosed direct purchase in lamports", () => {
    const q = quoteDirectPurchase({ itemId: "wooden-paw-guard", rarity: "COMMON", solUsdRate: 100 });
    expect(q.priceLamports).toBe(getItemPriceLamports("wooden-paw-guard", "COMMON"));
    expect(q.usdDisclaimer).toContain("Estimated value");
    expect(q.disclosures.length).toBeGreaterThan(0);
  });
});

describe("rarity balance", () => {
  it("caps mythic at 15%", () => {
    expect(RARITY_POWER_CAP_BPS.MYTHIC).toBe(1500);
    expect(applyRarityStatCap(100, 130, "MYTHIC")).toBe(115);
    expect(applyRarityStatCap(100, 110, "RARE")).toBe(106);
  });
});

describe("weapon catalog", () => {
  it("includes required starter weapons", () => {
    expect(WEAPON_CATALOG.length).toBeGreaterThanOrEqual(40);
    expect(getWeaponById("alloy-pulse-cannon")?.description.toLowerCase()).toContain("not a firearm");
    expect(getWeaponById("crown-of-ten-affinities")?.rarity).toBe("CELESTIAL");
    const stats = catalogStats();
    expect(stats.abilities).toBeGreaterThanOrEqual(30);
  });
});

describe("safety flags", () => {
  it("keeps paid random and SOL purchases off by default", () => {
    expect(featureFlagDefaults.PAID_RANDOM_REWARDS_ENABLED).toBe(false);
    expect(featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED).toBe(false);
    expect(featureFlagDefaults.RANKED_EQUIPMENT_NORMALIZATION_ENABLED).toBe(true);
  });
});
