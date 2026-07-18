/**
 * Phase 11 — Player Shops (Credits storefronts).
 */

import { settleDebit, settleEnsureStarter, settleTransfer } from "@/lib/economy/core/settlement";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type PlayerShopListing = {
  listingId: string;
  itemKey: string;
  priceCredits: number;
  quantity: number;
};

export type PlayerShop = {
  publicId: string;
  ownerUserId: string;
  name: string;
  listings: PlayerShopListing[];
  status: "OPEN" | "CLOSED";
};

type Store = { shops: Map<string, PlayerShop>; byOwner: Map<string, string> };

function store(): Store {
  const g = globalThis as unknown as { __riftwildsPlayerShops?: Store };
  if (!g.__riftwildsPlayerShops) {
    g.__riftwildsPlayerShops = { shops: new Map(), byOwner: new Map() };
  }
  return g.__riftwildsPlayerShops;
}

/** Test helper */
export function resetPlayerShopsForTests(): void {
  const g = globalThis as unknown as { __riftwildsPlayerShops?: Store };
  g.__riftwildsPlayerShops = { shops: new Map(), byOwner: new Map() };
}

export const PLAYER_SHOP_OPEN_FEE = 50;
export const PLAYER_SHOP_FEE_BPS = 300;

export function openPlayerShop(params: {
  userId: string;
  name: string;
  requestId: string;
}): { ok: true; shop: PlayerShop } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("PLAYER_SHOPS_ENABLED")) {
    return { ok: false, error: "disabled", message: "Player shops disabled" };
  }
  if (store().byOwner.has(params.userId)) {
    return { ok: false, error: "exists", message: "Shop already open" };
  }
  settleEnsureStarter(params.userId);
  const debit = settleDebit({
    userId: params.userId,
    amount: PLAYER_SHOP_OPEN_FEE,
    reason: "PLAYER_SHOP_FEE",
    requestId: params.requestId,
    metadata: { action: "open_shop" },
  });
  if (!debit.ok) return { ok: false, error: debit.error, message: debit.message };
  const publicId = `pshop_${Date.now().toString(36)}`;
  const shop: PlayerShop = {
    publicId,
    ownerUserId: params.userId,
    name: params.name.slice(0, 40),
    listings: [],
    status: "OPEN",
  };
  store().shops.set(publicId, shop);
  store().byOwner.set(params.userId, publicId);
  return { ok: true, shop };
}

export function listInPlayerShop(params: {
  ownerUserId: string;
  itemKey: string;
  priceCredits: number;
  quantity: number;
}): { ok: true; shop: PlayerShop } | { ok: false; error: string; message: string } {
  const id = store().byOwner.get(params.ownerUserId);
  const shop = id ? store().shops.get(id) : null;
  if (!shop || shop.status !== "OPEN") {
    return { ok: false, error: "no_shop", message: "Open a shop first" };
  }
  if (!Number.isInteger(params.priceCredits) || params.priceCredits < 5) {
    return { ok: false, error: "invalid_price", message: "Invalid price" };
  }
  shop.listings.push({
    listingId: `pl_${Date.now().toString(36)}`,
    itemKey: params.itemKey,
    priceCredits: params.priceCredits,
    quantity: Math.max(1, Math.floor(params.quantity)),
  });
  store().shops.set(shop.publicId, shop);
  return { ok: true, shop };
}

export function buyFromPlayerShop(params: {
  shopPublicId: string;
  listingId: string;
  buyerUserId: string;
  requestId: string;
}): { ok: true; priceCredits: number; fee: number } | { ok: false; error: string; message: string } {
  const shop = store().shops.get(params.shopPublicId);
  if (!shop || shop.status !== "OPEN") {
    return { ok: false, error: "not_found", message: "Shop not found" };
  }
  const listing = shop.listings.find((l) => l.listingId === params.listingId);
  if (!listing || listing.quantity < 1) {
    return { ok: false, error: "not_available", message: "Listing unavailable" };
  }
  if (shop.ownerUserId === params.buyerUserId) {
    return { ok: false, error: "same_party", message: "Cannot buy from own shop" };
  }
  const fee = Math.max(1, Math.floor((listing.priceCredits * PLAYER_SHOP_FEE_BPS) / 10_000));
  const t = settleTransfer({
    fromUserId: params.buyerUserId,
    toUserId: shop.ownerUserId,
    grossAmount: listing.priceCredits,
    feeAmount: fee,
    buyerRequestId: `${params.requestId}:buyer`,
    sellerRequestId: `${params.requestId}:seller`,
    feeRequestId: `${params.requestId}:fee`,
    buyReason: "SHOP_BUY",
    sellReason: "PLAYER_SHOP_SALE",
    feeReason: "PLAYER_SHOP_FEE",
    metadata: { shopId: shop.publicId, itemKey: listing.itemKey },
  });
  if (!t.ok) return { ok: false, error: t.error, message: t.message };
  listing.quantity -= 1;
  store().shops.set(shop.publicId, shop);
  return { ok: true, priceCredits: listing.priceCredits, fee };
}

export function listOpenPlayerShops(): PlayerShop[] {
  return [...store().shops.values()].filter((s) => s.status === "OPEN");
}
