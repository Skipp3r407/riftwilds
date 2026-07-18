/**
 * Riftling avatar unlock rules — cosmetics only (no gameplay power).
 * Paths: free starters · owned pet · quest/achievement tasks · Credits · optional SOL (flagged).
 */

import { getDemoAchievementMetrics } from "@/game/achievements/hooks";
import {
  getSpeciesBySlug,
  LAUNCH_SPECIES,
  type SpeciesDef,
} from "@/game/creatures/species-catalog";
import { listPetsForOwner } from "@/game/eggs/hatchery-store";
import { debitCredits, getCreditBalance } from "@/lib/credits/ledger";
import { isSolPurchaseLive } from "@/lib/economy/sol/flags";
import { grantEntitlement } from "@/lib/economy/sol/entitlements";
import {
  STARTER_RIFTLING_AVATAR_SLUGS,
  speciesAvatarKey,
} from "@/lib/social/avatar-keys";
import { getSocialStore } from "@/lib/social/store";
import type { SocialProfile } from "@/lib/social/types";

export type AvatarTaskProgress = {
  id: string;
  label: string;
  current: number;
  target: number;
  met: boolean;
};

export type AvatarUnlockPaths = {
  freeStarter: boolean;
  ownedPet: boolean;
  task: AvatarTaskProgress | null;
  creditsPrice: number;
  solPrice: string;
  solPurchaseEnabled: boolean;
  purchased: boolean;
};

export type AvatarUnlockEval = {
  unlocked: boolean;
  lockedReason?: string;
  paths: AvatarUnlockPaths;
};

const STARTER_SET = new Set<string>(STARTER_RIFTLING_AVATAR_SLUGS);

/** Credits (Gold) prices by rarity — cosmetics sink via PREMIUM_STORE. */
export const AVATAR_CREDITS_BY_RARITY: Record<string, number> = {
  COMMON: 75,
  UNCOMMON: 150,
  RARE: 300,
  EPIC: 600,
  LEGENDARY: 1000,
  MYTHIC: 1500,
  CELESTIAL: 2000,
};

/** Optional SOL display prices (never required; live buy gated by SOL_PURCHASES_ENABLED). */
export const AVATAR_SOL_BY_RARITY: Record<string, string> = {
  COMMON: "0.02",
  UNCOMMON: "0.04",
  RARE: "0.08",
  EPIC: "0.15",
  LEGENDARY: "0.25",
  MYTHIC: "0.4",
  CELESTIAL: "0.5",
};

export function creditsPriceForSpecies(species: SpeciesDef): number {
  return AVATAR_CREDITS_BY_RARITY[species.rarityBias] ?? AVATAR_CREDITS_BY_RARITY.COMMON!;
}

export function solPriceForSpecies(species: SpeciesDef): string {
  return AVATAR_SOL_BY_RARITY[species.rarityBias] ?? AVATAR_SOL_BY_RARITY.COMMON!;
}

/** All launch species are eligible cosmetics (art ships for every launch slug). */
export function listRiftlingAvatarSlugs(): string[] {
  return LAUNCH_SPECIES.map((s) => s.slug);
}

export function isRiftlingAvatarSlug(slug: string): boolean {
  return Boolean(getSpeciesBySlug(slug));
}

export function isFreeStarterAvatarSlug(slug: string): boolean {
  return STARTER_SET.has(slug);
}

type OwnerUnlockCtx = {
  ownedSpecies: Set<string>;
  ownedAffinities: Set<string>;
  metrics: Record<string, number>;
  purchasedKeys: Set<string>;
};

function buildOwnerCtx(ownerKey: string): OwnerUnlockCtx {
  const pets = listPetsForOwner(ownerKey);
  const ownedSpecies = new Set(pets.map((p) => p.speciesSlug));
  const ownedAffinities = new Set(
    pets
      .map((p) => getSpeciesBySlug(p.speciesSlug)?.affinity)
      .filter((a): a is string => Boolean(a)),
  );
  const profile = getSocialStore().profiles.get(ownerKey);
  const purchasedKeys = new Set(profile?.unlockedAvatarKeys ?? []);
  return {
    ownedSpecies,
    ownedAffinities,
    metrics: getDemoAchievementMetrics(),
    purchasedKeys,
  };
}

/**
 * Task unlock for non-starter cosmetics.
 * Tuned so demo baseline metrics leave most locked until progress or purchase.
 */
