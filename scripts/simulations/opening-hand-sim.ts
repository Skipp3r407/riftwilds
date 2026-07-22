/**
 * Opening-hand simulation — dead-hand % and turn-1 playable rate.
 *
 * Default: 10_000 deals. Override: OPENING_HAND_SIM_COUNT=2000 npx tsx …
 *
 * Writes:
 * - docs/OPENING_HAND_SYSTEM.md (stats section refreshed by report)
 * - artifacts/reports/opening-hand-sim.json
 */

import fs from "node:fs";
import path from "node:path";
import { TCG_LAUNCH_POOL, getCardById } from "@/content/tcg";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { isCombatEligibleCard } from "@/content/tcg/framework/combat-eligibility";
import { clearTcgCardCatalogCache, getTcgCardDef } from "@/game/tcg/card-catalog";
import { materializeDeck, shuffleDeck } from "@/game/tcg/deck";
import {
  ensureOpeningHandPlayable,
  openingHandHasPlayable,
} from "@/game/tcg/rules/opening-hand";
import { STANDARD_BATTLE_RULES } from "@/game/tcg/rules/battle-rules-config";
import {
  analyzeCurve,
  formatCurveHistogram,
  isCollectibleZeroCostCombat,
} from "@/game/tcg/rules/mana-curve";
import { TCG_CARDS } from "@/content/tcg";

const SIM_COUNT = Number(process.env.OPENING_HAND_SIM_COUNT || 10000);
const ROOT = process.cwd();
const OPENING = STANDARD_BATTLE_RULES.hand.openingSize;
const TURN1 = STANDARD_BATTLE_RULES.energy.turn1Max;

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function launchDeckIds(seed: number): string[] {
  const pool = TCG_LAUNCH_POOL.cardIds.filter((id) => {
    const card = getCardById(id);
    if (!card || !isCombatEligibleCard(id, card.type)) return false;
    const def = getTcgCardDef(id);
    return Boolean(def && def.type !== "AURA");
  });
  const r = rng(seed);
  const shuffled = shuffleDeck([...pool], r);
  return shuffled.slice(0, CONSTRUCTED_RULES.deckSize);
}

type Acc = {
  rawDead: number;
  shapedDead: number;
  rawT1: number;
  shapedT1: number;
};

function run(): void {
  clearTcgCardCatalogCache();
  const combat = TCG_CARDS.filter(
    (c) =>
      !c.isToken &&
      isCombatEligibleCard(c.id, c.type) &&
      c.type !== "commander",
  );
  const curve = analyzeCurve(combat);
  const zero = combat.filter(isCollectibleZeroCostCombat);

  const acc: Acc = { rawDead: 0, shapedDead: 0, rawT1: 0, shapedT1: 0 };

  for (let i = 0; i < SIM_COUNT; i += 1) {
    const ids = launchDeckIds(i * 9973 + 17);
    const deck = materializeDeck(ids);
    const rawHand = deck.slice(0, OPENING);
    const rawOk = openingHandHasPlayable(rawHand, {
      maxOpenCost: TURN1,
      practiceUsefulOnly: false,
    });
    if (rawOk) acc.rawT1 += 1;
    else acc.rawDead += 1;

    const shaped = ensureOpeningHandPlayable(deck, {
      openingSize: OPENING,
      maxOpenCost: TURN1,
      practiceUsefulOnly: false,
    });
    const shapedHand = shaped.slice(0, OPENING);
    const shapedOk = openingHandHasPlayable(shapedHand, {
      maxOpenCost: TURN1,
      practiceUsefulOnly: false,
    });
    if (shapedOk) acc.shapedT1 += 1;
    else acc.shapedDead += 1;
  }

  const report = {
    simCount: SIM_COUNT,
    openingSize: OPENING,
    turn1Energy: TURN1,
    rulesVersion: STANDARD_BATTLE_RULES.rulesVersion,
    poolCurve: {
      total: curve.total,
      histogram: formatCurveHistogram(curve),
      averageCost: Number(curve.averageCost.toFixed(3)),
      zeroCost: zero.length,
      zeroPct: Number(((100 * zero.length) / Math.max(1, curve.total)).toFixed(2)),
    },
    raw: {
      deadHandPct: Number(((100 * acc.rawDead) / SIM_COUNT).toFixed(3)),
      t1PlayablePct: Number(((100 * acc.rawT1) / SIM_COUNT).toFixed(3)),
    },
    shaped: {
      deadHandPct: Number(((100 * acc.shapedDead) / SIM_COUNT).toFixed(3)),
      t1PlayablePct: Number(((100 * acc.shapedT1) / SIM_COUNT).toFixed(3)),
    },
  };

  const outDir = path.join(ROOT, "artifacts", "reports");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "opening-hand-sim.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
}

run();
