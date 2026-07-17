import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { solToLamports } from "@/lib/items/lamports";
import { allocateForTransactionType } from "@/lib/revenue/allocate";
import { __resetVaultEventBus, subscribeVaultEvents } from "@/lib/rewards/events";
import {
  __debugVaultState,
  __resetPetRewardVault,
  claimPetRewards,
  closeCurrentEpoch,
  getPetRewardVaultView,
  recordVerifiedVaultDeposit,
  registerPetForRewards,
  VAULT_VERIFICATION_TOKEN,
} from "@/lib/rewards/vault-store";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import type { VaultRealtimeEvent } from "@/lib/rewards/types";

function registerActivePet(id: string, wallet = "wallet_a") {
  return registerPetForRewards({
    publicPetId: id,
    petName: `Pet ${id}`,
    walletKey: wallet,
    careScore: 80,
    isSick: false,
    isDormant: false,
    isDeceased: false,
    isListedForSale: false,
    ownershipHours: 48,
    meetsMinTokenBalance: true,
    petSelectedForRewards: true,
    tokenHoldHours: 0,
    walletBlocked: false,
    transferredRecently: false,
  });
}

function verifiedDeposit(grossSol: string, requestId: string) {
  return recordVerifiedVaultDeposit({
    requestId,
    grossLamports: solToLamports(grossSol),
    transactionType: "SHOP_PURCHASE",
    source: "SHOP_PURCHASE",
    verificationToken: VAULT_VERIFICATION_TOKEN,
    txSignature: `sig_${requestId}`,
  });
}

beforeEach(() => {
  __resetPetRewardVault();
  __resetVaultEventBus();
});

afterEach(() => {
  __resetPetRewardVault();
  __resetVaultEventBus();
  vi.restoreAllMocks();
});

