/**
 * Reputation × personality × role reaction matrix.
 * Not "killer = everyone reacts the same" — factions diverge.
 */

import { inferOccupationRole, type OccupationRole } from "@/game/npc-ai/activities";
import type { AttentionKind } from "@/game/npc-ai/attention";
import {
  hasTrait,
  resolveFactionId,
  traitsForNpc,
  type PersonalityTraitTag,
  FACTION_VALUES,
} from "@/game/npc-ai/personality-traits";
import type { PlayerReputation } from "@/game/npc-ai/reputation";
import { dominantReputationIdentity } from "@/game/npc-ai/reputation";

export type SocialReactionKind =
  | "wave"
  | "salute"
  | "discount"
  | "praise"
  | "fear"
  | "hide"
  | "lock_shop"
  | "respect"
  | "offer_illegal"
  | "challenge"
  | "watch"
  | "arrest"
  | "condemn"
  | "admire_strength"
  | "recruit"
  | "neutral";

export type SocialReaction = {
  kind: SocialReactionKind;
  attention: AttentionKind;
  relationshipDelta: number;
  lines: string[];
  behaviorHint:
    | "flee"
    | "cower"
    | "cheer"
    | "challenge"
    | "avoid"
    | "wave"
    | "salute"
    | "hide"
    | "lock"
    | "watch"
    | "none";
  merchantWary: boolean;
  shopLocked: boolean;
  priceModifier: number;
  /** Guard severity 0 = none, 1 = watch, 2 = warn, 3 = arrest stub. */
  guardSeverity: 0 | 1 | 2 | 3;
  offerIllegalWork: boolean;
};

const NOTICE_RANGE = 120;
export const SOCIAL_NOTICE_RANGE = NOTICE_RANGE;

function scoreAxes(
  axes: PlayerReputation,
  weights: Partial<Record<keyof PlayerReputation, number>>,
): number {
  let sum = 0;
  let w = 0;
  for (const [key, weight] of Object.entries(weights) as [keyof PlayerReputation, number][]) {
    sum += (axes[key] ?? 0) * weight;
    w += Math.abs(weight);
  }
  return w ? sum / w : 0;
}

function baseReaction(
  kind: SocialReactionKind,
  lines: string[],
  extras: Partial<SocialReaction> = {},
): SocialReaction {
  const attentionMap: Partial<Record<SocialReactionKind, AttentionKind>> = {
    wave: "chat",
    salute: "praise",
    discount: "chat",
    praise: "praise",
    fear: "fear",
    hide: "fear",
    lock_shop: "fear",
    respect: "respect",
    offer_illegal: "story",
    challenge: "fear",
    watch: "wary",
    arrest: "fear",
    condemn: "story",
    admire_strength: "respect",
    recruit: "quest",
    neutral: "none",
  };
  return {
    kind,
    attention: attentionMap[kind] ?? "none",
    relationshipDelta: 0,
    lines,
    behaviorHint: "none",
    merchantWary: false,
    shopLocked: false,
    priceModifier: 1,
    guardSeverity: 0,
    offerIllegalWork: false,
    ...extras,
  };
}

function heroLines(role: OccupationRole, name: string): string[] {
  if (role === "child") {
    return [
      `${name} waves both arms. "You're the helper! The good one!"`,
      "Can I tell my friends you waved back?",
    ];
  }
  if (role === "guard") {
    return [
      `${name} salutes. "Plaza's safer with you around. Keep your steel sheathed — for show."`,
      "Captain's ledger has a kind word for you.",
    ];
  }
  if (role === "merchant") {
    return [
      `${name} brightens. "Hero rates — I'll shave a little for someone the Commons trust."`,
      "Buy fair, stay welcome.",
    ];
  }
  if (role === "bandit") {
    return [
      `${name} sneers. "Plaza pet. Don't bring your sermons into our camp."`,
      "Heroes make loud targets.",
    ];
  }
  return [
    `${name} nods warmly. "Word travels — you've done right by folk."`,
    "If you need a hand, ask.",
  ];
}

