/**
 * Reputation repair — fines, jail stub, community service, donate / heroic deeds.
 * Credits OK; never requires SOL for basic repair.
 */

import {
  applyReputationDelta,
  type PlayerReputation,
  type ReputationDelta,
} from "@/game/npc-ai/reputation";

export type ForgivenessPath =
  | "fine"
  | "jail"
  | "community_service"
  | "donate"
  | "rebuild"
  | "heroic_deed";

export type ForgivenessOffer = {
  path: ForgivenessPath;
  /** Credits cost (0 for jail / quests / deeds). */
  creditCost: number;
  label: string;
  description: string;
  delta: ReputationDelta;
  /** Optional quest key for community service. */
  questId?: string;
  /** Jail stub duration ms. */
  jailMs?: number;
  requiresSol: false;
};

export type JailStubState = {
  active: boolean;
  until: number;
  regionId: string;
};

export function jailStubActive(jail: JailStubState | undefined, now = Date.now()): boolean {
  return Boolean(jail?.active && jail.until > now);
}

/** Offers available based on current heat — Credits only, never SOL. */
export function listForgivenessOffers(axes: PlayerReputation): ForgivenessOffer[] {
  const heat = Math.max(axes.notoriety, axes.criminal, axes.infamy);
  const offers: ForgivenessOffer[] = [];

  if (heat >= 15) {
    const fine = Math.min(400, 40 + heat * 3);
    offers.push({
      path: "fine",
      creditCost: fine,
      label: "Pay plaza fine",
      description: "Credits to the Commons watch — clears a slice of heat. Never SOL.",
      delta: {
        notoriety: -12,
        criminal: -8,
        infamy: -6,
        town: 4,
        trust: 3,
      },
      requiresSol: false,
    });
  }

  if (heat >= 40) {
    offers.push({
      path: "jail",
      creditCost: 0,
      label: "Serve jail time (stub)",
      description: "Sit the cells for a short stub timer. Full sentencing backlog.",
      delta: {
        notoriety: -20,
        criminal: -15,
        infamy: -10,
        honor: 4,
        town: 6,
      },
      jailMs: 60_000,
      requiresSol: false,
    });
  }

  if (heat >= 20 || axes.town < 30) {
    offers.push({
      path: "community_service",
      creditCost: 0,
      label: "Community service",
      description: "Repair markers, sweep stalls, or escort a courier — quest ledger only.",
      delta: {
        notoriety: -8,
        criminal: -5,
        town: 10,
        trust: 8,
        honor: 6,
        hero: 4,
      },
      questId: "rep-community-service",
      requiresSol: false,
    });
  }

  offers.push({
    path: "donate",
    creditCost: 80,
    label: "Donate to restoration",
    description: "Credits to rebuild stalls and markers. Improves town & mercy.",
    delta: {
      town: 12,
      mercy: 8,
      trust: 6,
      hero: 4,
      cruelty: -4,
      notoriety: -4,
    },
    requiresSol: false,
  });

  offers.push({
    path: "rebuild",
    creditCost: 0,
    label: "Rebuild work",
    description: "Hands-on restoration labor — no Credits required.",
    delta: {
      town: 14,
      honor: 8,
      explorer: 2,
      notoriety: -6,
      criminal: -3,
    },
    questId: "rep-rebuild-marker",
    requiresSol: false,
  });

  offers.push({
    path: "heroic_deed",
    creditCost: 0,
    label: "Heroic deed",
    description: "Save folk, hunt a real threat, or keep a hard promise.",
    delta: {
      hero: 18,
      honor: 12,
      mercy: 8,
      trust: 10,
      town: 8,
      notoriety: -10,
      cruelty: -8,
      infamy: -6,
    },
    requiresSol: false,
  });

  return offers;
}

export type ForgivenessResult = {
  ok: boolean;
  message: string;
  axes: PlayerReputation;
  creditCost: number;
  jail?: JailStubState;
  questId?: string;
};

export function applyForgiveness(input: {
  axes: PlayerReputation;
  path: ForgivenessPath;
  /** Available Credits (demo / ledger mirror). */
  credits: number;
  regionId?: string;
  now?: number;
}): ForgivenessResult {
  const offers = listForgivenessOffers(input.axes);
  const offer = offers.find((o) => o.path === input.path);
  if (!offer) {
    return {
      ok: false,
      message: "No forgiveness path available.",
      axes: input.axes,
      creditCost: 0,
    };
  }
  if (offer.requiresSol) {
    return {
      ok: false,
      message: "SOL is never required for reputation repair.",
      axes: input.axes,
      creditCost: 0,
    };
  }
  if (offer.creditCost > 0 && input.credits < offer.creditCost) {
    return {
      ok: false,
      message: `Need ${offer.creditCost} Credits (not SOL).`,
      axes: input.axes,
      creditCost: offer.creditCost,
    };
  }

  const axes = applyReputationDelta(input.axes, offer.delta);
  const now = input.now ?? Date.now();
  const jail =
    offer.path === "jail"
      ? {
          active: true,
          until: now + (offer.jailMs ?? 60_000),
          regionId: input.regionId ?? "riftwild-commons",
        }
      : undefined;

  return {
    ok: true,
    message: offer.description,
    axes,
    creditCost: offer.creditCost,
    jail,
    questId: offer.questId,
  };
}

/** Assert public contract: no offer may require SOL. */
export function forgivenessNeverRequiresSol(offers = listForgivenessOffers(createHeatAxes())): boolean {
  return offers.every((o) => o.requiresSol === false);
}

function createHeatAxes(): PlayerReputation {
  return {
    hero: 5,
    town: 10,
    guild: 0,
    faction: 0,
    merchant: 10,
    criminal: 50,
    notoriety: 55,
    honor: 10,
    mercy: 5,
    cruelty: 40,
    trust: 5,
    infamy: 45,
    monsterHunter: 0,
    explorer: 5,
  };
}
