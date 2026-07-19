/**
 * First-login / new-keeper package — 100% free, no wallet / SOL / $RIFT.
 * Guarantees: starter Credits, account-bound Starter Egg claim path, starter deck,
 * academy pointer, avatar stubs, home stub, starter quest chain visibility.
 */

import { claimStarterEgg, getHatcheryOfferStatus, listEggsForOwner } from "@/game/eggs/hatchery-store";
import { getCollection } from "@/game/tcg/collection-store";
import { ensureStarterCredits, getCreditBalance } from "@/lib/credits/ledger";
import { STARTER_CREDITS } from "@/lib/credits/config";
import { isFeatureEnabled } from "@/lib/config/feature-flags";
import { STARTER_RIFTLING_AVATAR_SLUGS } from "@/lib/social/avatar-keys";

export type StarterPackageStatus = {
  ownerKey: string;
  freeToPlay: true;
  walletRequired: false;
  credits: {
    ensured: boolean;
    balance: number;
    starterGrant: number;
  };
  starterEgg: {
    claimed: boolean;
    canClaim: boolean;
    eggPublicId: string | null;
    autoClaimedThisCall: boolean;
  };
  starterDeck: {
    ready: boolean;
    activeDeckId: string;
    binderCards: number;
  };
  tutorial: {
    helpHref: string;
    academyHref: string;
    questsHref: string;
  };
  avatar: {
    freeSlugs: string[];
    note: string;
  };
  home: {
    href: string;
    note: string;
  };
  starterQuest: {
    chainKey: "starter";
    boardHref: string;
    note: string;
  };
  messaging: string[];
};

type EnsureOpts = {
  /** When true and claims enabled, claim the free starter egg if not yet held. */
  autoClaimEgg?: boolean;
};

/**
 * Idempotent first-login package. Safe for guests and SIWS sessions.
 */
export function ensureStarterPackage(
  ownerKey: string,
  opts: EnsureOpts = { autoClaimEgg: true },
): StarterPackageStatus {
  ensureStarterCredits(ownerKey);
  const balance = getCreditBalance(ownerKey);
  const offer = getHatcheryOfferStatus(ownerKey);

  let autoClaimedThisCall = false;
  let eggPublicId: string | null = null;

  const held = listEggsForOwner(ownerKey).find((e) => e.creationSource === "STARTER_CLAIM");
  if (held) {
    eggPublicId = held.publicId;
  } else if (
    opts.autoClaimEgg !== false &&
    offer.canClaimFree &&
    isFeatureEnabled("STARTER_EGG_CLAIMS_ENABLED") &&
    isFeatureEnabled("EGG_SYSTEM_ENABLED")
  ) {
    try {
      const egg = claimStarterEgg(ownerKey);
      eggPublicId = egg.publicId;
      autoClaimedThisCall = true;
    } catch {
      /* race / disabled — leave claimable in UI */
    }
  }

  const collection = getCollection(ownerKey);
  const refreshedOffer = getHatcheryOfferStatus(ownerKey);

  return {
    ownerKey,
    freeToPlay: true,
    walletRequired: false,
    credits: {
      ensured: true,
      balance,
      starterGrant: STARTER_CREDITS,
    },
    starterEgg: {
      claimed: refreshedOffer.alreadyClaimedFree || Boolean(eggPublicId),
      canClaim: refreshedOffer.canClaimFree,
      eggPublicId,
      autoClaimedThisCall,
    },
    starterDeck: {
      ready: collection.activeDeck.length > 0,
      activeDeckId: collection.activeDeckId,
      binderCards: collection.cards.length,
    },
    tutorial: {
      helpHref: "/help",
      academyHref: "/academy",
      questsHref: "/quests",
    },
    avatar: {
      freeSlugs: [...STARTER_RIFTLING_AVATAR_SLUGS],
      note: "Starter avatars unlock free — no wallet.",
    },
    home: {
      href: "/homestead",
      note: "Starter home / homestead scaffold — playable without wallet.",
    },
    starterQuest: {
      chainKey: "starter",
      boardHref: "/quests",
      note: "Starter quest chain opens on the Quest Board — hatch, bond, duel.",
    },
    messaging: [
      "Riftwilds is free to play — no wallet, SOL, or $RIFT required.",
      "Your Starter Egg, Credits, starter deck, and tutorial are included.",
      "Token holder perks (if any) are cosmetic / community only — never competitive power.",
    ],
  };
}
