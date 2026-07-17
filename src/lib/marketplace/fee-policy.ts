/**
 * Marketplace fee policies for pets/eggs and items.
 * Aligns with `src/lib/revenue/policies.ts` MARKETPLACE_SALE 90/5/3/1/1.
 */

import { getActivePolicy, bpsToPercentLabel } from "@/lib/revenue/policies";
import { allocateForTransactionType, serializeAllocation } from "@/lib/revenue/allocate";
import { LISTING_RULES } from "@/lib/marketplace/listing-rules";
import { solToLamports } from "@/lib/items/lamports";
import type { AllocationResult } from "@/lib/revenue/types";

export const MARKETPLACE_FEE_POLICY = {
  petsAndEggs: {
    sellerBps: 9000,
    projectReserveBps: 500,
    holderRewardsBps: 300,
    opsBps: 100,
    communityEventsBps: 100,
    /** Total non-seller fee = 10% (within 5–10% band). */
    totalFeeBps: 1000,
  },
  /** Items may use a lighter ~5% total fee (seller 95%). */
  items: {
    sellerBps: 9500,
    projectReserveBps: 250,
    holderRewardsBps: 150,
    opsBps: 50,
    communityEventsBps: 50,
    totalFeeBps: 500,
  },
  listingFeeLamports: LISTING_RULES.listingFeeLamports,
} as const;

export function saleAllocationForPetsAndEggs(priceLamports: bigint): AllocationResult {
  return allocateForTransactionType(priceLamports, "MARKETPLACE_SALE");
}

export function saleAllocationForItems(priceLamports: bigint): {
  seller: bigint;
  projectReserve: bigint;
  holderRewards: bigint;
  ops: bigint;
  communityEvents: bigint;
} {
  const p = MARKETPLACE_FEE_POLICY.items;
  const seller = (priceLamports * BigInt(p.sellerBps)) / 10_000n;
  const projectReserve = (priceLamports * BigInt(p.projectReserveBps)) / 10_000n;
  const holderRewards = (priceLamports * BigInt(p.holderRewardsBps)) / 10_000n;
  const ops = (priceLamports * BigInt(p.opsBps)) / 10_000n;
  const communityEvents = priceLamports - seller - projectReserve - holderRewards - ops;
  return { seller, projectReserve, holderRewards, ops, communityEvents };
}

export function serializeMarketplaceFeePolicy() {
  const sale = getActivePolicy("MARKETPLACE_SALE");
  const listing = getActivePolicy("LISTING_FEE");
  return {
    petsAndEggs: {
      ...MARKETPLACE_FEE_POLICY.petsAndEggs,
      labels: sale.entries.map((e) => ({
        destination: e.destination,
        percent: bpsToPercentLabel(e.basisPoints),
      })),
      policyId: sale.id,
    },
    items: {
      ...MARKETPLACE_FEE_POLICY.items,
      note: "Item marketplace fee uses a lighter ~5% total fee until a dedicated revenue policy version is published.",
    },
    listingFee: {
      lamports: LISTING_RULES.listingFeeLamports.toString(),
      sol: "0.002",
      nonRefundable: true,
      listingFeePolicyId: listing.id,
      exampleListingFeeAllocation: serializeAllocation(
        allocateForTransactionType(solToLamports("0.002"), "LISTING_FEE"),
      ),
    },
    band: LISTING_RULES.saleFeePercentBand,
  };
}
