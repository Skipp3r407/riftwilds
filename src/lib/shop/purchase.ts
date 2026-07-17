/**
 * Shop purchase resolution — Wallet SOL vs In-game / earned SOL.
 * Real chain settlement stays behind SOL_* feature flags.
 */

import { debitEarnedSol } from "@/lib/shop/earned-sol";

export type ShopPaymentMethod = "WALLET_SOL" | "IN_GAME_SOL";

export type WalletSolGate = {
  walletConnected: boolean;
  walletBalanceLamports: bigint | null;
  solItemPurchasesEnabled: boolean;
  solPurchasesEnabled: boolean;
};

export function walletSolSettlementEnabled(gate: Pick<
  WalletSolGate,
  "solItemPurchasesEnabled" | "solPurchasesEnabled"
>): boolean {
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

export type PurchaseResult =
  | {
      ok: true;
      method: ShopPaymentMethod;
      /** Present for in-game settlements. */
      nextEarnedLamports?: bigint;
      /**
       * Wallet path: true only when flags allow and we record a local grant shell.
       * Real chain writes remain Phase 2.
       */
      chainWrite: boolean;
      message: string;
    }
  | { ok: false; reason: string };

/**
 * Resolve a purchase attempt. In-game SOL always settles locally when funded.
 * Wallet SOL never performs a chain write here — when flags are on it records a
 * local grant shell so UX can be exercised safely.
 */
export function resolveShopPurchase(params: {
  method: ShopPaymentMethod;
  priceLamports: bigint;
  earnedLamports: bigint;
  wallet: WalletSolGate;
}): PurchaseResult {
  if (params.priceLamports < 0n) {
    return { ok: false, reason: "Invalid price." };
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
      "Wallet SOL purchase recorded locally (settlement shell). On-chain transfer remains Phase 2.",
  };
}
