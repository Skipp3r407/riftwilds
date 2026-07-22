/**
 * Canonical Riftwilds battle-deck rules configuration.
 * UI, engine, deck legality, and modes must read from here — not hardcode values.
 */

import type { TcgRarity } from "@/content/tcg/types";

/** Battlefield lane for creatures. */
export type FieldLane = "front" | "back";

/** Spell timing speed. */
export type SpellSpeed = "slow" | "fast" | "reaction";

/** Competitive / casual format ids. */
export type BattleModeId =
  | "standard"
  | "expanded"
  | "legacy"
  | "draft"
  | "sealed"
  | "commander"
  | "quick"
  | "practice"
  | "casual"
  | "ranked"
  | "pve"
  | "arena"
  | "tutorial";

export type CopyLimits = Record<string, number>;

export type BattleRulesConfig = {
  /** Display / schema version for migrations. */
  rulesVersion: string;
  keeper: {
    startingHp: number;
  };
  deck: {
    /** Shuffled main-deck size (Commander is separate). */
    mainDeckSize: number;
    commanderSlots: number;
    /** mainDeckSize + commanderSlots */
    totalPieces: number;
    minCreatures: number;
    maxSpells: number;
    maxSupportCombined: number;
    maxPowerRarityCombined: number;
    copyLimits: CopyLimits;
    powerRarities: readonly string[];
  };
  hand: {
    openingSize: number;
    maxSize: number;
    mulliganOnce: boolean;
  };
  energy: {
    turn1Max: number;
    perTurnGain: number;
    cap: number;
    /** Temporary energy cannot permanently raise the base cap. */
    tempEnergyExpiresEndOfTurn: boolean;
  };
  field: {
    frontlineSlots: number;
    backlineSlots: number;
    terrainSlots: number;
    maxCreatures: number;
  };
  turn: {
    phases: readonly string[];
    /** Soft client cue; server enforcement later. */
    timerSeconds: number;
    reconnectTimerSeconds: number;
    maxTurns: number;
    /** Practice / Quick Battle may auto-pass Second Main. */
    autoSkipSecondMain: boolean;
    /** P1 skips draw on turn 1. */
    firstPlayerSkipsTurn1Draw: boolean;
    /** P2 receives Rift Spark token. */
    secondPlayerRiftSpark: boolean;
    /**
     * Extra temporary Energy granted at the start of P2's first turn
     * (balance lever toward 49–51% first-player win rate; stacks with Rift Spark).
     */
    secondPlayerTurn1BonusEnergy: number;
  };
  combat: {
    minDamageWhenAttacking: number;
    /** Reactions may nest up to this depth. */
    reactionDepth: number;
    reactionWindowSeconds: number;
  };
  zones: {
    useDefeated: boolean;
    useExile: boolean;
    useRiftBurn: boolean;
  };
  riftCollapse: {
    /** Damage on first empty-deck draw attempt. */
    baseDamage: number;
    /** Extra damage per subsequent empty draw. */
    escalateBy: number;
  };
  fairness: {
    rankedUsesNormalizedStats: boolean;
    cosmeticsNeverAffectPower: boolean;
    noPayToWin: boolean;
  };
  tokens: {
    riftSparkDefId: string;
  };
};

/** Standard competitive baseline (also used by practice unless overridden). */
export const STANDARD_BATTLE_RULES: BattleRulesConfig = {
  rulesVersion: "2.0.0",
  keeper: {
    startingHp: 25,
  },
  deck: {
    mainDeckSize: 29,
    commanderSlots: 1,
    totalPieces: 30,
    minCreatures: 14,
    maxSpells: 10,
    maxSupportCombined: 6,
    maxPowerRarityCombined: 3,
    // Unique-only constructed: max 1 of each cardId / gameplay id.
    // Companion variants with different ids (e.g. Dawnkit vs Dawnkit Companion)
    // remain separate cards. Draft may override upward.
    copyLimits: {
      common: 1,
      uncommon: 1,
      rare: 1,
      epic: 1,
      legendary: 1,
      mythic: 1,
      ancient: 1,
      founder: 1,
      seasonal: 1,
      holiday: 1,
      animated: 1,
      foil: 1,
      signed: 1,
      collector: 1,
    } satisfies CopyLimits,
    powerRarities: ["legendary", "mythic", "ancient", "founder"] as const,
  },
  hand: {
    openingSize: 5,
    maxSize: 9,
    mulliganOnce: true,
  },
  energy: {
    turn1Max: 2,
    perTurnGain: 1,
    cap: 10,
    tempEnergyExpiresEndOfTurn: true,
  },
  field: {
    frontlineSlots: 3,
    backlineSlots: 2,
    terrainSlots: 1,
    maxCreatures: 5,
  },
  turn: {
    phases: ["MULLIGAN", "START", "MAIN", "COMBAT", "SECOND_MAIN", "END"],
    timerSeconds: 90,
    reconnectTimerSeconds: 60,
    maxTurns: 40,
    autoSkipSecondMain: false,
    firstPlayerSkipsTurn1Draw: true,
    secondPlayerRiftSpark: true,
    secondPlayerTurn1BonusEnergy: 2,
  },
  combat: {
    minDamageWhenAttacking: 1,
    reactionDepth: 4,
    reactionWindowSeconds: 8,
  },
  zones: {
    useDefeated: true,
    useExile: true,
    useRiftBurn: true,
  },
  riftCollapse: {
    baseDamage: 1,
    escalateBy: 1,
  },
  fairness: {
    rankedUsesNormalizedStats: true,
    cosmeticsNeverAffectPower: true,
    noPayToWin: true,
  },
  tokens: {
    riftSparkDefId: "token-rift-spark",
  },
};

