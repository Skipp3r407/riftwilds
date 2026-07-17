import type {
  AllocationDestination,
  PolicyEntry,
  RevenueAllocationPolicy,
  RevenueTransactionType,
  TreasuryVaultKey,
} from "@/lib/revenue/types";

const TOTAL_BPS = 10_000;

function assertEntries(entries: PolicyEntry[]): void {
  const sum = entries.reduce((s, e) => s + e.basisPoints, 0);
  if (sum !== TOTAL_BPS) {
    throw new Error(`Allocation entries must sum to ${TOTAL_BPS} bps, got ${sum}`);
  }
}

const SHOP_ENTRIES: PolicyEntry[] = [
  {
    destination: "GROWTH_RESERVE",
    basisPoints: 7000,
    label: "Project Growth Reserve",
    color: "#3de7ff",
    displayOrder: 1,
  },
  {
    destination: "PET_HOLDER_REWARD_VAULT",
    basisPoints: 1500,
    label: "Community Reward Treasury",
    color: "#9b7bff",
    displayOrder: 2,
  },
  {
    destination: "OPERATIONS",
    basisPoints: 1000,
    label: "Development and Operations",
    color: "#ffb84d",
    displayOrder: 3,
  },
  {
    destination: "COMMUNITY_EVENTS",
    basisPoints: 500,
    label: "Community Events",
    color: "#3dffb0",
    displayOrder: 4,
  },
];

const MARKETPLACE_ENTRIES: PolicyEntry[] = [
  {
    destination: "SELLER",
    basisPoints: 9000,
    label: "Seller proceeds",
    color: "#e8eef8",
    displayOrder: 0,
  },
  {
    destination: "GROWTH_RESERVE",
    basisPoints: 500,
    label: "Project Growth Reserve",
    color: "#3de7ff",
    displayOrder: 1,
  },
  {
    destination: "PET_HOLDER_REWARD_VAULT",
    basisPoints: 300,
    label: "Community Reward Treasury",
    color: "#9b7bff",
    displayOrder: 2,
  },
  {
    destination: "OPERATIONS",
    basisPoints: 100,
    label: "Development and Operations",
    color: "#ffb84d",
    displayOrder: 3,
  },
  {
    destination: "COMMUNITY_EVENTS",
    basisPoints: 100,
    label: "Community Events",
    color: "#3dffb0",
    displayOrder: 4,
  },
];

assertEntries(SHOP_ENTRIES);
assertEntries(MARKETPLACE_ENTRIES);

/** Fee-style sources default to shop-style split (no seller). */
function feePolicy(
  type: RevenueTransactionType,
  version: number,
  name: string,
): RevenueAllocationPolicy {
  return {
    id: `policy-${type.toLowerCase()}-v${version}`,
    name,
    transactionType: type,
    version,
    status: "demo",
    effectiveFrom: "2026-07-17T00:00:00.000Z",
    effectiveUntil: null,
    totalBasisPoints: TOTAL_BPS,
    remainderDestination: "GROWTH_RESERVE",
    entries: SHOP_ENTRIES,
    reason: "Launch bootstrap — fee revenue uses shop allocation pattern",
  };
}

export const BOOTSTRAP_POLICIES: RevenueAllocationPolicy[] = [
  {
    id: "policy-shop-purchase-v1",
    name: "Direct Shop Purchase v1",
    transactionType: "SHOP_PURCHASE",
    version: 1,
    status: "demo",
    effectiveFrom: "2026-07-17T00:00:00.000Z",
    effectiveUntil: null,
    totalBasisPoints: TOTAL_BPS,
    remainderDestination: "GROWTH_RESERVE",
    entries: SHOP_ENTRIES,
    reason: "Launch shop allocation 70/15/10/5",
  },
  {
    id: "policy-marketplace-sale-v1",
    name: "Marketplace Sale v1",
    transactionType: "MARKETPLACE_SALE",
    version: 1,
    status: "demo",
    effectiveFrom: "2026-07-17T00:00:00.000Z",
    effectiveUntil: null,
    totalBasisPoints: TOTAL_BPS,
    remainderDestination: "GROWTH_RESERVE",
    entries: MARKETPLACE_ENTRIES,
    reason: "Launch marketplace allocation 90/5/3/1/1",
  },
  feePolicy("CRAFTING_FEE", 1, "Crafting Fee v1"),
  feePolicy("UPGRADE_FEE", 1, "Upgrade Fee v1"),
  feePolicy("LISTING_FEE", 1, "Listing Fee v1"),
  feePolicy("NAME_CHANGE_FEE", 1, "Name Change Fee v1"),
  feePolicy("INVENTORY_EXPANSION", 1, "Inventory Expansion v1"),
  feePolicy("LOADOUT_SLOT", 1, "Loadout Slot v1"),
  feePolicy("SEASONAL_PASS", 1, "Seasonal Pass v1"),
];

export const TREASURY_VAULTS: Record<
  TreasuryVaultKey,
  { label: string; address: string; destination?: AllocationDestination }
> = {
  PAYMENT_COLLECTION_VAULT: { label: "Payment Collection", address: "COMING_SOON" },
  GROWTH_RESERVE_VAULT: {
    label: "Growth Reserve",
    address: "COMING_SOON",
    destination: "GROWTH_RESERVE",
  },
  PET_HOLDER_REWARD_VAULT: {
    label: "Community Reward Treasury",
    address: "COMING_SOON",
    destination: "PET_HOLDER_REWARD_VAULT",
  },
  OPERATIONS_VAULT: {
    label: "Operations",
    address: "COMING_SOON",
    destination: "OPERATIONS",
  },
  COMMUNITY_EVENT_VAULT: {
    label: "Community Events",
    address: "COMING_SOON",
    destination: "COMMUNITY_EVENTS",
  },
  MARKETPLACE_ESCROW_VAULT: { label: "Marketplace Escrow", address: "COMING_SOON" },
  EMERGENCY_RESERVE_VAULT: {
    label: "Emergency Reserve",
    address: "COMING_SOON",
    destination: "EMERGENCY_RESERVE",
  },
};

export const PAYMENT_SPLIT_STRATEGY = "ledger" as const;

export function getActivePolicy(
  transactionType: RevenueTransactionType,
): RevenueAllocationPolicy {
  const policy = BOOTSTRAP_POLICIES.find(
    (p) => p.transactionType === transactionType && p.effectiveUntil == null,
  );
  if (!policy) {
    throw new Error(`No active revenue policy for ${transactionType}`);
  }
  return policy;
}

export function listPolicies(): RevenueAllocationPolicy[] {
  return BOOTSTRAP_POLICIES;
}

export function bpsToPercentLabel(bps: number): string {
  const whole = Math.floor(bps / 100);
  const frac = bps % 100;
  if (frac === 0) return `${whole}%`;
  return `${(bps / 100).toFixed(2).replace(/\.?0+$/, "")}%`;
}
