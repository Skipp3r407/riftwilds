export {
  STANDARD_BATTLE_RULES,
  MODE_RULE_OVERRIDES,
  getBattleRules,
  matchModeToBattleMode,
  maxCopiesForRarity,
  isPowerRarity,
  energyMaxForTurn,
  riftCollapseDamage,
  type BattleRulesConfig,
  type BattleModeId,
  type FieldLane,
  type SpellSpeed,
  type CopyLimits,
  type ModeRulesOverride,
} from "@/game/tcg/rules/battle-rules-config";

export {
  RIFT_SPARK_TOKEN,
  isRiftSparkToken,
} from "@/game/tcg/rules/rift-spark";

export {
  auditDeckMigration,
  migrateMainDeckIds,
  type DeckMigrationReport,
  type DeckMigrationFlag,
} from "@/game/tcg/rules/deck-migration";

export {
  countDeckComposition,
  validateComposition,
  isCreatureOrCompanion,
  isSpellCard,
  isSupportSlotCard,
} from "@/game/tcg/rules/deck-composition";

export {
  analyzeCurve,
  analyzeDeckCurveWarnings,
  countZeroCostInDeck,
  formatCurveHistogram,
  type CurveBuckets,
  type CurveWarning,
} from "@/game/tcg/rules/mana-curve";

export {
  ensureOpeningHandPlayable,
  openingHandHasPlayable,
  isOpeningPlayable,
} from "@/game/tcg/rules/opening-hand";

export {
  auditZeroCostCard,
  ZERO_COST_POOL_TARGET,
  ZERO_COST_FORBIDDEN_KEYWORDS,
} from "@/game/tcg/rules/zero-cost-design";

export {
  TCG_CURVE_TAGS,
  deriveCurveTags,
  normalizeCurveTags,
  type TcgCurveTag,
} from "@/game/tcg/rules/card-tags";
