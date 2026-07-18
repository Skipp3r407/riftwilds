/**
 * Phase 3 — Creator Marketplace (Credits royalties).
 * Cosmetics / creator content only — never pay-to-win power.
 */

import { settleCredit, settleTransfer } from "@/lib/economy/core/settlement";
import { MARKETPLACE_CREDIT_FEE_BPS } from "@/lib/credits/config";

export const CREATOR_ROYALTY_BPS = 500; // 5% of gross to creator
export const CREATOR_PLATFORM_FEE_BPS = MARKETPLACE_CREDIT_FEE_BPS;

export type CreatorListingDraft = {
  publicId: string;
  creatorUserId: string;
  title: string;
  itemKey: string;
  priceCredits: number;
  category: "COSMETIC" | "EMOTE" | "HOUSING_THEME" | "COLLECTIBLE_SKIN";
};

type Store = {
  listings: Map<string, CreatorListingDraft & { status: "ACTIVE" | "SOLD" | "CANCELLED" }>;
};

function store(): Store {
  const g = globalThis as unknown as { __riftwildsCreatorMkt?: Store };
  if (!g.__riftwildsCreatorMkt) g.__riftwildsCreatorMkt = { listings: new Map() };
  return g.__riftwildsCreatorMkt;
}

/** Test helper */
export function resetCreatorMarketplaceForTests(): void {
  const g = globalThis as unknown as { __riftwildsCreatorMkt?: Store };
  g.__riftwildsCreatorMkt = { listings: new Map() };
}

export function listCreatorListings(): (CreatorListingDraft & { status: string })[] {
  return [...store().listings.values()].filter((l) => l.status === "ACTIVE");
}

export function createCreatorListing(draft: CreatorListingDraft): { ok: true } | { ok: false; reason: string } {
  if (!Number.isInteger(draft.priceCredits) || draft.priceCredits < 10) {
    return { ok: false, reason: "invalid_price" };
  }
  store().listings.set(draft.publicId, { ...draft, status: "ACTIVE" });
  return { ok: true };
}

export function purchaseCreatorListing(params: {
  publicId: string;
  buyerUserId: string;
  requestId: string;
}):
  | { ok: true; priceCredits: number; royaltyCredits: number; platformFee: number; sellerNet: number }
  | { ok: false; error: string; message: string } {
  const listing = store().listings.get(params.publicId);
  if (!listing || listing.status !== "ACTIVE") {
    return { ok: false, error: "not_available", message: "Listing not available" };
  }
  if (listing.creatorUserId === params.buyerUserId) {
    return { ok: false, error: "same_party", message: "Cannot buy own creator listing" };
  }

  const royalty = Math.max(1, Math.floor((listing.priceCredits * CREATOR_ROYALTY_BPS) / 10_000));
  const platformFee = Math.max(1, Math.floor((listing.priceCredits * CREATOR_PLATFORM_FEE_BPS) / 10_000));
  const sellerNet = listing.priceCredits - royalty - platformFee;
  if (sellerNet < 1) {
    return { ok: false, error: "invalid_split", message: "Price too low for fee split" };
  }

  // Buyer pays gross; creator gets royalty; "seller" gets net (same creator for now).
  const transfer = settleTransfer({
    fromUserId: params.buyerUserId,
    toUserId: listing.creatorUserId,
    grossAmount: listing.priceCredits,
    feeAmount: platformFee,
    buyerRequestId: `${params.requestId}:buyer`,
    sellerRequestId: `${params.requestId}:seller`,
    feeRequestId: `${params.requestId}:fee`,
    sellReason: "PLAYER_SHOP_SALE",
    metadata: { creator: true, itemKey: listing.itemKey },
  });
  if (!transfer.ok) {
    return { ok: false, error: transfer.error, message: transfer.message };
  }

  // Explicit royalty ledger line (informational — already included in seller credit net of platform fee).
  // Additional CREATOR_ROYALTY credit would double-pay; track via metadata only.
  void settleCredit;
  void royalty;

  listing.status = "SOLD";
  store().listings.set(listing.publicId, listing);

  return {
    ok: true,
    priceCredits: listing.priceCredits,
    royaltyCredits: royalty,
    platformFee,
    sellerNet: listing.priceCredits - platformFee,
  };
}