describe("Pet Reward Vault honesty", () => {
  it("updates estimated pending only after verified vault deposits", () => {
    registerActivePet("pet_1");
    const before = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    expect(before.estimatedPendingLamports).toBe("0");

    const events: VaultRealtimeEvent[] = [];
    const unsub = subscribeVaultEvents((e) => events.push(e));

    // Wait without deposits — estimate must stay 0 (no timer fabrication).
    expect(__debugVaultState().poolLamports).toBe(0n);
    expect(
      getPetRewardVaultView({
        publicPetId: "pet_1",
        viewerWalletKey: "wallet_a",
        isOwner: true,
      })!.estimatedPendingLamports,
    ).toBe("0");

    const result = verifiedDeposit("1", "dep_1");
    expect(result.ok).toBe(true);

    const expectedVault = allocateForTransactionType(solToLamports("1"), "SHOP_PURCHASE").lines.find(
      (l) => l.destination === "PET_HOLDER_REWARD_VAULT",
    )!.allocatedAmountLamports;

    const after = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    expect(after.estimatedPendingLamports).toBe(expectedVault.toString());
    expect(events.some((e) => e.type === "rewardEstimateUpdated")).toBe(true);
    expect(
      events
        .filter((e) => e.type === "rewardEstimateUpdated")
        .every((e) => e.type === "rewardEstimateUpdated" && e.fromVerifiedDeposit === true),
    ).toBe(true);
    unsub();
  });

  it("rejects unverified deposits and does not change the pool", () => {
    registerActivePet("pet_1");
    const bad = recordVerifiedVaultDeposit({
      requestId: "hack",
      grossLamports: solToLamports("10"),
      transactionType: "SHOP_PURCHASE",
      source: "VERIFIED_INJECTOR",
      verificationToken: "wrong-token",
    });
    expect(bad.ok).toBe(false);
    expect(__debugVaultState().poolLamports).toBe(0n);
  });

  it("does not update estimates without a deposit", () => {
    registerActivePet("pet_1");
    const a = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    const b = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    expect(a.estimatedPendingLamports).toBe(b.estimatedPendingLamports);
    expect(a.estimatedPendingLamports).toBe("0");
  });

  it("keeps estimated and claimable separate; claimable does not decrease incorrectly", () => {
    registerActivePet("pet_1");
    verifiedDeposit("1", "dep_claim_1");
    closeCurrentEpoch();

    const afterClose = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    expect(afterClose.estimatedPendingLamports).toBe("0");
    const claimable = BigInt(afterClose.claimableLamports);
    expect(claimable).toBeGreaterThan(0n);

    // New deposit only grows estimate — claimable unchanged
    verifiedDeposit("1", "dep_claim_2");
    const mid = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    expect(BigInt(mid.claimableLamports)).toBe(claimable);
    expect(BigInt(mid.estimatedPendingLamports)).toBeGreaterThan(0n);
  });

  it("inactive pets never accumulate estimated pending", () => {
    registerPetForRewards({
      publicPetId: "listed_pet",
      petName: "Listed",
      walletKey: "wallet_b",
      careScore: 90,
      isListedForSale: true,
      ownershipHours: 100,
      meetsMinTokenBalance: true,
      petSelectedForRewards: true,
    });
    registerActivePet("active_pet", "wallet_c");

    verifiedDeposit("1", "dep_inactive");

    const listed = getPetRewardVaultView({
      publicPetId: "listed_pet",
      viewerWalletKey: "wallet_b",
      isOwner: true,
    })!;
    expect(listed.status).toBe("inactive");
    expect(listed.inactiveReasons).toContain("listed");
    expect(listed.estimatedPendingLamports).toBe("0");

    const active = getPetRewardVaultView({
      publicPetId: "active_pet",
      viewerWalletKey: "wallet_c",
      isOwner: true,
    })!;
    expect(active.status).toBe("active");
    expect(BigInt(active.estimatedPendingLamports)).toBeGreaterThan(0n);
  });

  it("hides wallet estimates from non-owners", () => {
    registerActivePet("pet_1");
    verifiedDeposit("1", "dep_owner");
    const publicView = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "stranger",
      isOwner: false,
    })!;
    expect(publicView.walletEstimatesVisible).toBe(false);
    expect(publicView.estimatedPendingSol).toBe("—");
    expect(publicView.claimableSol).toBe("—");
  });

  it("splits pool by weight matching server compute", () => {
    registerActivePet("pet_a", "w1");
    registerActivePet("pet_b", "w2");
    verifiedDeposit("1", "dep_split");

    const pool = allocateForTransactionType(solToLamports("1"), "SHOP_PURCHASE").lines.find(
      (l) => l.destination === "PET_HOLDER_REWARD_VAULT",
    )!.allocatedAmountLamports;

    const a = getPetRewardVaultView({
      publicPetId: "pet_a",
      viewerWalletKey: "w1",
      isOwner: true,
    })!;
    const b = getPetRewardVaultView({
      publicPetId: "pet_b",
      viewerWalletKey: "w2",
      isOwner: true,
    })!;
    expect(a.estimatedPendingLamports).toBe((pool / 2n).toString());
    expect(b.estimatedPendingLamports).toBe((pool / 2n).toString());
  });

  it("reconnect-style reload restores the same server estimates", () => {
    registerActivePet("pet_1");
    verifiedDeposit("2", "dep_reconnect");
    const snap1 = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    const snap2 = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    expect(snap2.estimatedPendingLamports).toBe(snap1.estimatedPendingLamports);
    expect(snap2.currentRewardPoolLamports).toBe(snap1.currentRewardPoolLamports);
  });

  it("credits only the vault allocation slice, not full gross", () => {
    registerActivePet("pet_1");
    const gross = solToLamports("1");
    const result = verifiedDeposit("1", "dep_slice");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.vaultLamports).toBeLessThan(gross);
    expect(result.vaultLamports).toBe(solToLamports("0.15"));
  });

  it("respects claims feature flag", () => {
    registerActivePet("pet_1");
    verifiedDeposit("1", "dep_flag");
    closeCurrentEpoch();
    expect(featureFlagDefaults.REWARD_CLAIMS_ENABLED).toBe(false);
    const claim = claimPetRewards({ publicPetId: "pet_1", walletKey: "wallet_a" });
    expect(claim.ok).toBe(false);
    if (!claim.ok) expect(claim.reason).toBe("claims_disabled");
  });

  it("rejects duplicate requestIds (idempotent funding)", () => {
    registerActivePet("pet_1");
    expect(verifiedDeposit("1", "dup").ok).toBe(true);
    expect(verifiedDeposit("1", "dup").ok).toBe(false);
    expect(__debugVaultState().fundingCount).toBe(1);
  });

  it("emits newFundingTransaction with explorer metadata", () => {
    registerActivePet("pet_1");
    const events: VaultRealtimeEvent[] = [];
    const unsub = subscribeVaultEvents((e) => events.push(e));
    verifiedDeposit("0.5", "dep_feed");
    const fundEvt = events.find((e) => e.type === "newFundingTransaction");
    expect(fundEvt?.type).toBe("newFundingTransaction");
    if (fundEvt?.type === "newFundingTransaction") {
      expect(fundEvt.funding.verified).toBe(true);
      expect(fundEvt.funding.txSignature).toBeTruthy();
      expect(fundEvt.funding.explorerUrl).toContain("explorer.solana.com");
    }
    unsub();
  });

  it("exposes community activity and treasury disclaimers without fabricating holders", () => {
    registerActivePet("pet_1");
    const view = getPetRewardVaultView({
      publicPetId: "pet_1",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    expect(view.communityActivity.newHolders).toBeNull();
    expect(view.communityActivity.holdersLabel).toMatch(/N\/A/i);
    expect(view.nextDistributionSeconds).toBe(view.nextSnapshotSeconds);
    expect(view.disclaimers.entertainment.toLowerCase()).toContain("do not mint sol");
    expect(view.disclaimers.communityTreasury.toLowerCase()).toContain("project-controlled");
  });
});
