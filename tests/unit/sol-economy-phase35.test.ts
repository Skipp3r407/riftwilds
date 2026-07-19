import { describe, expect, it, beforeEach } from "vitest";
import { featureFlagDefaults } from "@/lib/config/feature-flags";
import {
  allSolEconomyFlagsOff,
  createPurchaseOrder,
  preparePurchaseOrder,
  verifyPurchaseSimulation,
  resetPurchaseOrdersForTests,
  resetSettlementOrdersForTests,
  resetEconomyLedgerForTests,
  resetEntitlementsForTests,
  resetCollectibleEditionsForTests,
  listEntitlements,
  listCollectibleEditionBrowser,
  getSolMarketplaceFeeDisplayStub,
  getWalletCenterSnapshot,
  FREE_TOURNAMENT_CONFIG,
  registerTournamentEntry,
  beginSolMarketplacePurchase,
  getSolEconomyNetwork,
  COLLECTIBLE_EDITION_CATALOG,
} from "@/lib/economy/sol";

describe("SOL economy phase 3–5 depth", () => {
  beforeEach(() => {
    resetPurchaseOrdersForTests();
    resetSettlementOrdersForTests();
    resetEconomyLedgerForTests();
    resetEntitlementsForTests();
    resetCollectibleEditionsForTests();
  });

  it("keeps every SOL_* mandate flag false", () => {
    expect(allSolEconomyFlagsOff()).toBe(true);
    expect(featureFlagDefaults.SOL_WALLET_ENABLED).toBe(false);
    expect(featureFlagDefaults.SOL_PURCHASES_ENABLED).toBe(false);
    expect(featureFlagDefaults.SOL_MARKETPLACE_ENABLED).toBe(false);
    expect(featureFlagDefaults.SOL_TOURNAMENTS_ENABLED).toBe(false);
  });

  it("runs soft purchase create → prepare → verify with idempotent entitlement", () => {
    const created = createPurchaseOrder({
      userId: "u-sim",
      sku: "cosmetic-card-back-aurora",
      requestId: "req-sim-1",
    });
    expect(created.ok).toBe(true);
    if (!created.ok) return;
    expect(created.order.mode).toBe("SOFT_SIMULATION");
    expect(created.order.network).not.toBe("mainnet-beta");

    const prepared = preparePurchaseOrder({ orderId: created.order.orderId });
    expect(prepared.ok).toBe(true);
    if (!prepared.ok) return;
    expect(prepared.order.preparedPayload?.lamports).toBe(created.order.priceLamports);

    const verified = verifyPurchaseSimulation({ orderId: created.order.orderId });
    expect(verified.ok).toBe(true);
    if (!verified.ok) return;
    expect(verified.simulated).toBe(true);
    expect(verified.order.state).toBe("FINALIZED");
    expect(verified.order.verifiedTxSignature?.startsWith("sim_devnet_")).toBe(true);
    expect(verified.entitlement?.id).toBeTruthy();

    const replay = verifyPurchaseSimulation({ orderId: created.order.orderId });
    expect(replay.ok).toBe(true);
    if (!replay.ok) return;
    expect(replay.idempotentReplay).toBe(true);

    const ents = listEntitlements("u-sim");
    expect(ents.filter((e) => e.requestId === "ent_po_req-sim-1")).toHaveLength(1);
  });

  it("rejects unknown SKU and blocks SOL marketplace purchase while flags off", () => {
    const bad = createPurchaseOrder({
      userId: "u1",
      sku: "does-not-exist",
      requestId: "req-bad",
    });
    expect(bad.ok).toBe(false);

    const market = beginSolMarketplacePurchase({
      buyerUserId: "u1",
      listingId: "x",
      priceLamports: 1_000_000_000n,
      requestId: "m1",
    });
    expect(market.ok).toBe(false);
    if (!market.ok) expect(market.error).toBe("sol_marketplace_disabled");
  });

  it("exposes collectible browser rows linked to TCG art without gameplay power", () => {
    const rows = listCollectibleEditionBrowser({ userId: "u-col" });
    expect(rows.length).toBe(COLLECTIBLE_EDITION_CATALOG.length);
    expect(rows.every((r) => r.grantsGameplayPower === false)).toBe(true);
    expect(rows.every((r) => r.gameplayCardId.startsWith("rotr-"))).toBe(true);
    expect(rows.some((r) => r.imagePath?.includes("/assets/tcg/cards/"))).toBe(true);
  });

  it("shows wallet center soft snapshot with SOL UX disabled", () => {
    const snap = getWalletCenterSnapshot({
      userId: "u-wallet",
      walletAddress: null,
    });
    expect(snap.connection.optional).toBe(true);
    expect(snap.connection.solWalletUxEnabled).toBe(false);
    expect(snap.connection.statusLabel).toBe("disabled_coming_soon");
    expect(snap.network).toBe(getSolEconomyNetwork());
    expect(snap.marketplaceStatus).toBe("BLOCKED");
    expect(snap.security.neverAskForSeedPhrase).toBe(true);
    expect(snap.security.productionPurchasesDisabled).toBe(true);
  });

  it("polishes SOL fee display stub while settlement stays blocked", () => {
    const stub = getSolMarketplaceFeeDisplayStub(1_000_000_000n);
    expect(stub.live).toBe(false);
    expect(stub.blockedReason).toMatch(/blocked/i);
    expect(stub.preview.sellerPercent + stub.preview.platformPercent).toBeGreaterThan(0);
    expect(stub.disclosures.length).toBeGreaterThan(3);
  });

  it("keeps free tournaments available and rejects SOL entry", () => {
    expect(FREE_TOURNAMENT_CONFIG.entryCurrency).toBe("FREE");
    const sol = registerTournamentEntry({
      tournamentId: "tourney-sol-example",
      userId: "u1",
      requestId: "t1",
      entryCurrency: "SOL",
    });
    expect(sol.ok).toBe(false);
    if (!sol.ok) expect(sol.error).toBe("sol_tournaments_disabled");
  });
});
