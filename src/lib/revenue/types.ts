export type RevenueTransactionType =
  | "SHOP_PURCHASE"
  | "MARKETPLACE_SALE"
  | "CRAFTING_FEE"
  | "UPGRADE_FEE"
  | "LISTING_FEE"
  | "NAME_CHANGE_FEE"
  | "INVENTORY_EXPANSION"
  | "LOADOUT_SLOT"
  | "SEASONAL_PASS"
  | "OTHER";

export type AllocationDestination =
  | "SELLER"
  | "GROWTH_RESERVE"
  | "PET_HOLDER_REWARD_VAULT"
  | "OPERATIONS"
  | "COMMUNITY_EVENTS"
  | "EMERGENCY_RESERVE";

export type TreasuryVaultKey =
  | "PAYMENT_COLLECTION_VAULT"
  | "GROWTH_RESERVE_VAULT"
  | "PET_HOLDER_REWARD_VAULT"
  | "OPERATIONS_VAULT"
  | "COMMUNITY_EVENT_VAULT"
  | "MARKETPLACE_ESCROW_VAULT"
  | "EMERGENCY_RESERVE_VAULT";

export type PolicyEntry = {
  destination: AllocationDestination;
  basisPoints: number;
  label: string;
  color: string;
  displayOrder: number;
};

export type RevenueAllocationPolicy = {
  id: string;
  name: string;
  transactionType: RevenueTransactionType;
  version: number;
  status: "live" | "demo" | "proposed" | "scheduled";
  effectiveFrom: string;
  effectiveUntil: string | null;
  totalBasisPoints: number;
  remainderDestination: AllocationDestination;
  entries: PolicyEntry[];
  reason: string;
};

export type AllocationLine = {
  destination: AllocationDestination;
  label: string;
  basisPoints: number;
  /** Floor allocation before remainder */
  calculatedAmountLamports: bigint;
  roundingAdjustmentLamports: bigint;
  allocatedAmountLamports: bigint;
  color: string;
};

export type AllocationResult = {
  policyId: string;
  policyVersion: number;
  transactionType: RevenueTransactionType;
  grossLamports: bigint;
  lines: AllocationLine[];
  remainderLamports: bigint;
  remainderDestination: AllocationDestination;
};

export type LedgerEntryDraft = {
  policyVersion: number;
  transactionType: RevenueTransactionType;
  destination: AllocationDestination;
  rawGrossAmountLamports: string;
  basisPoints: number;
  allocatedAmountLamports: string;
  roundingAdjustmentLamports: string;
  assetMint: string;
  network: string;
  status: "RECORDED";
};
