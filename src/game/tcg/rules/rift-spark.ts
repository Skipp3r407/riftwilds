/**
 * Rift Spark — second-player balance token (not collectible).
 */

import type { TcgCardDef } from "@/game/tcg/types";
import { STANDARD_BATTLE_RULES } from "@/game/tcg/rules/battle-rules-config";

export const RIFT_SPARK_DEF_ID = STANDARD_BATTLE_RULES.tokens.riftSparkDefId;

/** Synthetic engine def for the temporary Rift Spark card. */
export const RIFT_SPARK_TOKEN: TcgCardDef = {
  id: RIFT_SPARK_DEF_ID,
  name: "Rift Spark",
  type: "SPELL",
  affinity: "SPIRIT",
  riftCost: 0,
  power: 0,
  attack: 0,
  health: 0,
  defense: 0,
  speed: 0,
  rarity: "COMMON",
  description:
    "Gain 1 temporary Rift Energy until the end of this turn. Exile this card.",
  maxCopies: 0,
  keywords: ["rift-spark"],
  contentType: "token",
  competitiveEligible: true,
  spellSpeed: "fast",
};

export function isRiftSparkToken(defId: string): boolean {
  return defId === RIFT_SPARK_DEF_ID;
}