export function taskUnlockForSpecies(
  species: SpeciesDef,
  ctx: Pick<OwnerUnlockCtx, "metrics" | "ownedAffinities">,
): AvatarTaskProgress {
  const m = ctx.metrics;
  const rarity = species.rarityBias;

  if (rarity === "CELESTIAL" || rarity === "MYTHIC") {
    const target = 12;
    const current = m.region_discovery ?? 0;
    return {
      id: "region_discovery",
      label: "Discover 12 regions",
      current,
      target,
      met: current >= target,
    };
  }

  if (rarity === "LEGENDARY") {
    const target = 25;
    const current = m.arena_training_wins ?? 0;
    return {
      id: "arena_training_wins",
      label: "Win 25 Arena training bouts",
      current,
      target,
      met: current >= target,
    };
  }

  if (rarity === "EPIC") {
    const target = 15;
    const current = m.arena_training_wins ?? 0;
    return {
      id: "arena_training_wins",
      label: "Win 15 Arena training bouts",
      current,
      target,
      met: current >= target,
    };
  }

  if (rarity === "RARE") {
    const hatchTarget = 5;
    const hatch = m.hatch_count ?? 0;
    if (hatch >= hatchTarget) {
      return {
        id: "hatch_count",
        label: "Hatch 5 Riftlings",
        current: hatch,
        target: hatchTarget,
        met: true,
      };
    }
    const arenaTarget = 10;
    const arena = m.arena_training_wins ?? 0;
    return {
      id: "arena_training_wins",
      label: "Win 10 Arena training bouts",
      current: arena,
      target: arenaTarget,
      met: arena >= arenaTarget,
    };
  }

  if (rarity === "UNCOMMON") {
    const target = 5;
    const current = m.arena_training_wins ?? 0;
    return {
      id: "arena_training_wins",
      label: "Win 5 Arena training bouts",
      current,
      target,
      met: current >= target,
    };
  }

  // COMMON — hatch any pet of this affinity, or hatch 2+ total
  const affinityMet = ctx.ownedAffinities.has(species.affinity);
  if (affinityMet) {
    return {
      id: `affinity_${species.affinity}`,
      label: `Hatch a ${species.affinity} Riftling`,
      current: 1,
      target: 1,
      met: true,
    };
  }
  const hatchTarget = 2;
  const hatch = m.hatch_count ?? 0;
  return {
    id: "hatch_count",
    label: `Hatch a ${species.affinity} Riftling (or 2 total)`,
    current: hatch,
    target: hatchTarget,
    met: hatch >= hatchTarget,
  };
}

export function evaluateSpeciesAvatarUnlock(
  ownerKey: string,
  speciesSlug: string,
): AvatarUnlockEval | null {
  const species = getSpeciesBySlug(speciesSlug);
  if (!species) return null;

  const ctx = buildOwnerCtx(ownerKey);
  const key = speciesAvatarKey(speciesSlug);
  const freeStarter = isFreeStarterAvatarSlug(speciesSlug);
  const ownedPet = ctx.ownedSpecies.has(speciesSlug);
  const purchased = ctx.purchasedKeys.has(key);
  const task = freeStarter ? null : taskUnlockForSpecies(species, ctx);
  const taskMet = task?.met ?? false;

  const unlocked = freeStarter || ownedPet || purchased || taskMet;
  const creditsPrice = creditsPriceForSpecies(species);
  const solPrice = solPriceForSpecies(species);
  const solPurchaseEnabled = isSolPurchaseLive();

  let lockedReason: string | undefined;
  if (!unlocked) {
    const parts = [
      task ? `${task.label} (${Math.min(task.current, task.target)}/${task.target})` : null,
      `${creditsPrice} Credits`,
      solPurchaseEnabled ? `${solPrice} SOL` : `${solPrice} SOL (coming soon)`,
    ].filter(Boolean);
    lockedReason = `Unlock via ${parts.join(" · ")}. Cosmetic only.`;
  }

  return {
    unlocked,
    lockedReason,
    paths: {
      freeStarter,
      ownedPet,
      task,
      creditsPrice,
      solPrice,
      solPurchaseEnabled,
      purchased,
    },
  };
}

function requireProfile(ownerKey: string): SocialProfile {
  const profile = getSocialStore().profiles.get(ownerKey);
  if (!profile) throw new Error(`social_profile_missing:${ownerKey}`);
  return profile;
}

/** Persist a purchased / granted species avatar unlock on the social profile. */
export function grantSpeciesAvatarUnlock(ownerKey: string, speciesSlug: string): SocialProfile {
  const profile = requireProfile(ownerKey);
  const key = speciesAvatarKey(speciesSlug);
  const list = profile.unlockedAvatarKeys ?? [];
  if (!list.includes(key)) {
    profile.unlockedAvatarKeys = [...list, key];
  }
  profile.lastSeenAt = new Date().toISOString();
  return profile;
}

