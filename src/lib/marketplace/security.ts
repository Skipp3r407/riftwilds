/**
 * Marketplace security foundations — validation hooks, rate limits, tx log types.
 * Escrow / anti-bot production systems are NOT claimed complete.
 */

import { verifyListingOwnership, assertUniqueRequestId } from "@/lib/marketplace/integrity";
import { evaluateListability } from "@/lib/marketplace/eligibility";
import { evaluateMarketplaceAbuseStubs } from "@/lib/exchange/anti-abuse";

export type MarketplaceTxLogType =
  | "LISTING_CREATE"
  | "LISTING_CANCEL"
  | "PURCHASE_ATTEMPT"
  | "PURCHASE_SETTLED_DEMO"
  | "OFFER_CREATE"
  | "AUCTION_BID"
  | "TRADE_CONFIRM"
  | "WISHLIST_ADD"
  | "ESCROW_HOLD_STUB"
  | "ESCROW_RELEASE_STUB"
  | "MODERATION_FLAG"
  | "RATE_LIMIT_HIT";

export type MarketplaceTxLogEntry = {
  id: string;
  type: MarketplaceTxLogType;
  at: string;
  actorLabel: string;
  detail: string;
  demo: true;
};

const txLog: MarketplaceTxLogEntry[] = [];
const rateBuckets = new Map<string, { count: number; windowStart: number }>();

export function appendMarketplaceTxLog(
  entry: Omit<MarketplaceTxLogEntry, "id" | "at" | "demo"> & { at?: string },
): MarketplaceTxLogEntry {
  const row: MarketplaceTxLogEntry = {
    id: `mtx_${txLog.length + 1}`,
    type: entry.type,
    at: entry.at ?? new Date().toISOString(),
    actorLabel: entry.actorLabel,
    detail: entry.detail,
    demo: true,
  };
  txLog.unshift(row);
  if (txLog.length > 200) txLog.pop();
  return row;
}

export function listMarketplaceTxLog(limit = 40): MarketplaceTxLogEntry[] {
  return txLog.slice(0, limit);
}

/** Soft in-memory rate limit — demo foundation only. */
export function checkMarketplaceRateLimit(
  actorKey: string,
  maxPerMinute = 30,
): { ok: true } | { ok: false; reason: string } {
  const now = Date.now();
  const bucket = rateBuckets.get(actorKey);
  if (!bucket || now - bucket.windowStart > 60_000) {
    rateBuckets.set(actorKey, { count: 1, windowStart: now });
    return { ok: true };
  }
  bucket.count += 1;
  if (bucket.count > maxPerMinute) {
    appendMarketplaceTxLog({
      type: "RATE_LIMIT_HIT",
      actorLabel: actorKey,
      detail: `Exceeded ${maxPerMinute}/min soft cap`,
    });
    return { ok: false, reason: "rate_limited" };
  }
  return { ok: true };
}

export function runListingSecurityGates(input: {
  sellerId: string;
  assetOwnerId: string;
  assetLocked?: boolean;
  listedElsewhere?: boolean;
  requestId?: string;
  category?: string;
  affectsGameplay?: boolean;
  accountBound?: boolean;
  priceLamports?: bigint;
}): { ok: true } | { ok: false; reason: string; signals?: string[] } {
  const rate = checkMarketplaceRateLimit(input.sellerId);
  if (!rate.ok) return rate;

  const ownership = verifyListingOwnership({
    sellerId: input.sellerId,
    assetOwnerId: input.assetOwnerId,
    assetLocked: input.assetLocked,
    listedElsewhere: input.listedElsewhere,
  });
  if (!ownership.ok) return ownership;

  const listability = evaluateListability({
    category: input.category,
    affectsGameplay: input.affectsGameplay,
    accountBound: input.accountBound,
  });
  if (!listability.ok) return { ok: false, reason: listability.class };

  if (input.requestId) {
    const uniq = assertUniqueRequestId(input.requestId);
    if (!uniq.ok) return uniq;
  }

  const abuse = evaluateMarketplaceAbuseStubs({
    sellerId: input.sellerId,
    buyerId: null,
    priceLamports: input.priceLamports,
  });
  const blocks = abuse.filter((s) => s.severity === "block" && s.enforced);
  if (blocks.length) {
    return { ok: false, reason: blocks[0]!.code, signals: blocks.map((b) => b.code) };
  }

  return { ok: true };
}
