import { describe, expect, it, beforeEach } from "vitest";
import {
  resetCreditLedgerForTests,
  ensureStarterCredits,
  creditCredits,
  getCreditBalance,
} from "@/lib/credits/ledger";
import {
  createCreatorListing,
  purchaseCreatorListing,
  resetCreatorMarketplaceForTests,
} from "@/lib/economy/creator-marketplace";
import { claimLandParcel, listLandParcels, resetLandStoreForTests } from "@/lib/economy/land";
import {
  createHomestead,
  buyFurniture,
  unlockHomesteadRoom,
  resetHousingForTests,
} from "@/lib/economy/housing-service";
import {
  createGuild,
  contributeToGuild,
  guildPayout,
  resetGuildBankForTests,
} from "@/lib/economy/guild-bank";
import { unlockSeasonPassPremium, addSeasonPassXp, claimSeasonPassReward } from "@/lib/economy/season-pass";
import {
  openPlayerShop,
  listInPlayerShop,
  buyFromPlayerShop,
  resetPlayerShopsForTests,
} from "@/lib/economy/player-shops";
import {
  registerForTournament,
  payoutTournamentDemo,
  resetTournamentsForTests,
} from "@/lib/economy/tournament";
import { buyCollectible, grantCollectible } from "@/lib/economy/collectibles";
import { purchasePremiumSku } from "@/lib/economy/premium-store";
import { createSolPaymentIntent, verifySolPaymentIntentDryRun } from "@/lib/economy/sol-adapter";
import { adminGrantCredits, setEconomyFreeze, isMarketplaceFrozen } from "@/lib/economy/admin-ops";
import { breedingFeeCreditsForUseIndex } from "@/lib/economy/breeding-rules";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

function topUp(userId: string, amount: number, id: string) {
  ensureStarterCredits(userId);
  creditCredits({ userId, amount, reason: "ADMIN_ADJUST", requestId: id });
}

