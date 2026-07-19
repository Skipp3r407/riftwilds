/**
 * What may be listed on the Player Marketplace.
 * Hard rule: no guaranteed competitive advantages via marketplace.
 */

export type EligibilityClass =
  | "cosmetic"
  | "collectible_edition"
  | "alt_art"
  | "binder_cosmetic"
  | "showcase"
  | "companion_disclosed"
  | "blocked_competitive"
  | "blocked_account_bound"
  | "blocked_not_enabled";

export type EligibilityRule = {
  class: EligibilityClass;
  mayList: boolean;
  reason: string;
};

export const ELIGIBILITY_RULES: EligibilityRule[] = [
  {
    class: "cosmetic",
    mayList: true,
    reason: "Sleeves, boards, frames, emotes — visual only.",
  },
  {
    class: "collectible_edition",
    mayList: true,
    reason: "Foil / animated editions never grant ATK/HP/energy.",
  },
  {
    class: "alt_art",
    mayList: true,
    reason: "Alternate art copies are cosmetic ownership.",
  },
  {
    class: "binder_cosmetic",
    mayList: true,
    reason: "Binder spines and pages are presentation only.",
  },
  {
    class: "showcase",
    mayList: true,
    reason: "Museum / shop showcase listings are display or cosmetic sale.",
  },
  {
    class: "companion_disclosed",
    mayList: true,
    reason: "Eggs/pets secondary market with full disclosures — not P2W cards.",
  },
  {
    class: "blocked_competitive",
    mayList: false,
    reason: "Base competitive card power / exclusive keyword effects cannot be listed for SOL advantage.",
  },
  {
    class: "blocked_account_bound",
    mayList: false,
    reason: "Starter / account-bound assets stay bound.",
  },
  {
    class: "blocked_not_enabled",
    mayList: false,
    reason: "Property / some housing SKUs remain disabled until Living World.",
  },
];

export type ListabilityInput = {
  itemKey?: string;
  category?: string;
  tags?: string[];
  accountBound?: boolean;
  affectsGameplay?: boolean;
  isGameplayCardCopy?: boolean;
};

/**
 * Server-side listability gate (demo-safe). Prefer deny on competitive signals.
 */
export function evaluateListability(input: ListabilityInput): {
  ok: boolean;
  class: EligibilityClass;
  reason: string;
} {
  if (input.accountBound) {
    return {
      ok: false,
      class: "blocked_account_bound",
      reason: "Asset is account-bound and cannot be listed.",
    };
  }
  if (input.affectsGameplay || input.isGameplayCardCopy) {
    return {
      ok: false,
      class: "blocked_competitive",
      reason: "Gameplay power copies are not sold as marketplace competitive advantages. Soft earn path only.",
    };
  }
  if (input.category === "PROPERTY") {
    return {
      ok: false,
      class: "blocked_not_enabled",
      reason: "Property listings are not enabled.",
    };
  }
  const tags = new Set((input.tags ?? []).map((t) => t.toLowerCase()));
  if (tags.has("alt_art") || tags.has("foil") || tags.has("animated")) {
    return {
      ok: true,
      class: "collectible_edition",
      reason: "Collectible edition / alt art may list.",
    };
  }
  if (
    input.category === "EQUIPMENT" ||
    input.category === "COLLECTIBLES" ||
    tags.has("cosmetic")
  ) {
    return {
      ok: true,
      class: "cosmetic",
      reason: "Cosmetic / collectible may list.",
    };
  }
  if (input.category === "EGGS" || input.category === "PETS") {
    return {
      ok: true,
      class: "companion_disclosed",
      reason: "Companion listing allowed with disclosures.",
    };
  }
  if (input.category === "CARDS" || input.category === "PACKS") {
    return {
      ok: true,
      class: "collectible_edition",
      reason: "Card/pack desk listings are Credits cosmetics/collectibles path — not P2W power sales.",
    };
  }
  return {
    ok: true,
    class: "cosmetic",
    reason: "Default allow for demo cosmetic catalog items.",
  };
}

export function serializeEligibilityRules() {
  return {
    policy:
      "Marketplace never grants guaranteed competitive advantages. Base progression remains achievable without marketplace.",
    rules: ELIGIBILITY_RULES,
  };
}
