/**
 * Killer notice — NPCs react scared or with praise based on personality + occupation.
 * Uses LivePlayState kill counters / killerReputation (no SOL).
 */

import { inferOccupationRole, type OccupationRole } from "@/game/npc-ai/activities";
import { personalityForNpc } from "@/game/npc-ai/personalities";
import type { AttentionKind } from "@/game/npc-ai/attention";

export type KillerReputation = {
  /** Lightweight score 0–100 derived from kills / bounty flags. */
  score: number;
  pvpKills: number;
  combatKills: number;
  bountyTier: 0 | 1 | 2 | 3;
  knownAsKiller: boolean;
};

export type KillerReactionKind = "scared" | "praise" | "challenge" | "condemn" | "none";

export type KillerReaction = {
  kind: KillerReactionKind;
  attention: AttentionKind;
  /** Relationship delta when noticed. */
  relationshipDelta: number;
  lines: string[];
  /** Phaser behavior tweak while reacting. */
  behaviorHint: "flee" | "cower" | "cheer" | "challenge" | "avoid" | "none";
  merchantWary: boolean;
};

export const KILLER_NOTICE_THRESHOLD = 3;

export function buildKillerReputation(input: {
  pvpKills?: number;
  combatKills?: number;
  enemiesDefeated?: number;
  killerReputation?: number;
  bountyTier?: number;
  flags?: string[];
}): KillerReputation {
  const pvpKills = Math.max(0, input.pvpKills ?? 0);
  const combatKills = Math.max(
    0,
    input.combatKills ?? 0,
    // Wild PvE alone does not make you a "killer" — only a fraction counts if flagged
    0,
  );
  const enemiesDefeated = Math.max(0, input.enemiesDefeated ?? 0);
  const bountyTier = Math.min(
    3,
    Math.max(0, input.bountyTier ?? (input.flags?.includes("bounty") ? 1 : 0)),
  ) as 0 | 1 | 2 | 3;

  // Hostile reputation score: PvP weights heavy; bounty adds; excess combat kill count optional
  const derived =
    pvpKills * 18 +
    bountyTier * 22 +
    Math.min(40, Math.floor(combatKills / 2) * 4) +
    (input.flags?.includes("murderer") ? 35 : 0) +
    (input.flags?.includes("hostile_rep") ? 20 : 0);

  const score = Math.max(
    0,
    Math.min(100, input.killerReputation ?? derived),
  );

  // Known killer if enough PvP / bounty / explicit flags — not normal training bouts
  const knownAsKiller =
    score >= KILLER_NOTICE_THRESHOLD * 10 ||
    pvpKills >= KILLER_NOTICE_THRESHOLD ||
    bountyTier >= 1 ||
    Boolean(input.flags?.includes("murderer")) ||
    Boolean(input.flags?.includes("hostile_rep"));

  // enemiesDefeated alone never triggers killer notice
  void enemiesDefeated;

  return {
    score,
    pvpKills,
    combatKills,
    bountyTier,
    knownAsKiller,
  };
}

export type KillerStance = "scared" | "praise" | "challenge" | "condemn" | "neutral";

const PRAISE_TRAITS = [
  "bloodthirsty",
  "brave",
  "hardliner",
  "outlaw-sympathizer",
  "fierce",
  "battle-hungry",
  "ruthless",
  "grim",
];

const SCARED_TRAITS = [
  "timid",
  "gentle",
  "nurturing",
  "protective",
  "nervous",
  "peaceful",
  "warm",
  "patient",
];

