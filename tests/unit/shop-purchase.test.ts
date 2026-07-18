import { describe, expect, it } from "vitest";
import { solToLamports } from "@/lib/items/lamports";
import {
  canAffordEarnedSol,
  creditEarnedSol,
  debitEarnedSol,
  EARNED_SOL_STARTER_LAMPORTS,
  parseEarnedSolLamports,
  serializeEarnedSolState,
} from "@/lib/shop/earned-sol";
import {
  evaluateWalletSolPurchase,
  resolveShopPurchase,
  walletSolSettlementEnabled,
} from "@/lib/shop/purchase";
import {
  DEMO_STARTER_INVENTORY,
  grantDemoInventoryItem,
} from "@/lib/shop/demo-inventory";
import { getShopSectionItems, SHOP_SECTIONS } from "@/lib/shop/sections";
import { featureFlagDefaults } from "@/lib/config/feature-flags";

describe("earned SOL balance", () => {
  it("starts with a playable starter balance", () => {
    expect(EARNED_SOL_STARTER_LAMPORTS).toBe(solToLamports("0.25"));
    expect(canAffordEarnedSol(EARNED_SOL_STARTER_LAMPORTS, solToLamports("0.002"))).toBe(true);
  });

  it("debits and credits without float math", () => {
    const price = solToLamports("0.05");
    const debit = debitEarnedSol(solToLamports("0.25"), price);
    expect(debit.ok).toBe(true);
    if (debit.ok) {
      expect(debit.next).toBe(solToLamports("0.20"));
      expect(creditEarnedSol(debit.next, solToLamports("0.02"))).toBe(solToLamports("0.22"));
    }
    expect(debitEarnedSol(solToLamports("0.01"), price).ok).toBe(false);
  });

  it("round-trips localStorage payload", () => {
    const raw = serializeEarnedSolState(solToLamports("1.5"), "2026-01-01T00:00:00.000Z");
    expect(parseEarnedSolLamports(raw)).toBe(solToLamports("1.5"));
  });
});

describe("shop purchase resolution", () => {
  const price = solToLamports("0.01");

  it("settles in-game SOL and rejects insufficient funds", () => {
    const ok = resolveShopPurchase({
      method: "IN_GAME_SOL",
      priceLamports: price,
      earnedLamports: solToLamports("0.25"),
      wallet: {
        walletConnected: false,
        walletBalanceLamports: null,
        solItemPurchasesEnabled: false,
        solPurchasesEnabled: false,
      },
    });
    expect(ok.ok).toBe(true);
    if (ok.ok) {
      expect(ok.chainWrite).toBe(false);
      expect(ok.nextEarnedLamports).toBe(solToLamports("0.24"));
    }

    const fail = resolveShopPurchase({
      method: "IN_GAME_SOL",
      priceLamports: price,
      earnedLamports: solToLamports("0.001"),
      wallet: {
        walletConnected: true,
        walletBalanceLamports: solToLamports("10"),
        solItemPurchasesEnabled: true,
        solPurchasesEnabled: true,
      },
    });
    expect(fail.ok).toBe(false);
  });

  it("gates wallet SOL when flags are off", () => {
    expect(
      walletSolSettlementEnabled({
        solItemPurchasesEnabled: featureFlagDefaults.SOL_ITEM_PURCHASES_ENABLED,
        solPurchasesEnabled: featureFlagDefaults.SOL_PURCHASES_ENABLED,
      }),
    ).toBe(false);

    const gated = evaluateWalletSolPurchase(
      {
        walletConnected: true,
        walletBalanceLamports: solToLamports("5"),
        solItemPurchasesEnabled: false,
        solPurchasesEnabled: false,
      },
      price,
    );
    expect(gated.ok).toBe(false);

    const shell = resolveShopPurchase({
      method: "WALLET_SOL",
      priceLamports: price,
      earnedLamports: solToLamports("0"),
      wallet: {
        walletConnected: true,
        walletBalanceLamports: solToLamports("5"),
        solItemPurchasesEnabled: true,
        solPurchasesEnabled: true,
      },
    });
    expect(shell.ok).toBe(true);
    if (shell.ok) {
      expect(shell.chainWrite).toBe(false);
      expect(shell.message.toLowerCase()).toContain("flagged off");
    }
  });
});

describe("shop sections + inventory grant", () => {
  it("exposes a purchasable section per category", () => {
    expect(SHOP_SECTIONS.map((s) => s.id)).toEqual([
      "featured",
      "weapons",
      "armor",
      "potions",
      "magic",
      "materials",
      "cosmetics",
      "recovery",
    ]);
    for (const section of SHOP_SECTIONS) {
      const items = getShopSectionItems(section.id);
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]?.price.lamports).toMatch(/^\d+$/);
    }
  });

  it("grants purchased items into demo inventory", () => {
    const next = grantDemoInventoryItem(DEMO_STARTER_INVENTORY, {
      id: "ember-talons",
      name: "Ember Talons",
      family: "WEAPON",
      rarity: "UNCOMMON",
      iconPath: "/assets/items/weapons/icons/ember-talons.png",
    });
    expect(next.find((r) => r.id === "ember-talons")?.quantity).toBe(1);
    const stacked = grantDemoInventoryItem(next, {
      id: "ember-talons",
      name: "Ember Talons",
      family: "WEAPON",
      rarity: "UNCOMMON",
      iconPath: "/assets/items/weapons/icons/ember-talons.png",
    });
    expect(stacked.find((r) => r.id === "ember-talons")?.quantity).toBe(2);
  });
});
