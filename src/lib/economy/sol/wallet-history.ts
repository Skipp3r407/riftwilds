/**
 * Wallet Center transaction history stub — soft/devnet only.
 * Never surfaces private keys or seed phrases.
 */

import { featureFlagDefaults } from "@/lib/config/feature-flags";
import { listOwnedCollectibleEditions } from "@/lib/economy/sol/collectible-editions";
import {
  isSolMarketplaceLive,
  isSolMintingLive,
  solFlagDefaults,
} from "@/lib/economy/sol/flags";
import { listEconomyLedgerForUser, type EconomyLedgerEntry } from "@/lib/economy/sol/ledger";
import { DEFAULT_SPENDING_LIMITS } from "@/lib/economy/sol/policy/spending-limits";
import { listPurchaseOrders, type PurchaseOrder } from "@/lib/economy/sol/purchase-orders";
import {
  getSolEconomyNetwork,
  isWalletSolUxEnabled,
} from "@/lib/economy/sol/wallet-challenge";

export type WalletHistoryRow = {
  id: string;
  category: string;
  status: string;
  currency: string | null;
  amount: string | null;
  createdAt: string;
  note: string;
};

function orderToRow(order: PurchaseOrder): WalletHistoryRow {
  return {
    id: order.orderId,
    category: "PURCHASE_ORDER",
    status: order.state,
    currency: "SOL",
    amount: order.priceLamports,
    createdAt: order.createdAt,
    note: order.note,
  };
}

function ledgerToRow(event: EconomyLedgerEntry): WalletHistoryRow {
  return {
    id: event.id,
    category: event.eventType,
    status: "RECORDED",
    currency: event.currency,
    amount: event.amount,
    createdAt: event.createdAt,
    note: typeof event.metadata.note === "string" ? event.metadata.note : "Ledger event",
  };
}

export function listWalletHistoryStub(userId: string, limit = 20): WalletHistoryRow[] {
  const orders = listPurchaseOrders(userId).map(orderToRow);
  const ledger = listEconomyLedgerForUser(userId).map(ledgerToRow);
  return [...orders, ...ledger]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, limit);
}

export function getWalletCenterSnapshot(params: {
  userId: string;
  walletAddress: string | null;
}) {
  const flags = solFlagDefaults();
  const solUx = isWalletSolUxEnabled();
  const collectibles = listOwnedCollectibleEditions(params.userId);
  const history = listWalletHistoryStub(params.userId);
  const pending = history.filter((h) =>
    ["CREATED", "AWAITING_SIGNATURE", "SUBMITTED", "CONFIRMED"].includes(h.status),
  );

  return {
    connection: {
      optional: true,
      solWalletUxEnabled: solUx,
      siwsIdentityEnabled: featureFlagDefaults.AUTH_WALLET_SIWS_ENABLED,
      connected: Boolean(params.walletAddress),
      walletAddress: params.walletAddress,
      statusLabel: solUx
        ? params.walletAddress
          ? "connected"
          : "ready_to_connect"
        : "disabled_coming_soon",
    },
    network: getSolEconomyNetwork(),
    balance: {
      solReadable: null as string | null,
      note: "Balance reads require wallet permission + RPC; not requested in scaffold.",
    },
    collectibleCount: collectibles.length,
    pendingTransactions: pending,
    recentTransactions: history,
    marketplaceStatus: isSolMarketplaceLive() ? "LIVE" : "BLOCKED",
    mintingStatus: isSolMintingLive() ? "QUEUED_ONLY" : "BLOCKED",
    spendingLimits: {
      dailySol: DEFAULT_SPENDING_LIMITS.dailySolLamports.toString(),
      weeklySol: DEFAULT_SPENDING_LIMITS.weeklySolLamports.toString(),
      perTxSol: DEFAULT_SPENDING_LIMITS.perTxSolLamports.toString(),
    },
    flags,
    security: {
      neverAskForSeedPhrase: true,
      signatureRequiredForSolIntents: true,
      productionPurchasesDisabled: !flags.SOL_PURCHASES_ENABLED,
    },
  };
}