export function purchaseSpeciesAvatarWithCredits(params: {
  ownerKey: string;
  speciesSlug: string;
  requestId: string;
}):
  | { ok: true; key: string; balance: number; profile: SocialProfile; catalogHint: "refresh" }
  | { ok: false; error: string; message: string; balance?: number } {
  const slug = params.speciesSlug.trim().toLowerCase();
  const species = getSpeciesBySlug(slug);
  if (!species) {
    return { ok: false, error: "not_found", message: "That Riftling avatar is not available." };
  }

  const evald = evaluateSpeciesAvatarUnlock(params.ownerKey, slug);
  if (!evald) {
    return { ok: false, error: "not_found", message: "That Riftling avatar is not available." };
  }
  if (evald.unlocked) {
    return {
      ok: false,
      error: "already_unlocked",
      message: "That avatar is already unlocked.",
      balance: getCreditBalance(params.ownerKey),
    };
  }

  const amount = evald.paths.creditsPrice;
  const debit = debitCredits({
    userId: params.ownerKey,
    amount,
    reason: "PREMIUM_STORE",
    requestId: params.requestId,
    metadata: {
      kind: "riftling_avatar",
      speciesSlug: slug,
      cosmeticOnly: true,
      grantsGameplayPower: false,
    },
  });
  if (!debit.ok) {
    return {
      ok: false,
      error: debit.error,
      message: debit.message,
      balance: debit.balance ?? getCreditBalance(params.ownerKey),
    };
  }

  const profile = grantSpeciesAvatarUnlock(params.ownerKey, slug);
  grantEntitlement({
    userId: params.ownerKey,
    kind: "COSMETIC",
    assetKey: speciesAvatarKey(slug),
    requestId: `avatar-credits:${params.requestId}`,
    source: "credits_premium_store",
    metadata: { speciesSlug: slug, currency: "CREDITS", amount },
  });

  return {
    ok: true,
    key: speciesAvatarKey(slug),
    balance: debit.balance,
    profile,
    catalogHint: "refresh",
  };
}

/**
 * SOL path — blocked while SOL_PURCHASES_ENABLED / SOL_WALLET_ENABLED are false.
 * Never required; Credits + tasks remain available.
 */
export function purchaseSpeciesAvatarWithSol(params: {
  ownerKey: string;
  speciesSlug: string;
  requestId: string;
}):
  | { ok: true; key: string; profile: SocialProfile; note: string }
  | { ok: false; error: string; message: string; solPrice?: string } {
  const slug = params.speciesSlug.trim().toLowerCase();
  const species = getSpeciesBySlug(slug);
  if (!species) {
    return { ok: false, error: "not_found", message: "That Riftling avatar is not available." };
  }

  const evald = evaluateSpeciesAvatarUnlock(params.ownerKey, slug);
  if (!evald) {
    return { ok: false, error: "not_found", message: "That Riftling avatar is not available." };
  }
  if (evald.unlocked) {
    return {
      ok: false,
      error: "already_unlocked",
      message: "That avatar is already unlocked.",
      solPrice: evald.paths.solPrice,
    };
  }

  if (!isSolPurchaseLive()) {
    return {
      ok: false,
      error: "sol_coming_soon",
      message:
        "SOL avatar purchases are coming soon (SOL_PURCHASES_ENABLED is off). Unlock with tasks or Credits — cosmetics only, never required.",
      solPrice: evald.paths.solPrice,
    };
  }

  // Soft grant when flags are on (still no live chain settlement here).
  const profile = grantSpeciesAvatarUnlock(params.ownerKey, slug);
  grantEntitlement({
    userId: params.ownerKey,
    kind: "COSMETIC",
    assetKey: speciesAvatarKey(slug),
    requestId: `avatar-sol:${params.requestId}`,
    source: "sol_purchase_stub",
    metadata: {
      speciesSlug: slug,
      currency: "SOL",
      solPrice: evald.paths.solPrice,
      softSimulation: true,
    },
  });

  return {
    ok: true,
    key: speciesAvatarKey(slug),
    profile,
    note: "SOL avatar unlock recorded (soft path). Cosmetic only.",
  };
}

export function avatarUnlockSummary(ownerKey: string): {
  total: number;
  freeStarters: number;
  unlocked: number;
  locked: number;
} {
  const slugs = listRiftlingAvatarSlugs();
  let unlocked = 0;
  for (const slug of slugs) {
    const e = evaluateSpeciesAvatarUnlock(ownerKey, slug);
    if (e?.unlocked) unlocked += 1;
  }
  return {
    total: slugs.length,
    freeStarters: STARTER_RIFTLING_AVATAR_SLUGS.length,
    unlocked,
    locked: slugs.length - unlocked,
  };
}
