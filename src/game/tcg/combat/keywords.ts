/**
 * Keyword registry + combat handlers.
 * Card UI / components must NOT hardcode keyword logic — resolve via this module.
 */

import {
  addStatus,
  hasStatus,
  type TcgStatusInstance,
} from "@/game/tcg/combat/status";

/** Runtime keyword id (broader than competitive `schemas.KeywordId`). */
type KeywordId = string;

export type KeywordDef = {
  id: KeywordId;
  /** Canonical aliases (taunt → guardian, guard → guardian). */
  aliases?: string[];
  shortText: string;
  /** Engine support tier. */
  support: "full" | "partial" | "stub";
};

export const KEYWORD_REGISTRY: Record<string, KeywordDef> = {
  charge: {
    id: "charge",
    shortText: "Can attack the turn it arrives.",
    support: "full",
  },
  guardian: {
    id: "guardian",
    aliases: ["taunt", "guard"],
    shortText: "Must be attacked first.",
    support: "full",
  },
  flying: {
    id: "flying",
    shortText: "Ignores non-Flying Guardians when striking the Keeper.",
    support: "full",
  },
  poison: {
    id: "poison",
    shortText: "On strike, apply Poison (1 damage at dawn).",
    support: "full",
  },
  ward: {
    id: "ward",
    shortText: "Blocks the next hostile spell.",
    support: "full",
  },
  bloom: {
    id: "bloom",
    shortText: "Gains +1/+1 at the start of your turn.",
    support: "full",
  },
  shatter: {
    id: "shatter",
    shortText: "Strips Ward, then deals bonus damage.",
    support: "partial",
  },
  corrupt: {
    id: "corrupt",
    shortText: "Drain residue on hit (partial).",
    support: "partial",
  },
  overflow: {
    id: "overflow",
    shortText: "Excess damage spills (partial).",
    support: "partial",
  },
  empower: {
    id: "empower",
    shortText: "Scales with spent energy (partial).",
    support: "partial",
  },
  riftbond: { id: "riftbond", shortText: "Companion link bonus.", support: "stub" },
  echo: {
    id: "echo",
    shortText: "Replay a cheap spell once at +1 energy.",
    support: "full",
  },
  awaken: {
    id: "awaken",
    shortText: "Transforms at the start of your next turn.",
    support: "full",
  },
  soulbind: { id: "soulbind", shortText: "Pair allies.", support: "stub" },
  harmony: { id: "harmony", shortText: "Same-element bonus.", support: "stub" },
  ancient: { id: "ancient", shortText: "Once-per-game clause.", support: "stub" },
  heal: {
    id: "heal",
    shortText: "Restores Keeper or unit HP.",
    support: "full",
  },
};

const ALIAS_TO_CANON = (() => {
  const map = new Map<string, string>();
  for (const def of Object.values(KEYWORD_REGISTRY)) {
    map.set(def.id, def.id);
    for (const a of def.aliases ?? []) map.set(a, def.id);
  }
  return map;
})();

export function canonicalizeKeyword(raw: string): string {
  const k = raw.trim().toLowerCase();
  return ALIAS_TO_CANON.get(k) ?? k;
}

export function normalizeKeywordList(keywords: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const raw of keywords) {
    const id = canonicalizeKeyword(raw);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

export function unitHasKeyword(
  keywords: string[] | undefined,
  id: string,
): boolean {
  const want = canonicalizeKeyword(id);
  return (keywords ?? []).some((k) => canonicalizeKeyword(k) === want);
}

/** Summon: Charge units enter ready; Guardian/Taunt seed a status for UI. */
export function applySummonKeywords(input: {
  keywords: string[];
  statuses: TcgStatusInstance[];
}): { exhausted: boolean; statuses: TcgStatusInstance[] } {
  let statuses = [...input.statuses];
  const charge = unitHasKeyword(input.keywords, "charge");
  if (unitHasKeyword(input.keywords, "guardian")) {
    statuses = addStatus(statuses, { id: "taunt", stacks: 1, duration: null });
  }
  if (unitHasKeyword(input.keywords, "ward")) {
    statuses = addStatus(statuses, { id: "ward", stacks: 1, duration: null });
  }
  return { exhausted: !charge, statuses };
}

/** Bloom tick at turn start. */
export function applyBloomTick(input: {
  keywords: string[];
  attack: number;
  health: number;
  maxHealth: number;
  statuses: TcgStatusInstance[];
}): {
  attack: number;
  health: number;
  maxHealth: number;
  statuses: TcgStatusInstance[];
} {
  if (!unitHasKeyword(input.keywords, "bloom")) {
    return {
      attack: input.attack,
      health: input.health,
      maxHealth: input.maxHealth,
      statuses: input.statuses,
    };
  }
  return {
    attack: input.attack + 1,
    health: input.health + 1,
    maxHealth: input.maxHealth + 1,
    statuses: addStatus(input.statuses, {
      id: "bloom_stacks",
      stacks: 1,
      duration: null,
    }),
  };
}

/** Poison damage at dawn — 1 per stack. */
export function poisonDawnDamage(statuses: TcgStatusInstance[]): number {
  return statuses
    .filter((s) => s.id === "poison")
    .reduce((n, s) => n + Math.max(1, s.stacks), 0);
}

/**
 * Legal strike targets for an attacker.
 * Guardian forces targeting unless attacker is Flying and choosing face is allowed.
 */
export function pickCombatTarget(input: {
  attackerKeywords: string[];
  enemyUnits: {
    instanceId: string;
    health: number;
    keywords: string[];
    statuses: TcgStatusInstance[];
  }[];
}): { kind: "unit"; instanceId: string } | { kind: "face" } {
  const guardians = input.enemyUnits.filter(
    (u) =>
      unitHasKeyword(u.keywords, "guardian") || hasStatus(u.statuses, "taunt"),
  );
  const flying = unitHasKeyword(input.attackerKeywords, "flying");

  if (guardians.length > 0) {
    if (flying) {
      const flyingGuardians = guardians.filter((g) =>
        unitHasKeyword(g.keywords, "flying"),
      );
      if (flyingGuardians.length === 0) {
        // Flying may strike the Keeper over grounded Guardians.
        return { kind: "face" };
      }
      const target = flyingGuardians.sort((a, b) => a.health - b.health)[0]!;
      return { kind: "unit", instanceId: target.instanceId };
    }
    const target = guardians.sort((a, b) => a.health - b.health)[0]!;
    return { kind: "unit", instanceId: target.instanceId };
  }

  if (input.enemyUnits.length === 0) return { kind: "face" };

  // Prefer lethal trades, else lowest HP.
  const sorted = [...input.enemyUnits].sort((a, b) => a.health - b.health);
  return { kind: "unit", instanceId: sorted[0]!.instanceId };
}

export function onStrikeApplyKeywords(input: {
  attackerKeywords: string[];
  targetStatuses: TcgStatusInstance[];
}): TcgStatusInstance[] {
  let statuses = input.targetStatuses;
  if (unitHasKeyword(input.attackerKeywords, "poison")) {
    statuses = addStatus(statuses, {
      id: "poison",
      stacks: 1,
      duration: null,
    });
  }
  return statuses;
}

export function listSupportedKeywords(): KeywordDef[] {
  return Object.values(KEYWORD_REGISTRY).filter((k) => k.support !== "stub");
}
