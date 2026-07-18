/**
 * Regional / age policy engine stubs.
 * Real-money SOL features may be blocked by region until legal review.
 */

export type RegionCode = "US" | "EU" | "UK" | "CA" | "AU" | "OTHER" | "UNKNOWN";

export type RegionalPolicy = {
  region: RegionCode;
  solPurchasesAllowed: boolean;
  solMarketplaceAllowed: boolean;
  solTournamentsAllowed: boolean;
  minAge: number;
  note: string;
};

export const REGIONAL_POLICIES: Record<RegionCode, RegionalPolicy> = {
  US: {
    region: "US",
    solPurchasesAllowed: false,
    solMarketplaceAllowed: false,
    solTournamentsAllowed: false,
    minAge: 18,
    note: "Stub — blocked until legal review + flags.",
  },
  EU: {
    region: "EU",
    solPurchasesAllowed: false,
    solMarketplaceAllowed: false,
    solTournamentsAllowed: false,
    minAge: 18,
    note: "Stub — GDPR / consumer rules review required.",
  },
  UK: {
    region: "UK",
    solPurchasesAllowed: false,
    solMarketplaceAllowed: false,
    solTournamentsAllowed: false,
    minAge: 18,
    note: "Stub — blocked until legal review.",
  },
  CA: {
    region: "CA",
    solPurchasesAllowed: false,
    solMarketplaceAllowed: false,
    solTournamentsAllowed: false,
    minAge: 18,
    note: "Stub — blocked until legal review.",
  },
  AU: {
    region: "AU",
    solPurchasesAllowed: false,
    solMarketplaceAllowed: false,
    solTournamentsAllowed: false,
    minAge: 18,
    note: "Stub — blocked until legal review.",
  },
  OTHER: {
    region: "OTHER",
    solPurchasesAllowed: false,
    solMarketplaceAllowed: false,
    solTournamentsAllowed: false,
    minAge: 18,
    note: "Default deny for real-money SOL features.",
  },
  UNKNOWN: {
    region: "UNKNOWN",
    solPurchasesAllowed: false,
    solMarketplaceAllowed: false,
    solTournamentsAllowed: false,
    minAge: 18,
    note: "Unknown region — deny SOL features.",
  },
};

export function getRegionalPolicy(region: RegionCode | string): RegionalPolicy {
  const key = (region || "UNKNOWN").toUpperCase() as RegionCode;
  return REGIONAL_POLICIES[key] ?? REGIONAL_POLICIES.UNKNOWN;
}

export function checkAgeGate(params: {
  ageYears: number | null;
  region: RegionCode;
}): { ok: true } | { ok: false; reason: string } {
  const policy = getRegionalPolicy(params.region);
  if (params.ageYears == null) {
    return { ok: false, reason: "age_not_verified" };
  }
  if (params.ageYears < policy.minAge) {
    return { ok: false, reason: "under_minimum_age" };
  }
  return { ok: true };
}

export function regionAllowsSolFeature(
  region: RegionCode,
  feature: "purchases" | "marketplace" | "tournaments",
): boolean {
  const p = getRegionalPolicy(region);
  if (feature === "purchases") return p.solPurchasesAllowed;
  if (feature === "marketplace") return p.solMarketplaceAllowed;
  return p.solTournamentsAllowed;
}
