import { describe, expect, it, beforeEach } from "vitest";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { authDefaults } from "@/lib/config/project";
import {
  SOL_ECONOMY_FLAG_KEYS,
  allSolEconomyFlagsOff,
  assertNoSolRequiredForCorePlay,
  validateCatalogList,
  SOL_ECONOMY_SEED_CATALOG,
  appendEconomyLedgerEvent,
  assertLedgerEntryImmutable,
  verifyEconomyLedgerChain,
  resetEconomyLedgerForTests,
  calculateSolMarketplaceFees,
  DEFAULT_SOL_MARKETPLACE_FEES,
  issueWalletChallenge,
  verifyWalletChallenge,
  resetWalletChallengesForTests,
  collectibleAffectsGameplay,
  gameplayCardEqualsCollectibleEdition,
  assertEditionLinkedToGameplayCard,
  COLLECTIBLE_EDITION_CATALOG,
  getCollectibleEdition,
  mayGrantEntitlement,
  canTransitionSettlement,
  FREE_TOURNAMENT_CONFIG,
  assertNoSpectatorBetting,
  getSolEconomyNetwork,
} from "@/lib/economy/sol";
import { getNonceExpiry as siwsGetNonceExpiry } from "@/lib/auth/siws";

describe("SOL economy foundation", () => {
  beforeEach(() => {
    resetEconomyLedgerForTests();
    resetWalletChallengesForTests();
  });

  it("keeps all mandate SOL flags false by default", () => {
    for (const key of SOL_ECONOMY_FLAG_KEYS) {
      expect(featureFlagDefaults[key]).toBe(false);
    }
    expect(allSolEconomyFlagsOff()).toBe(true);
    expect(featureFlagDefaults.SOL_PURCHASES_ENABLED).toBe(false);
    expect(featureFlagDefaults.REAL_SOL_MARKETPLACE_ENABLED).toBe(false);
  });

  it("enforces Gold/Shards play and SOL never required", () => {
    expect(() => assertNoSolRequiredForCorePlay()).not.toThrow();
  });

  it("passes no pay-to-win catalog rules", () => {
    const result = validateCatalogList(SOL_ECONOMY_SEED_CATALOG);
    expect(result.ok).toBe(true);
    expect(result.failures).toEqual([]);

    const bad = validateCatalogList([
      {
        sku: "p2w-card",
        name: "Pay Power",
        kind: "GAMEPLAY_CARD",
        prices: { SOL: "1" },
        grantsGameplayPower: true,
        essentialGameplay: true,
        earnableWithoutSol: false,
        solOptionalOnly: true,
        active: true,
      },
    ]);
    expect(bad.ok).toBe(false);
    expect(bad.failures[0]?.violations).toContain("sol_exclusive_gameplay_power");
  });

  it("keeps EconomyLedger append-only and chain-valid", () => {
    const a = appendEconomyLedgerEvent({
      userId: "u1",
      eventType: "CURRENCY_CREDIT",
      currency: "GOLD",
      amount: 10,
      requestId: "req-a",
    });
    assertLedgerEntryImmutable(a.entry);
    const replay = appendEconomyLedgerEvent({
      userId: "u1",
      eventType: "CURRENCY_CREDIT",
      currency: "GOLD",
      amount: 10,
      requestId: "req-a",
    });
    expect(replay.idempotentReplay).toBe(true);
    expect(replay.entry.id).toBe(a.entry.id);

    appendEconomyLedgerEvent({
      userId: "u1",
      eventType: "CURRENCY_DEBIT",
      currency: "GOLD",
      amount: 3,
      requestId: "req-b",
    });
    expect(verifyEconomyLedgerChain().ok).toBe(true);
  });

  it("calculates marketplace fees that sum to gross", () => {
    const breakdown = calculateSolMarketplaceFees(1_000_000_000n, DEFAULT_SOL_MARKETPLACE_FEES);
    expect(
      breakdown.sellerLamports +
        breakdown.platformLamports +
        breakdown.creatorRoyaltyLamports +
        breakdown.communityFundLamports,
    ).toBe(1_000_000_000n);
    expect(breakdown.sellerLamports).toBe(900_000_000n);
  });

  it("rejects expired wallet challenges", () => {
    const issued = issueWalletChallenge({
      wallet: "11111111111111111111111111111111",
      purpose: "test",
    });
    expect(issued.ok).toBe(true);
    if (!issued.ok) return;

    const pastExpiry = new Date(new Date(issued.challenge.expiresAt).getTime() + 1);
    const result = verifyWalletChallenge({
      challengeId: issued.challenge.challengeId,
      wallet: issued.challenge.wallet,
      signatureBase58: "1".repeat(88),
      now: pastExpiry,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.error).toBe("expired");

    const expiry = siwsGetNonceExpiry(new Date("2026-01-01T00:00:00.000Z"));
    expect(expiry.getTime() - new Date("2026-01-01T00:00:00.000Z").getTime()).toBe(
      authDefaults.NONCE_TTL_SECONDS * 1000,
    );
  });

  it("treats collectible editions as non-gameplay", () => {
    expect(gameplayCardEqualsCollectibleEdition()).toBe(false);
    const edition = COLLECTIBLE_EDITION_CATALOG[0];
    expect(edition).toBeDefined();
    if (!edition) return;
    expect(collectibleAffectsGameplay(edition)).toBe(false);
    expect(assertEditionLinkedToGameplayCard(edition).ok).toBe(true);
    expect(getCollectibleEdition(edition.editionId)?.grantsGameplayPower).toBe(false);
  });

  it("only grants entitlements when settlement is FINALIZED", () => {
    expect(mayGrantEntitlement("FINALIZED")).toBe(true);
    expect(mayGrantEntitlement("CONFIRMED")).toBe(false);
    expect(canTransitionSettlement("CREATED", "AWAITING_SIGNATURE")).toBe(true);
    expect(canTransitionSettlement("FINALIZED", "SUBMITTED")).toBe(false);
  });

  it("keeps free tournaments and forbids spectator betting", () => {
    expect(FREE_TOURNAMENT_CONFIG.entryCurrency).toBe("FREE");
    expect(FREE_TOURNAMENT_CONFIG.spectatorBetting).toBe(false);
    expect(() => assertNoSpectatorBetting(FREE_TOURNAMENT_CONFIG)).not.toThrow();
  });

  it("defaults SOL economy network away from mainnet", () => {
    expect(getSolEconomyNetwork()).not.toBe("mainnet-beta");
    expect(["devnet", "localnet"]).toContain(getSolEconomyNetwork());
  });
});