export function killerStanceForNpc(input: {
  npcSlug: string;
  occupation?: string;
  kind?: string;
  personalityTraits?: string[];
}): KillerStance {
  const role = inferOccupationRole(
    input.occupation ?? "",
    input.kind,
    input.npcSlug,
  );
  const traits = (
    input.personalityTraits?.length
      ? input.personalityTraits
      : personalityForNpc(input.npcSlug).traits
  ).map((t) => t.toLowerCase());

  if (role === "bandit") return "praise";
  if (role === "priest") return "condemn";
  if (role === "guard") return "challenge";
  if (role === "child" || role === "animal") return "scared";
  if (role === "arena") return "praise";
  if (traits.some((t) => PRAISE_TRAITS.some((p) => t.includes(p)))) return "praise";
  if (traits.some((t) => SCARED_TRAITS.some((p) => t.includes(p)))) return "scared";
  if (role === "merchant" || role === "healer" || role === "hatchery") return "scared";
  if (role === "smith" || role === "courier") return "neutral";
  if (role === "scholar" || role === "guide") return "condemn";
  return "scared";
}

function linesFor(
  stance: KillerStance,
  role: OccupationRole,
  displayName: string,
): string[] {
  switch (stance) {
    case "scared":
      if (role === "child") {
        return [
          `${displayName} shrinks back. "Y-you're the one they whisper about…"`,
          "Please don't hurt anyone. I'll go home.",
        ];
      }
      if (role === "merchant") {
        return [
          `${displayName} keeps the counter between you. "Your coin's fine… your blade isn't welcome near my stock."`,
          "Shop's open, but keep your hands where I can see them.",
        ];
      }
      return [
        `${displayName} stiffens. "I've heard what you've done."`,
        "I'd rather you walked the long way around.",
      ];
    case "praise":
      if (role === "bandit" || role === "arena") {
        return [
          `${displayName} grins. "There's the killer. Plaza softies hate you — I don't."`,
          "Respect. Steel remembers who swings it.",
        ];
      }
      return [
        `${displayName} nods with hard approval. "World's sharper with you in it."`,
        "Don't apologize for winning.",
      ];
    case "challenge":
      return [
        `${displayName} squares up. "Killer. Keep your weapons sheathed in the Commons."`,
        "One wrong step and you're in the cells — Captain's orders.",
      ];
    case "condemn":
      return [
        `${displayName} looks through you. "Blood stains more than cloth."`,
        "The Fracture already taught us enough about needless killing.",
      ];
    default:
      return [];
  }
}

export function resolveKillerReaction(input: {
  npcSlug: string;
  displayName?: string;
  occupation?: string;
  kind?: string;
  personalityTraits?: string[];
  reputation: KillerReputation;
  alreadyNoticed?: boolean;
}): KillerReaction | null {
  if (!input.reputation.knownAsKiller) return null;
  // Still allow dialogue refresh, but first notice is stronger
  const role = inferOccupationRole(
    input.occupation ?? "",
    input.kind,
    input.npcSlug,
  );
  const stance = killerStanceForNpc(input);
  if (stance === "neutral") return null;

  const name = input.displayName ?? input.npcSlug;
  const lines = linesFor(stance, role, name);
  const merchantWary = role === "merchant" && stance === "scared";

  if (stance === "scared") {
    return {
      kind: "scared",
      attention: "fear",
      relationshipDelta: input.alreadyNoticed ? -1 : -8,
      lines,
      behaviorHint: role === "child" ? "cower" : "flee",
      merchantWary,
    };
  }
  if (stance === "praise") {
    return {
      kind: "praise",
      attention: "praise",
      relationshipDelta: input.alreadyNoticed ? 1 : 6,
      lines,
      behaviorHint: "cheer",
      merchantWary: false,
    };
  }
  if (stance === "challenge") {
    return {
      kind: "challenge",
      attention: "fear",
      relationshipDelta: input.alreadyNoticed ? -2 : -5,
      lines,
      behaviorHint: "challenge",
      merchantWary: false,
    };
  }
  // condemn
  return {
    kind: "condemn",
    attention: "story",
    relationshipDelta: input.alreadyNoticed ? -1 : -6,
    lines,
    behaviorHint: "avoid",
    merchantWary: false,
  };
}

/** Distance at which NPCs "notice" a known killer (world px). */
export const KILLER_NOTICE_RANGE = 110;
