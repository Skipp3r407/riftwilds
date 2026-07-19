import { describe, expect, it, beforeEach, afterEach } from "vitest";
import {
  claimStarterEgg,
  grantGameplayEgg,
  hatchEgg,
  resetHatcheryStoreForTests,
} from "@/game/eggs/hatchery-store";
import { grantCompanionCardForSpecies } from "@/game/eggs/companion-card-link";
import { ensureStarterPackage } from "@/game/onboarding/starter-package";
import {
  cosmeticPerksAffectGameplay,
  DEFAULT_COSMETIC_PERK_CONFIG,
  evaluateCosmeticTier,
} from "@/lib/economy/token-cosmetic-perks";
import { __clearTcgCollectionForTests, getCollection } from "@/game/tcg/collection-store";
import { resetCreditLedgerForTests } from "@/lib/credits/ledger";

describe("hatchery F2P alignment", () => {
  beforeEach(() => {
    resetHatcheryStoreForTests();
    resetCreditLedgerForTests();
    __clearTcgCollectionForTests();
  });

  afterEach(() => {
    resetHatcheryStoreForTests();
    __clearTcgCollectionForTests();
  });

  it("starter package is wallet-free and includes messaging", () => {
    const owner = `f2p_${Math.random().toString(16).slice(2)}`;
    const pack = ensureStarterPackage(owner, { autoClaimEgg: true });
    expect(pack.walletRequired).toBe(false);
    expect(pack.freeToPlay).toBe(true);
    expect(pack.starterEgg.claimed).toBe(true);
    expect(pack.starterDeck.ready).toBe(true);
    expect(pack.messaging.some((m) => m.toLowerCase().includes("wallet"))).toBe(true);
  });

  it("gameplay earn grants non-starter eggs", () => {
    const owner = `earn_${Math.random().toString(16).slice(2)}`;
    const egg = grantGameplayEgg(owner, { creationSource: "QUEST", eggType: "EMBER" });
    expect(egg.eggType).toBe("EMBER");
    expect(egg.creationSource).toBe("QUEST");
  });

  it("hatch links companion to binder card when species matches", () => {
    const owner = `link_${Math.random().toString(16).slice(2)}`;
    const egg = claimStarterEgg(owner);
    const reveal = hatchEgg(owner, egg.publicId, { skipWait: true });
    const grant = grantCompanionCardForSpecies(owner, reveal.reveal.speciesSlug);
    const binder = getCollection(owner);
    if (grant.grantedCardIds.length > 0) {
      const id = grant.grantedCardIds[0]!;
      expect(binder.cards.some((c) => c.defId === id && c.count >= 1)).toBe(true);
    }
  });

  it("cosmetic perks never affect gameplay and default off", () => {
    expect(cosmeticPerksAffectGameplay()).toBe(false);
    expect(DEFAULT_COSMETIC_PERK_CONFIG.enabled).toBe(false);
    expect(DEFAULT_COSMETIC_PERK_CONFIG.realPayoutsEnabled).toBe(false);
    expect(evaluateCosmeticTier(1_000_000_000_000n)).toEqual([]);
  });
});