describe("economy phases 3–16 cores", () => {
  beforeEach(() => {
    resetCreditLedgerForTests();
    resetCreatorMarketplaceForTests();
    resetLandStoreForTests();
    resetHousingForTests();
    resetGuildBankForTests();
    resetPlayerShopsForTests();
    resetTournamentsForTests();
    setEconomyFreeze({
      adminId: "admin",
      marketplaceFrozen: false,
      shopFrozen: false,
      reason: "test reset freeze state",
    });
  });

  it("phase 3 creator marketplace royalties path", () => {
    topUp("creator-a", 500, "c-top");
    topUp("buyer-c", 500, "b-top");
    expect(
      createCreatorListing({
        publicId: "cl-1",
        creatorUserId: "creator-a",
        title: "Skin",
        itemKey: "skin-1",
        priceCredits: 100,
        category: "COSMETIC",
      }).ok,
    ).toBe(true);
    const buy = purchaseCreatorListing({
      publicId: "cl-1",
      buyerUserId: "buyer-c",
      requestId: "cbuy-1",
    });
    expect(buy.ok).toBe(true);
  });

  it("phase 4 land claim with Credits", () => {
    topUp("lander", 500, "l-top");
    const parcel = listLandParcels()[0]!;
    const r = claimLandParcel({
      parcelId: parcel.parcelId,
      userId: "lander",
      requestId: "land-1",
    });
    expect(r.ok).toBe(true);
  });

  it("phase 5 housing create + furniture", () => {
    topUp("houser", 800, "h-top");
    expect(createHomestead({ userId: "houser", name: "Nest", requestId: "hs-1" }).ok).toBe(true);
    expect(
      unlockHomesteadRoom({ userId: "houser", roomKey: "garden", requestId: "hs-2" }).ok,
    ).toBe(true);
    expect(
      buyFurniture({ userId: "houser", furnitureKey: "tide-fountain", requestId: "hs-3" }).ok,
    ).toBe(true);
  });

  it("phase 6 guild bank contribute + payout", () => {
    topUp("leader", 800, "g-top");
    topUp("member", 200, "g-mem");
    const g = createGuild({ userId: "leader", name: "Wardens", requestId: "g-1" });
    expect(g.ok).toBe(true);
    // member needs to join — for core test, payout to leader from bank after contribute
    expect(contributeToGuild({ userId: "leader", amount: 50, requestId: "g-2" }).ok).toBe(true);
    expect(
      guildPayout({
        officerUserId: "leader",
        toUserId: "leader",
        amount: 25,
        requestId: "g-3",
        reason: "test payout reason",
      }).ok,
    ).toBe(true);
  });

  it("phase 7 breeding Credits fee table", () => {
    expect(breedingFeeCreditsForUseIndex(0)).toBe(80);
    expect(breedingFeeCreditsForUseIndex(4)).toBe(400);
    expect(isFeatureEnabled("BREEDING_ENABLED")).toBe(true);
  });

  it("phase 8 integrates shipped Spirit flags (no rebuild)", () => {
    expect(isFeatureEnabled("SPIRIT_SYSTEM_ENABLED")).toBe(true);
    expect(isFeatureEnabled("SOL_SPIRIT_RECALL_ENABLED")).toBe(false);
  });

  it("phase 9 premium store Credits", () => {
    topUp("prem", 500, "p-top");
    const r = purchasePremiumSku({
      userId: "prem",
      skuKey: "premium-nameplate",
      requestId: "prem-1",
    });
    expect(r.ok).toBe(true);
  });

  it("phase 10 season pass unlock + claim", () => {
    topUp("passer", 800, "sp-top");
    expect(unlockSeasonPassPremium({ userId: "passer", requestId: "sp-1" }).ok).toBe(true);
    addSeasonPassXp("passer", 250);
    const claim = claimSeasonPassReward({
      userId: "passer",
      tier: 2,
      track: "premium",
    });
    expect(claim.ok).toBe(true);
  });

  it("phase 11 player shop buy", () => {
    topUp("shopkeep", 300, "ps-top");
    topUp("customer", 300, "ps-c");
    expect(openPlayerShop({ userId: "shopkeep", name: "Stall", requestId: "ps-1" }).ok).toBe(true);
    const stock = listInPlayerShop({
      ownerUserId: "shopkeep",
      itemKey: "basic-pet-meal",
      priceCredits: 40,
      quantity: 2,
    });
    expect(stock.ok).toBe(true);
    if (!stock.ok) return;
    const listingId = stock.shop.listings[0]!.listingId;
    const buy = buyFromPlayerShop({
      shopPublicId: stock.shop.publicId,
      listingId,
      buyerUserId: "customer",
      requestId: "ps-buy",
    });
    expect(buy.ok).toBe(true);
  });

  it("phase 12 tournament entry + payout (no wagering)", () => {
    topUp("t1", 200, "t1");
    topUp("t2", 200, "t2");
    expect(
      registerForTournament({
        tournamentId: "tourney-training-cup",
        userId: "t1",
        requestId: "tr-1",
      }).ok,
    ).toBe(true);
    expect(
      registerForTournament({
        tournamentId: "tourney-training-cup",
        userId: "t2",
        requestId: "tr-2",
      }).ok,
    ).toBe(true);
    const pay = payoutTournamentDemo({
      tournamentId: "tourney-training-cup",
      winnerUserIds: ["t1", "t2"],
      requestId: "tr-pay",
    });
    expect(pay.ok).toBe(true);
  });

  it("phase 14 collectibles Credits buy + earn grant", () => {
    topUp("col", 400, "col-top");
    expect(grantCollectible("col", "badge-first-hatch").ok).toBe(true);
    expect(
      buyCollectible({ userId: "col", key: "title-riftwalker", requestId: "col-1" }).ok,
    ).toBe(true);
  });

  it("phase 15 SOL adapter stays blocked / dry-run", () => {
    const intent = createSolPaymentIntent({
      userId: "sol-u",
      lamports: 1_000_000n,
      purpose: "test",
      requestId: "sol-i-1",
    });
    expect(intent.status).toBe("BLOCKED");
    const v = verifySolPaymentIntentDryRun(intent.intentId);
    expect(v.verified).toBe(false);
  });

  it("phase 16 admin freeze + audited grant", () => {
    setEconomyFreeze({
      adminId: "admin",
      marketplaceFrozen: true,
      reason: "incident response test freeze",
    });
    expect(isMarketplaceFrozen()).toBe(true);
    ensureStarterCredits("target");
    const g = adminGrantCredits({
      adminId: "admin",
      userId: "target",
      amount: 50,
      reason: "compensation for outage",
      requestId: "adm-1",
    });
    expect(g.ok).toBe(true);
    expect(getCreditBalance("target")).toBeGreaterThanOrEqual(250);
  });
});
