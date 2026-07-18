/**
 * Credit sinks — repair, travel, housing, shops, restoration donations, fees.
 * Restoration donations and marketplace fees leave circulation (burn).
 */

import {
  MARKETPLACE_CREDIT_FEE_BPS,
  NPC_SELL_BACK_BPS,
} from "@/lib/credits/config";
import { creditCredits, debitCredits } from "@/lib/credits/ledger";
import type { CreditMutationResult } from "@/lib/credits/types";

function mulBps(amount: number, bps: number): number {
  return Math.floor((amount * bps) / 10_000);
}

export function spendNpcShop(params: {
  userId: string;
  shopId: string;
  itemId: string;
  price: number;
  requestId: string;
}): CreditMutationResult {
  return debitCredits({
    userId: params.userId,
    amount: params.price,
    reason: "NPC_SHOP_BUY",
    requestId: params.requestId,
    metadata: { shopId: params.shopId, itemId: params.itemId },
  });
}

/** NPC sell-back at NPC_SELL_BACK_BPS with daily caps — blocks buy→sell loops. */
export function sellNpcShopItem(params: {
  userId: string;
  shopId: string;
  itemId: string;
  buyPrice: number;
  requestId: string;
}): CreditMutationResult {
  const amount = mulBps(params.buyPrice, NPC_SELL_BACK_BPS);
  if (amount <= 0) {
    return { ok: false, error: "invalid_amount", message: "Sell-back amount is zero" };
  }
  return creditCredits({
    userId: params.userId,
    amount,
    reason: "NPC_SELL_BACK",
    requestId: params.requestId,
    metadata: {
      sellBack: true,
      shopId: params.shopId,
      itemId: params.itemId,
      buyPrice: params.buyPrice,
      sellBackBps: NPC_SELL_BACK_BPS,
    },
  });
}

export function spendRepair(params: {
  userId: string;
  targetId: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "REPAIR",
    requestId: params.requestId,
    metadata: { targetId: params.targetId },
  });
}

export function spendTravel(params: {
  userId: string;
  fromRegion: string;
  toRegion: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "TRAVEL_FEE",
    requestId: params.requestId,
    metadata: { fromRegion: params.fromRegion, toRegion: params.toRegion },
  });
}

export function spendHousing(params: {
  userId: string;
  plotId: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "HOUSING_FEE",
    requestId: params.requestId,
    metadata: { plotId: params.plotId },
  });
}

export function donateRestoration(params: {
  userId: string;
  milestoneKey: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "RESTORATION_DONATION",
    requestId: params.requestId,
    metadata: { milestoneKey: params.milestoneKey, burn: true },
  });
}

export function spendCraftFee(params: {
  userId: string;
  recipeId: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "CRAFT_FEE",
    requestId: params.requestId,
    metadata: { recipeId: params.recipeId },
  });
}

export function spendMarketplaceListingFee(params: {
  userId: string;
  listingId: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "MARKETPLACE_LISTING_FEE",
    requestId: params.requestId,
    metadata: { listingId: params.listingId },
  });
}

/** Fee taken from sale price — leaves circulation. */
export function takeMarketplaceSaleFee(params: {
  sellerId: string;
  saleId: string;
  priceCredits: number;
  requestId: string;
}): CreditMutationResult & { feeCredits?: number } {
  const fee = Math.max(1, mulBps(params.priceCredits, MARKETPLACE_CREDIT_FEE_BPS));
  const result = debitCredits({
    userId: params.sellerId,
    amount: fee,
    reason: "MARKETPLACE_FEE",
    requestId: params.requestId,
    metadata: {
      saleId: params.saleId,
      priceCredits: params.priceCredits,
      feeBps: MARKETPLACE_CREDIT_FEE_BPS,
      abuseStub: "wash_trade_check_pending",
    },
  });
  return { ...result, feeCredits: fee };
}

export function spendServiceFee(params: {
  userId: string;
  serviceId: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "SERVICE_FEE",
    requestId: params.requestId,
    metadata: { serviceId: params.serviceId },
  });
}

/** Spend Credits on a pet care action (never SOL). Integer amount only. */
export function spendCareAction(params: {
  userId: string;
  petId: string;
  action: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  if (params.amount <= 0) {
    return {
      ok: false,
      error: "invalid_amount",
      message: "Care action cost must be a positive integer",
    };
  }
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "CARE_ACTION",
    requestId: params.requestId,
    metadata: {
      petId: params.petId,
      action: params.action,
      currency: "CREDITS",
      neverSol: true,
    },
  });
}

/** Spend Credits on a care catalog / shop item. */
export function spendCareItem(params: {
  userId: string;
  petId: string;
  itemId: string;
  amount: number;
  requestId: string;
}): CreditMutationResult {
  if (params.amount <= 0) {
    return {
      ok: false,
      error: "invalid_amount",
      message: "Care item cost must be a positive integer",
    };
  }
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "CARE_ITEM",
    requestId: params.requestId,
    metadata: {
      petId: params.petId,
      itemId: params.itemId,
      currency: "CREDITS",
      neverSol: true,
    },
  });
}

/**
 * Spend Credits on a premium hatchery egg (never SOL).
 * Call only after validating free claim is unavailable for this keeper.
 */
export function spendEggPurchase(params: {
  userId: string;
  amount: number;
  requestId: string;
  eggPublicId?: string;
}): CreditMutationResult {
  if (params.amount <= 0) {
    return {
      ok: false,
      error: "invalid_amount",
      message: "Egg purchase cost must be a positive integer",
    };
  }
  return debitCredits({
    userId: params.userId,
    amount: params.amount,
    reason: "EGG_PURCHASE",
    requestId: params.requestId,
    metadata: {
      eggPublicId: params.eggPublicId,
      currency: "CREDITS",
      neverSol: true,
      premiumHatcheryEgg: true,
    },
  });
}

/** Abuse stubs for marketplace — detection hooks only. */
export function marketplaceAbuseStubs(): {
  washTrade: "stub";
  selfTrade: "stub";
  priceSpike: "stub";
  note: string;
} {
  return {
    washTrade: "stub",
    selfTrade: "stub",
    priceSpike: "stub",
    note: "Abuse detectors stubbed — never auto-ban without admin review.",
  };
}