function criminalFearLines(role: OccupationRole, name: string): string[] {
  if (role === "child") {
    return [
      `${name} hides behind a crate. "Mom said not to look at you…"`,
      "I'm going home. Please don't follow.",
    ];
  }
  if (role === "merchant") {
    return [
      `${name} drops the shutter latch. "Shop's closed. To you."`,
      "Your coin's stained — come back when the watch clears you.",
    ];
  }
  if (role === "guard") {
    return [
      `${name} squares shoulders. "Known face. Keep walking — or we walk you to the cells."`,
      "One wrong step and you're under arrest.",
    ];
  }
  return [
    `${name} stiffens. "I've heard what you've done."`,
    "I'd rather you walked the long way around.",
  ];
}

function banditRespectLines(name: string): string[] {
  return [
    `${name} grins. "There's the outlaw. Plaza softies hate you — I don't."`,
    "Got illegal work if your blade's still hungry.",
  ];
}

function mercenaryLines(name: string, strong: boolean): string[] {
  if (strong) {
    return [
      `${name} measures you. "Strength talks. You're worth a contract."`,
      "Don't waste it on soft targets.",
    ];
  }
  return [
    `${name} shrugs. "Come back when you've got scars that mean something."`,
  ];
}

/**
 * Resolve how an NPC reacts to the player's *known* reputation in this region.
 * `knownAxes` should already apply gossip lag (not always global truth).
 */
