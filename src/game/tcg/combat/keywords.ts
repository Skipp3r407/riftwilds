/**
 * Keyword registry + combat handlers.
 * Card UI / components must NOT hardcode keyword logic — resolve via this module.
 */

import {
  addStatus,
  hasStatus,
  type TcgStatusInstance,
} from "@/game/tcg/combat/status";
import type { FieldLane } from "@/game/tcg/rules/battle-rules-config";

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
    shortText: "May attack the turn it arrives (including the Keeper).",
    support: "full",
  },
  rush: {
    id: "rush",
    shortText: "May attack creatures the turn it arrives, but not the Keeper.",
    support: "full",
  },
  swift: {
    id: "swift",
    shortText: "May act immediately when summoned with Energy to spare.",
    support: "partial",
  },
  vigilant: {
    id: "vigilant",
    shortText: "Does not Exhaust after defending.",
    support: "partial",
  },
  guardian: {
    id: "guardian",
    aliases: ["taunt", "guard"],
    shortText: "Must be attacked before other creatures.",
    support: "full",
  },
  flying: {
    id: "flying",
    shortText: "May strike the Keeper over grounded Frontline / Guardians.",
    support: "full",
  },
  pierce: {
    id: "pierce",
    aliases: ["reach"],
    shortText: "May strike the Keeper through Frontline blockers.",
    support: "full",
  },
  stealth: {
    id: "stealth",
    shortText: "May strike the Keeper once while stealthed (stub timing).",
    support: "stub",
  },
  siege: {
    id: "siege",
    shortText: "Prefers striking the Keeper when legal.",
    support: "partial",
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
  "rift-spark": {
    id: "rift-spark",
    shortText: "Temporary energy token — exiles after use.",
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

export type SummonKeywordResult = {
  exhausted: boolean;
  statuses: TcgStatusInstance[];
  /** Rush: ready vs creatures but blocked from Keeper. */
  cannotStrikeKeeper: boolean;
};

/**
 * Summon readiness:
 * - Charge / Swift → ready, may strike Keeper
 * - Rush → ready, cannot strike Keeper this turn
 * - Else → exhausted
 */
export function applySummonKeywords(input: {
  keywords: string[];
  statuses: TcgStatusInstance[];
  /** Swift: ready if controller has remaining energy after the summon. */
  energyRemaining?: number;
}): SummonKeywordResult {
  let statuses = [...input.statuses];
  const charge = unitHasKeyword(input.keywords, "charge");
  const rush = unitHasKeyword(input.keywords, "rush");
  const swift =
    unitHasKeyword(input.keywords, "swift") &&
    (input.energyRemaining ?? 0) > 0;

  if (unitHasKeyword(input.keywords, "guardian")) {
    statuses = addStatus(statuses, { id: "taunt", stacks: 1, duration: null });
  }
  if (unitHasKeyword(input.keywords, "ward")) {
    statuses = addStatus(statuses, { id: "ward", stacks: 1, duration: null });
  }

  if (charge || swift) {
    return { exhausted: false, statuses, cannotStrikeKeeper: false };
  }
  if (rush) {
    return { exhausted: false, statuses, cannotStrikeKeeper: true };
  }
  return { exhausted: true, statuses, cannotStrikeKeeper: false };
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

function canBypassFrontline(attackerKeywords: string[]): boolean {
  return (
    unitHasKeyword(attackerKeywords, "flying") ||
    unitHasKeyword(attackerKeywords, "pierce") ||
    unitHasKeyword(attackerKeywords, "stealth") ||
    unitHasKeyword(attackerKeywords, "siege")
  );
}

/**
 * Legal strike targets.
 * 1) Guardians force targeting (Flying may ignore grounded Guardians for face).
 * 2) Else Frontline protects Keeper unless attacker has Flying/Pierce/etc.
 * 3) Rush units never choose face.
 */
export function pickCombatTarget(input: {
  attackerKeywords: string[];
  cannotStrikeKeeper?: boolean;
  enemyUnits: {
    instanceId: string;
    health: number;
    keywords: string[];
    statuses: TcgStatusInstance[];
    lane?: FieldLane;
  }[];
}):
  | { kind: "unit"; instanceId: string }
  | { kind: "face" }
  | { kind: "none" } {
  const living = input.enemyUnits.filter((u) => u.health > 0);
  const guardians = living.filter(
    (u) =>
      unitHasKeyword(u.keywords, "guardian") || hasStatus(u.statuses, "taunt"),
  );
  const flying = unitHasKeyword(input.attackerKeywords, "flying");
  const bypass = canBypassFrontline(input.attackerKeywords);
  const blockFace = Boolean(input.cannotStrikeKeeper);

  if (guardians.length > 0) {
    if (flying) {
      const flyingGuardians = guardians.filter((g) =>
        unitHasKeyword(g.keywords, "flying"),
      );
      if (flyingGuardians.length === 0 && !blockFace) {
        return { kind: "face" };
      }
      const pool = flyingGuardians.length > 0 ? flyingGuardians : guardians;
      const target = pool.sort((a, b) => a.health - b.health)[0]!;
      return { kind: "unit", instanceId: target.instanceId };
    }
    const target = guardians.sort((a, b) => a.health - b.health)[0]!;
    return { kind: "unit", instanceId: target.instanceId };
  }

  const frontline = living.filter((u) => (u.lane ?? "front") === "front");
  if (frontline.length > 0 && !bypass) {
    const target = frontline.sort((a, b) => a.health - b.health)[0]!;
    return { kind: "unit", instanceId: target.instanceId };
  }

  if (living.length === 0) {
    return blockFace ? { kind: "none" } : { kind: "face" };
  }

  if (blockFace) {
    const sorted = [...living].sort((a, b) => a.health - b.health);
    return { kind: "unit", instanceId: sorted[0]!.instanceId };
  }

  // Empty frontline or bypass keywords → Keeper is legal.
  if (frontline.length === 0 || bypass) {
    return { kind: "face" };
  }

  const sorted = [...living].sort((a, b) => a.health - b.health);
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
