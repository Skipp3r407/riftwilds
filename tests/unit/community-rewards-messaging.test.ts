import { describe, expect, it } from "vitest";
import { revenueDisclosures } from "@/lib/revenue/disclosures";
import { ECONOMY_DISCLAIMERS, ACTIVE_TREASURY_POLICY } from "@/lib/config/treasury-policy";
import { economyConfig } from "@/lib/config/economy";
import { ECONOMY_FLYWHEEL } from "@/game/economy/flywheel";
import { getPumpfunPublicConfig } from "@/lib/community/pumpfun-config";
import {
  evaluateMilestones,
  getCommunityMilestones,
} from "@/lib/community/milestones";
import { COMMUNITY_MILESTONES } from "@/content/community/milestones";
import {
  __resetPetRewardVault,
  getPetRewardVaultView,
  recordVerifiedVaultDeposit,
  registerPetForRewards,
  setCommunityActivitySnapshot,
  VAULT_VERIFICATION_TOKEN,
} from "@/lib/rewards/vault-store";
import { solToLamports } from "@/lib/items/lamports";
import { TREASURY_VAULTS } from "@/lib/revenue/policies";

const FORBIDDEN_PHRASES = [
  "buying the coin automatically",
  "each token purchase pays",
  "token purchase automatically generates",
  "automatically generate SOL for pet owners",
];

describe("Community rewards messaging honesty", () => {
  it("disclosures reject token-purchase → pet SOL framing", () => {
    expect(revenueDisclosures.tokenPurchase.toLowerCase()).toContain("does not automatically");
    expect(revenueDisclosures.holderRewards.toLowerCase()).toContain("does not automatically");
    expect(revenueDisclosures.communityTreasury.toLowerCase()).toContain(
      "project-controlled",
    );
    expect(ECONOMY_DISCLAIMERS.rewards.toLowerCase()).toContain("does not automatically");

    const corpus = [
      revenueDisclosures.tokenPurchase,
      revenueDisclosures.holderRewards,
      revenueDisclosures.communityTreasury,
      ECONOMY_DISCLAIMERS.rewards,
      economyConfig.CREATOR_FEE_NOTE,
    ].join("\n");

    expect(corpus.toLowerCase()).toMatch(/does not automatically/);
    expect(corpus.toLowerCase()).toMatch(/project-controlled/);
    expect(corpus.toLowerCase()).not.toMatch(
      /each token purchase (automatically )?(pays|funds) pet owners/i,
    );
    void FORBIDDEN_PHRASES;
  });

  it("treasury policy labels use Community Reward Treasury", () => {
    const petBucket = ACTIVE_TREASURY_POLICY.allocations.find((a) => a.id === "PET_REWARDS");
    expect(petBucket?.label).toBe("Community Reward Treasury");
    expect(TREASURY_VAULTS.PET_HOLDER_REWARD_VAULT.label).toBe("Community Reward Treasury");
    expect(petBucket?.description.toLowerCase()).toContain("not passive income");
  });

  it("flywheel epoch stage describes treasury sharing, not token-buy income", () => {
    const epoch = ECONOMY_FLYWHEEL.find((s) => s.id === "EPOCH_REWARDS");
    expect(epoch?.summary.toLowerCase()).toContain("project-controlled");
    expect(epoch?.title.toLowerCase()).toContain("community reward treasury");
  });

  it("pumpfun config is empty when mint unset (no fabricated mint)", () => {
    const prevMint = process.env.NEXT_PUBLIC_PUMPFUN_MINT;
    const prevUrl = process.env.NEXT_PUBLIC_PUMPFUN_URL;
    delete process.env.NEXT_PUBLIC_PUMPFUN_MINT;
    delete process.env.NEXT_PUBLIC_PUMPFUN_URL;
    const cfg = getPumpfunPublicConfig();
    // projectConfig may still say COMING_SOON → treated as unset
    expect(cfg.status).toBe("awaiting_mint");
    expect(cfg.mint).toBeNull();
    expect(cfg.configured).toBe(false);
    if (prevMint !== undefined) process.env.NEXT_PUBLIC_PUMPFUN_MINT = prevMint;
    if (prevUrl !== undefined) process.env.NEXT_PUBLIC_PUMPFUN_URL = prevUrl;
  });
});

describe("Community milestone config", () => {
  it("exports milestones with holder unlocks", () => {
    expect(COMMUNITY_MILESTONES.length).toBeGreaterThanOrEqual(4);
    expect(getCommunityMilestones()).toEqual(COMMUNITY_MILESTONES);
    const holders500 = COMMUNITY_MILESTONES.find((m) => m.id === "holders_500");
    expect(holders500?.threshold).toBe(500);
    expect(holders500?.rewardLabel.toLowerCase()).toContain("riftling");
  });

  it("evaluates progress without inventing holder counts", () => {
    const pending = evaluateMilestones({
      holders: null,
      marketplaceTrades: 10,
      eggsHatched: 5,
      petsEvolved: 0,
    });
    const holders = pending.find((m) => m.metric === "holders")!;
    expect(holders.metricAvailable).toBe(false);
    expect(holders.reached).toBe(false);

    const reached = evaluateMilestones({
      holders: 600,
      marketplaceTrades: 600,
      eggsHatched: 5,
      petsEvolved: 0,
    });
    expect(reached.find((m) => m.id === "holders_500")?.reached).toBe(true);
    expect(reached.find((m) => m.id === "trades_500")?.reached).toBe(true);
  });
});

describe("Community Reward Treasury deposit path", () => {
  it("updates estimates only after verified deposits and exposes community activity", () => {
    __resetPetRewardVault();
    registerPetForRewards({
      publicPetId: "ember",
      petName: "Ember",
      walletKey: "wallet_a",
      careScore: 80,
      ownershipHours: 48,
      meetsMinTokenBalance: true,
      petSelectedForRewards: true,
    });
    setCommunityActivitySnapshot({
      marketplaceTrades: 3,
      eggsHatched: 7,
      petsEvolved: 1,
      newHolders: null,
    });

    const before = getPetRewardVaultView({
      publicPetId: "ember",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    expect(before.estimatedPendingLamports).toBe("0");
    expect(before.communityActivity.eggsHatched).toBe(7);
    expect(before.communityActivity.holdersLabel).toContain("N/A");
    expect(before.disclaimers.communityTreasury.toLowerCase()).toContain("project-controlled");
    expect(before.nextDistributionAt).toBe(before.nextSnapshotAt);

    const dep = recordVerifiedVaultDeposit({
      requestId: "community_dep_1",
      grossLamports: solToLamports("1"),
      transactionType: "SHOP_PURCHASE",
      source: "GAME_REVENUE",
      verificationToken: VAULT_VERIFICATION_TOKEN,
    });
    expect(dep.ok).toBe(true);

    const after = getPetRewardVaultView({
      publicPetId: "ember",
      viewerWalletKey: "wallet_a",
      isOwner: true,
    })!;
    expect(BigInt(after.estimatedPendingLamports)).toBeGreaterThan(0n);
    expect(after.currentRewardRate.toLowerCase()).toContain("community reward treasury");
  });
});
