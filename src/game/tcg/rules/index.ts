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
