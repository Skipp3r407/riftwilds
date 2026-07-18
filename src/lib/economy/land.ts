/**
 * Phase 4 — Land Ownership (Credits claim / transfer).
 */

import { settleDebit, settleEnsureStarter, settleTransfer } from "@/lib/economy/core/settlement";
import { isFeatureEnabled } from "@/lib/config/feature-flags";

export type LandParcel = {
  parcelId: string;
  regionKey: string;
  name: string;
  claimPriceCredits: number;
  ownerUserId: string | null;
  status: "AVAILABLE" | "OWNED";
};

type Store = { parcels: Map<string, LandParcel> };

function seedParcels(): Map<string, LandParcel> {
  const parcels = new Map<string, LandParcel>();
  const seeds: Omit<LandParcel, "ownerUserId" | "status">[] = [
    { parcelId: "land-commons-1", regionKey: "commons", name: "Commons Plot A", claimPriceCredits: 150 },
    { parcelId: "land-commons-2", regionKey: "commons", name: "Commons Plot B", claimPriceCredits: 180 },
    { parcelId: "land-ember-1", regionKey: "ember-crater", name: "Ember Ridge Lot", claimPriceCredits: 320 },
    { parcelId: "land-tide-1", regionKey: "moonwater-coast", name: "Tideflat Parcel", claimPriceCredits: 280 },
  ];
  for (const s of seeds) {
    parcels.set(s.parcelId, { ...s, ownerUserId: null, status: "AVAILABLE" });
  }
  return parcels;
}

function store(): Store {
  const g = globalThis as unknown as { __riftwildsLand?: Store };
  if (!g.__riftwildsLand) {
    g.__riftwildsLand = { parcels: seedParcels() };
  }
  return g.__riftwildsLand;
}

/** Test helper */
export function resetLandStoreForTests(): void {
  const g = globalThis as unknown as { __riftwildsLand?: Store };
  g.__riftwildsLand = { parcels: seedParcels() };
}

export function listLandParcels(): LandParcel[] {
  return [...store().parcels.values()];
}

export function claimLandParcel(params: {
  parcelId: string;
  userId: string;
  requestId: string;
}): { ok: true; parcel: LandParcel } | { ok: false; error: string; message: string } {
  if (!isFeatureEnabled("LAND_OWNERSHIP_ENABLED")) {
    return { ok: false, error: "disabled", message: "Land ownership disabled" };
  }
  const parcel = store().parcels.get(params.parcelId);
  if (!parcel || parcel.status !== "AVAILABLE") {
    return { ok: false, error: "not_available", message: "Parcel not available" };
  }
  settleEnsureStarter(params.userId);
  const debit = settleDebit({
    userId: params.userId,
    amount: parcel.claimPriceCredits,
    reason: "LAND_CLAIM",
    requestId: params.requestId,
    metadata: { parcelId: parcel.parcelId, regionKey: parcel.regionKey },
  });
  if (!debit.ok) {
    return { ok: false, error: debit.error, message: debit.message };
  }
  parcel.ownerUserId = params.userId;
  parcel.status = "OWNED";
  store().parcels.set(parcel.parcelId, parcel);
  return { ok: true, parcel };
}

export function transferLandParcel(params: {
  parcelId: string;
  fromUserId: string;
  toUserId: string;
  priceCredits: number;
  requestId: string;
}): { ok: true; parcel: LandParcel } | { ok: false; error: string; message: string } {
  const parcel = store().parcels.get(params.parcelId);
  if (!parcel || parcel.ownerUserId !== params.fromUserId) {
    return { ok: false, error: "not_owner", message: "Not parcel owner" };
  }
  const fee = Math.max(1, Math.floor((params.priceCredits * 250) / 10_000));
  const t = settleTransfer({
    fromUserId: params.toUserId,
    toUserId: params.fromUserId,
    grossAmount: params.priceCredits,
    feeAmount: fee,
    buyerRequestId: `${params.requestId}:buyer`,
    sellerRequestId: `${params.requestId}:seller`,
    feeRequestId: `${params.requestId}:fee`,
    buyReason: "LAND_CLAIM",
    sellReason: "LAND_SALE",
    metadata: { parcelId: params.parcelId },
  });
  if (!t.ok) return { ok: false, error: t.error, message: t.message };
  parcel.ownerUserId = params.toUserId;
  store().parcels.set(parcel.parcelId, parcel);
  return { ok: true, parcel };
}