export type ModeRulesOverride = Partial<{
  keeper: Partial<BattleRulesConfig["keeper"]>;
  deck: Partial<BattleRulesConfig["deck"]>;
  hand: Partial<BattleRulesConfig["hand"]>;
  energy: Partial<BattleRulesConfig["energy"]>;
  field: Partial<BattleRulesConfig["field"]>;
  turn: Partial<BattleRulesConfig["turn"]>;
  combat: Partial<BattleRulesConfig["combat"]>;
}>;

export const MODE_RULE_OVERRIDES: Record<BattleModeId, ModeRulesOverride> = {
  standard: {},
  ranked: {},
  casual: {
    turn: { autoSkipSecondMain: true },
  },
  practice: {
    turn: { autoSkipSecondMain: true, timerSeconds: 120 },
  },
  quick: {
    keeper: { startingHp: 20 },
    hand: { openingSize: 5 },
    energy: { turn1Max: 3 },
    turn: {
      autoSkipSecondMain: true,
      timerSeconds: 45,
      maxTurns: 25,
    },
  },
  expanded: {
    deck: {
      // Broader pool; same constructed sizes.
      mainDeckSize: 29,
    },
  },
  legacy: {},
  draft: {
    deck: {
      mainDeckSize: 29,
      minCreatures: 12,
      maxSpells: 12,
      maxSupportCombined: 8,
      copyLimits: {
        ...STANDARD_BATTLE_RULES.deck.copyLimits,
        common: 3,
        uncommon: 3,
        rare: 3,
        epic: 2,
      },
    },
  },
  sealed: {
    deck: {
      mainDeckSize: 29,
      minCreatures: 12,
      maxSpells: 12,
      maxSupportCombined: 8,
    },
  },
  commander: {
    deck: {
      mainDeckSize: 29,
      maxPowerRarityCombined: 4,
    },
  },
  pve: {
    turn: { autoSkipSecondMain: true, timerSeconds: 120 },
  },
  arena: {
    turn: { autoSkipSecondMain: true },
  },
  tutorial: {
    keeper: { startingHp: 25 },
    turn: {
      autoSkipSecondMain: true,
      firstPlayerSkipsTurn1Draw: true,
      secondPlayerRiftSpark: false,
      timerSeconds: 999,
    },
  },
};

function mergeRules(
  base: BattleRulesConfig,
  override: ModeRulesOverride,
): BattleRulesConfig {
  return {
    ...base,
    keeper: { ...base.keeper, ...override.keeper },
    deck: {
      ...base.deck,
      ...override.deck,
      copyLimits: {
        ...base.deck.copyLimits,
        ...(override.deck?.copyLimits ?? {}),
      },
      powerRarities: override.deck?.powerRarities ?? base.deck.powerRarities,
    },
    hand: { ...base.hand, ...override.hand },
    energy: { ...base.energy, ...override.energy },
    field: { ...base.field, ...override.field },
    turn: { ...base.turn, ...override.turn },
    combat: { ...base.combat, ...override.combat },
  };
}

/** Resolve effective rules for a battle mode. */
export function getBattleRules(mode: BattleModeId | string): BattleRulesConfig {
  const id = (mode in MODE_RULE_OVERRIDES ? mode : "standard") as BattleModeId;
  return mergeRules(STANDARD_BATTLE_RULES, MODE_RULE_OVERRIDES[id] ?? {});
}

/** Map match-store mode strings onto battle mode ids. */
export function matchModeToBattleMode(
  mode: string | undefined | null,
): BattleModeId {
  switch (mode) {
    case "ranked":
      return "ranked";
    case "casual":
      return "casual";
    case "practice":
      return "practice";
    case "private":
      return "casual";
    case "quick":
      return "quick";
    case "pve":
      return "pve";
    case "tutorial":
      return "tutorial";
    case "draft":
      return "draft";
    case "sealed":
      return "sealed";
    case "commander":
      return "commander";
    case "expanded":
      return "expanded";
    case "legacy":
      return "legacy";
    case "arena":
      return "arena";
    default:
      return "standard";
  }
}

export function maxCopiesForRarity(
  rarity: TcgRarity | string,
  rules: BattleRulesConfig = STANDARD_BATTLE_RULES,
): number {
  return rules.deck.copyLimits[rarity] ?? 1;
}

export function isPowerRarity(
  rarity: string,
  rules: BattleRulesConfig = STANDARD_BATTLE_RULES,
): boolean {
  return rules.deck.powerRarities.includes(rarity.toLowerCase());
}

/** Energy max at the start of a 1-indexed turn. */
export function energyMaxForTurn(
  turn: number,
  rules: BattleRulesConfig = STANDARD_BATTLE_RULES,
): number {
  const t = Math.max(1, turn);
  return Math.min(
    rules.energy.cap,
    rules.energy.turn1Max + (t - 1) * rules.energy.perTurnGain,
  );
}

/** Rift Collapse damage for the Nth empty-deck draw (1-indexed). */
export function riftCollapseDamage(
  emptyDrawIndex: number,
  rules: BattleRulesConfig = STANDARD_BATTLE_RULES,
): number {
  const n = Math.max(1, emptyDrawIndex);
  return (
    rules.riftCollapse.baseDamage + (n - 1) * rules.riftCollapse.escalateBy
  );
}