export function resolveSocialReaction(input: {
  npcSlug: string;
  displayName?: string;
  occupation?: string;
  kind?: string;
  personalityTraits?: string[];
  knownAxes: PlayerReputation;
  /** True reputation for edge cases (e.g. personal memory overrides). */
  trueAxes?: PlayerReputation;
  alreadyReacted?: boolean;
}): SocialReaction | null {
  const role = inferOccupationRole(
    input.occupation ?? "",
    input.kind,
    input.npcSlug,
  );
  const traits = traitsForNpc(input);
  const name = input.displayName ?? input.npcSlug;
  const axes = input.knownAxes;
  const factionId = resolveFactionId(role, traits);
  const faction = FACTION_VALUES[factionId] ?? FACTION_VALUES.village!;
  const favor = scoreAxes(axes, faction.favors);
  const fear = scoreAxes(axes, faction.fears);
  const identity = dominantReputationIdentity(axes);
  const mild = Boolean(input.alreadyReacted);

  // Children: hide from criminals, wave at heroes
  if (role === "child" || hasTrait(traits, "childish")) {
    if (axes.notoriety >= 35 || axes.criminal >= 40 || axes.cruelty >= 40) {
      return baseReaction("hide", criminalFearLines("child", name), {
        attention: "fear",
        relationshipDelta: mild ? -1 : -10,
        behaviorHint: "cower",
      });
    }
    if (axes.hero >= 40 || axes.mercy >= 45) {
      return baseReaction("wave", heroLines("child", name), {
        attention: "chat",
        relationshipDelta: mild ? 1 : 6,
        behaviorHint: "wave",
      });
    }
    return null;
  }

  // Bandits: respect notoriety / criminal; scorn heroes
  if (role === "bandit" || hasTrait(traits, "outlaw")) {
    if (axes.notoriety >= 30 || axes.criminal >= 35 || axes.infamy >= 30) {
      return baseReaction("respect", banditRespectLines(name), {
        attention: "praise",
        relationshipDelta: mild ? 1 : 8,
        behaviorHint: "cheer",
        offerIllegalWork: axes.criminal >= 40 || axes.notoriety >= 45,
        kind: axes.criminal >= 40 ? "offer_illegal" : "respect",
      });
    }
    if (axes.hero >= 50 && axes.notoriety < 20) {
      return baseReaction("condemn", heroLines("bandit", name), {
        attention: "story",
        relationshipDelta: mild ? -1 : -6,
        behaviorHint: "avoid",
      });
    }
    return null;
  }

  // Guards: watch → arrest by severity
  if (role === "guard" || hasTrait(traits, "stern")) {
    const severity = guardSeverityFromAxes(axes, traits);
    if (severity >= 3) {
      return baseReaction("arrest", criminalFearLines("guard", name), {
        attention: "fear",
        relationshipDelta: mild ? -2 : -12,
        behaviorHint: "challenge",
        guardSeverity: 3,
      });
    }
    if (severity >= 2) {
      return baseReaction("challenge", criminalFearLines("guard", name), {
        attention: "fear",
        relationshipDelta: mild ? -1 : -6,
        behaviorHint: "challenge",
        guardSeverity: 2,
      });
    }
    if (severity >= 1) {
      return baseReaction(
        "watch",
        [
          `${name} watches you. "We've got eyes on you. Stay clean."`,
          "The cells are never full for long.",
        ],
        {
          attention: "story",
          relationshipDelta: mild ? 0 : -3,
          behaviorHint: "watch",
          guardSeverity: 1,
        },
      );
    }
    if (axes.hero >= 45 || axes.honor >= 50) {
      return baseReaction("salute", heroLines("guard", name), {
        attention: "praise",
        relationshipDelta: mild ? 1 : 5,
        behaviorHint: "salute",
      });
    }
    return null;
  }

  // Merchants: honest vs black market
  if (role === "merchant") {
    const black = factionId === "black_market" || hasTrait(traits, "corrupt");
    if (black && (axes.criminal >= 30 || axes.notoriety >= 35)) {
      return baseReaction(
        "offer_illegal",
        [
          `${name} lowers their voice. "For the right face, I've got under-counter stock."`,
          "Credits only. No plaza questions.",
        ],
        {
          attention: "story",
          relationshipDelta: mild ? 1 : 5,
          behaviorHint: "cheer",
          offerIllegalWork: true,
          priceModifier: 0.95,
        },
      );
    }
    if (!black && (axes.notoriety >= 40 || axes.criminal >= 45 || axes.cruelty >= 50)) {
      const lock = axes.notoriety >= 55 || axes.criminal >= 60;
      return baseReaction(lock ? "lock_shop" : "fear", criminalFearLines("merchant", name), {
        attention: "fear",
        relationshipDelta: mild ? -1 : -8,
        behaviorHint: lock ? "lock" : "avoid",
        merchantWary: true,
        shopLocked: lock,
        priceModifier: lock ? 1.35 : 1.15,
      });
    }
    if (axes.hero >= 40 || axes.merchant >= 45 || axes.trust >= 50) {
      return baseReaction("discount", heroLines("merchant", name), {
        attention: "chat",
        relationshipDelta: mild ? 1 : 4,
        behaviorHint: "wave",
        priceModifier: axes.merchant >= 55 ? 0.9 : 0.95,
      });
    }
    return null;
  }

  // Mercenaries / arena: strength-based
  if (role === "arena" || hasTrait(traits, "mercenary") || hasTrait(traits, "bloodthirsty")) {
    const strength = Math.max(axes.notoriety, axes.monsterHunter, axes.cruelty * 0.8, axes.hero * 0.5);
    if (strength >= 40) {
      return baseReaction("admire_strength", mercenaryLines(name, true), {
        attention: "praise",
        relationshipDelta: mild ? 1 : 6,
        behaviorHint: "cheer",
        kind: strength >= 60 ? "recruit" : "admire_strength",
      });
    }
    if (axes.mercy >= 60 && axes.notoriety < 15) {
      return baseReaction(
        "condemn",
        [`${name} snorts. "Soft hands. The pit doesn't pay for mercy."`],
        { attention: "story", relationshipDelta: -2, behaviorHint: "avoid" },
      );
    }
    return null;
  }

  // Priests / healers / kind folk
  if (
    role === "priest" ||
    role === "healer" ||
    hasTrait(traits, "devout") ||
    hasTrait(traits, "kind")
  ) {
    if (axes.cruelty >= 35 || axes.notoriety >= 45) {
      return baseReaction(
        "condemn",
        [
          `${name} looks through you. "Blood stains more than cloth."`,
          "Mercy still has a path — if you choose it.",
        ],
        {
          attention: "story",
          relationshipDelta: mild ? -1 : -7,
          behaviorHint: "avoid",
        },
      );
    }
    if (axes.mercy >= 40 || axes.hero >= 40) {
      return baseReaction("praise", heroLines(role, name), {
        attention: "praise",
        relationshipDelta: mild ? 1 : 5,
        behaviorHint: "wave",
      });
    }
    return null;
  }

  // Brave folk may challenge criminals before peaceful fear applies
  if (
    fear >= 35 &&
    hasTrait(traits, "brave") &&
    !hasTrait(traits, "cowardly") &&
    (axes.notoriety >= 40 || axes.criminal >= 40)
  ) {
    return baseReaction(
      "challenge",
      [
        `${name} doesn't flinch. "I've heard. Doesn't mean I'll bow."`,
        "Stay civil and we'll stay strangers.",
      ],
      {
        attention: "fear",
        relationshipDelta: mild ? 0 : -3,
        behaviorHint: "challenge",
      },
    );
  }

  // Cowardly / peaceful citizens fear notoriety
  if (
    fear >= 40 &&
    (hasTrait(traits, "cowardly") || hasTrait(traits, "peaceful")) &&
    !hasTrait(traits, "brave")
  ) {
    return baseReaction("fear", criminalFearLines(role, name), {
      attention: "fear",
      relationshipDelta: mild ? -1 : -7,
      behaviorHint: hasTrait(traits, "cowardly") ? "flee" : "avoid",
    });
  }
  if (favor >= 40 && (identity.identity === "hero" || axes.town >= 45)) {
    return baseReaction("wave", heroLines(role, name), {
      attention: "chat",
      relationshipDelta: mild ? 1 : 4,
      behaviorHint: "wave",
    });
  }

  // Greedy folk may still deal with criminals for a markup
  if (hasTrait(traits, "greedy") && axes.criminal >= 30 && axes.notoriety < 70) {
    return baseReaction(
      "discount",
      [
        `${name} eyes your purse. "Dangerous customers pay premium. Credits up front."`,
      ],
      {
        attention: "chat",
        relationshipDelta: 1,
        priceModifier: 1.2,
        merchantWary: true,
      },
    );
  }

  return null;
}

export function guardSeverityFromAxes(
  axes: PlayerReputation,
  traits: PersonalityTraitTag[],
): 0 | 1 | 2 | 3 {
  const heat = Math.max(axes.notoriety, axes.criminal, axes.infamy);
  const cruel = axes.cruelty;
  let tier: 0 | 1 | 2 | 3 = 0;
  if (heat >= 25 || cruel >= 30) tier = 1;
  if (heat >= 45 || cruel >= 50) tier = 2;
  if (heat >= 70 || (cruel >= 65 && heat >= 50)) tier = 3;
  if (hasTrait(traits, "corrupt") && tier > 0) {
    // Corrupt guards may look away for low severity
    if (tier <= 1 && axes.merchant >= 40) return 0;
    if (tier === 3) return 2;
  }
  if (hasTrait(traits, "lawful") && heat >= 20 && tier === 0) tier = 1;
  return tier;
}

/** Merge killer-path reaction with broader social reaction — social wins when richer. */
export function pickPrimaryReaction(
  social: SocialReaction | null,
  killerKind: string | null,
): SocialReaction | null {
  if (social) return social;
  if (!killerKind) return null;
  return null;
}
