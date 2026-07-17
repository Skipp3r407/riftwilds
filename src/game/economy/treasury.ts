import { economyConfig } from "@/lib/config/economy";
import { marketplaceFee } from "@/game/economy/hatch-odds";

export type MarketplaceSettlement = {
  priceCredits: number;
  feeCredits: number;
  treasuryCredits: number;
  sellerProceedsCredits: number;
  feeBps: number;
};

/**
 * Split a marketplace sale into fee, treasury credit, and seller proceeds.
 * All values are integer credits (no floats).
 */
export function settleMarketplaceSale(
  priceCredits: number,
  feeBps: number = economyConfig.MARKETPLACE_FEE_BPS,
  treasuryShareBps: number = economyConfig.TREASURY_FEE_SHARE_BPS,
): MarketplaceSettlement {
  if (!Number.isInteger(priceCredits) || priceCredits < 0) {
    throw new Error("priceCredits must be a non-negative integer");
  }
  const feeCredits = marketplaceFee(priceCredits, feeBps);
  const treasuryCredits = Math.floor((feeCredits * treasuryShareBps) / 10000);
  const sellerProceedsCredits = priceCredits - feeCredits;
  return {
    priceCredits,
    feeCredits,
    treasuryCredits,
    sellerProceedsCredits,
    feeBps,
  };
}

export type TreasuryLedgerEntry = {
  reason: "MARKETPLACE_FEE" | "SHOP_PURCHASE" | "EPOCH_FUNDING" | "EVENT_SPEND" | "ADJUSTMENT";
  delta: number;
  balanceAfter: number;
  requestId: string;
  metadata?: Record<string, string | number | boolean>;
};

export function applyTreasuryCredit(
  currentBalance: number,
  credit: number,
  requestId: string,
  reason: TreasuryLedgerEntry["reason"] = "MARKETPLACE_FEE",
): TreasuryLedgerEntry {
  if (!Number.isInteger(currentBalance) || !Number.isInteger(credit)) {
    throw new Error("Treasury amounts must be integers");
  }
  if (credit < 0) throw new Error("Use a debit helper for negative amounts");
  const balanceAfter = currentBalance + credit;
  return {
    reason,
    delta: credit,
    balanceAfter,
    requestId,
  };
}
