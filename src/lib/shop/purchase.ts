/**
 * Shop purchase resolution — Credits (play path), In-game SOL, Wallet SOL (flagged).
 * Real chain settlement stays behind SOL_* feature flags.
 */

import { debitEarnedSol } from "@/lib/shop/earned-sol";
import { lamportsToCreditsPrice } from "@/lib/economy/core/credits-pricing";
import { settleDebit, settleEnsureStarter } from "@/lib/economy/core/settlement";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type ShopPaymentMethod = "CREDITS" | "WALLET_SOL" | "IN_GAME_SOL";

export type WalletSolGate = {
  walletConnected: boolean;
  walletBalanceLamports: bigint | null;
  solItemPurchasesEnabled: boolean;
  solPurchasesEnabled: boolean;
};

export function walletSolSettlementEnabled(
  gate: Pick<WalletSolGate, "solItemPurchasesEnabled" | "solPurchasesEnabled">,
): boolean {
  return gate.solItemPurchasesEnabled && gate.solPurchasesEnabled;
}

export function evaluateWalletSolPurchase(
  gate: WalletSolGate,
  priceLamports: bigint,
): { ok: true } | { ok: false; reason: string } {
  if (!walletSolSettlementEnabled(gate)) {
    return {
      ok: false,
      reason:
        "Wallet SOL checkout is gated off (SOL_ITEM_PURCHASES_ENABLED / SOL_PURCHASES_ENABLED).",
    };
  }
  if (!gate.walletConnected) {
    return { ok: false, reason: "Connect a Solana wallet to pay with Wallet SOL." };
  }
  if (gate.walletBalanceLamports != null && gate.walletBalanceLamports < priceLamports) {
    return { ok: false, reason: "Insufficient Wallet SOL for this item." };
  }
  return { ok: true };
}

export function evaluateInGameSolPurchase(
  balanceLamports: bigint,
  priceLamports: bigint,
): { ok: true } | { ok: false; reason: string } {
  const debit = debitEarnedSol(balanceLamports, priceLamports);
  if (!debit.ok) {
    return { ok: false, reason: "Insufficient In-game SOL for this item." };
  }
  return { ok: true };
}

export function evaluateCreditsPurchase(
  balance: number,
  priceCredits: number,
): { ok: true } | { ok: false; reason: string } {
  if (!isFeatureEnabled("SHOP_CREDITS_CHECKOUT_ENABLED")) {
    return { ok: false, reason: "Credits shop checkout is disabled." };
  }
  if (!Number.isInteger(priceCredits) || priceCredits < 1) {
    return { ok: false, reason: "Invalid Credits price." };
  }
  if (balance < priceCredits) {
    return { ok: false, reason: "Insufficient Credits for this item." };
  }
  return { ok: true };
}

export type PurchaseResult =
  | {
      ok: true;
      method: ShopPaymentMethod;
      nextEarnedLamports?: bigint;
      nextCreditsBalance?: number;
      /**
       * Wallet path: true only when flags allow and we record a local grant shell.
       * Real chain writes remain Phase 15.
       */
      chainWrite: boolean;
      message: string;
    }
  | { ok: false; reason: string };

/**
 * Resolve a purchase attempt.
 * Credits = required play path (server-authoritative when called via API).
 * In-game SOL settles locally when funded.
 * Wallet SOL never performs a chain write here.
 */
export function resolveShopPurchase(params: {
  method: ShopPaymentMethod;
  priceLamports: bigint;
  earnedLamports: bigint;
  wallet: WalletSolGate;
  /** Required when method is CREDITS (client preview or server settle). */
  creditsBalance?: number;
  priceCredits?: number;
  userId?: string;
  requestId?: string;
  itemId?: string;
  /** When true, debit Credits ledger (server). Client preview should pass false. */
  settleCredits?: boolean;
}): PurchaseResult {
  if (params.priceLamports < 0n) {
    return { ok: false, reason: "Invalid price." };
  }

  if (params.method === "CREDITS") {
    const priceCredits =
      params.priceCredits ?? lamportsToCreditsPrice(params.priceLamports);
    const balance = params.creditsBalance ?? 0;
    const check = evaluateCreditsPurchase(balance, priceCredits);
    if (!check.ok) return check;

    if (params.settleCredits) {
      if (!params.userId || !params.requestId) {
        return { ok: false, reason: "Credits settle requires userId and requestId." };
      }
      settleEnsureStarter(params.userId);
      const debit = settleDebit({
        userId: params.userId,
        amount: priceCredits,
        reason: "SHOP_BUY",
        requestId: params.requestId,
        metadata: { itemId: params.itemId, method: "CREDITS" },
      });
      if (!debit.ok) {
        return { ok: false, reason: debit.message };
      }
      return {
        ok: true,
        method: "CREDITS",
        nextCreditsBalance: debit.balance,
        chainWrite: false,
        message: "Purchased with Credits. Item added to your inventory.",
      };
    }

    return {
      ok: true,
      method: "CREDITS",
      nextCreditsBalance: balance - priceCredits,
      chainWrite: false,
      message: "Credits purchase ready — confirm via server checkout.",
    };
  }

  if (params.method === "IN_GAME_SOL") {
    const debit = debitEarnedSol(params.earnedLamports, params.priceLamports);
    if (!debit.ok) {
      return { ok: false, reason: "Insufficient In-game SOL for this item." };
    }
    return {
      ok: true,
      method: "IN_GAME_SOL",
      nextEarnedLamports: debit.next,
      chainWrite: false,
      message: "Purchased with In-game SOL. Item added to your inventory.",
    };
  }

  const walletCheck = evaluateWalletSolPurchase(params.wallet, params.priceLamports);
  if (!walletCheck.ok) {
    return { ok: false, reason: walletCheck.reason };
  }

  return {
    ok: true,
    method: "WALLET_SOL",
    chainWrite: false,
    message:
      "Wallet SOL purchase recorded locally (settlement shell). On-chain transfer remains flagged off.",
  };
}
