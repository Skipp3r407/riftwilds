/**
 * Marketplace Credits settlement — play path (SOL escrow stays 501 / flagged).
 */

import { MARKETPLACE_CREDIT_FEE_BPS } from "@/lib/credits/config";
import { MARKETPLACE_FEE_POLICY } from "@/lib/marketplace/fee-policy";
import { lamportsToCreditsPrice } from "@/lib/economy/core/credits-pricing";
import {
  settleDebit,
  settleEnsureStarter,
  settleTransfer,
} from "@/lib/economy/core/settlement";
import { getCreditBalance } from "@/lib/credits/ledger";
import type { MarketplaceListingView } from "@/lib/marketplace/types";
import { normalizePlayCurrency } from "@/lib/economy/core/types";

/** Soften SOL→Credits for marketplace so play stays affordable without SOL. */
const MARKETPLACE_CREDITS_SCALE = 50;

export function listingPriceCredits(listing: MarketplaceListingView): number {
  if (typeof (listing as { priceCredits?: number }).priceCredits === "number") {
    return Math.max(10, (listing as { priceCredits: number }).priceCredits);
  }
  const raw = lamportsToCreditsPrice(BigInt(listing.priceLamports));
  return Math.max(10, Math.round(raw / MARKETPLACE_CREDITS_SCALE));
}

export function marketplaceFeeCredits(grossCredits: number, kind: MarketplaceListingView["kind"]): number {
  const bps =
    kind === "ITEM"
      ? MARKETPLACE_FEE_POLICY.items.totalFeeBps
      : Math.max(MARKETPLACE_CREDIT_FEE_BPS, MARKETPLACE_FEE_POLICY.petsAndEggs.totalFeeBps);
  return Math.max(1, Math.floor((grossCredits * bps) / 10_000));
}

export function sellerUserIdFromLabel(sellerLabel: string): string {
  return `mkt-seller:${sellerLabel.replace(/\s+/g, "_").slice(0, 48)}`;
}

export type MarketplaceCreditsPurchaseResult =
  | {
      ok: true;
      mode: "credits";
      priceCredits: number;
      feeCredits: number;
      sellerNet: number;
      buyerBalance: number;
      sellerBalance: number;
      currency: "CREDITS";
    }
  | { ok: false; error: string; message: string; balance?: number };

/**
 * Debit buyer, credit seller net, mark fee burned. Does not mutate listing status —
 * caller runs purchaseRuntimeListing after success (or before with rollback care).
 */
export function settleMarketplaceCreditsPurchase(params: {
  listing: MarketplaceListingView;
  buyerUserId: string;
  requestId: string;
}): MarketplaceCreditsPurchaseResult {
  const currency = normalizePlayCurrency(params.listing.currency);
  if (currency !== "CREDITS") {
    return {
      ok: false,
      error: "unsupported_currency",
      message: "Only Credits marketplace settlement is live",
    };
  }

  const priceCredits = listingPriceCredits(params.listing);
  const feeCredits = Math.min(
    priceCredits - 1,
    marketplaceFeeCredits(priceCredits, params.listing.kind),
  );
  const sellerId = sellerUserIdFromLabel(params.listing.sellerLabel);

  if (params.buyerUserId === sellerId) {
    return { ok: false, error: "same_party", message: "Cannot buy your own listing" };
  }

  settleEnsureStarter(params.buyerUserId);
  settleEnsureStarter(sellerId);

  const transfer = settleTransfer({
    fromUserId: params.buyerUserId,
    toUserId: sellerId,
    grossAmount: priceCredits,
    feeAmount: feeCredits,
    buyerRequestId: `${params.requestId}:buyer`,
    sellerRequestId: `${params.requestId}:seller`,
    feeRequestId: `${params.requestId}:fee`,
    metadata: {
      publicId: params.listing.publicId,
      kind: params.listing.kind,
      title: params.listing.title,
    },
  });

  if (!transfer.ok) {
    return {
      ok: false,
      error: transfer.error,
      message: transfer.message,
      balance: transfer.balance,
    };
  }

  return {
    ok: true,
    mode: "credits",
    priceCredits,
    feeCredits,
    sellerNet: priceCredits - feeCredits,
    buyerBalance: transfer.buyerBalance ?? getCreditBalance(params.buyerUserId),
    sellerBalance: transfer.sellerBalance ?? getCreditBalance(sellerId),
    currency: "CREDITS",
  };
}

export function settleMarketplaceListingFee(params: {
  sellerUserId: string;
  requestId: string;
  listingFeeCredits?: number;
}): { ok: true; balance: number; fee: number } | { ok: false; message: string } {
  const fee = params.listingFeeCredits ?? 25;
  settleEnsureStarter(params.sellerUserId);
  const r = settleDebit({
    userId: params.sellerUserId,
    amount: fee,
    reason: "MARKETPLACE_LISTING_FEE",
    requestId: params.requestId,
    metadata: { kind: "listing_fee" },
  });
  if (!r.ok) return { ok: false, message: r.message };
  return { ok: true, balance: r.balance ?? 0, fee };
}
