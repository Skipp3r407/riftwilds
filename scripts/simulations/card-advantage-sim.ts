/**
 * Card-advantage / hand-management simulation (Rules v2.2).
 *
 * Reports avg hand size by turn, dead-turn frequency, avg playable cards/turn,
 * and which archetypes starve without filter tools.
 *
 * Default: 2_000 matches. Override: CARD_ADV_SIM_COUNT=5000 npx tsx …
 *
 * Writes: artifacts/reports/card-advantage-sim.json
 */

import fs from "node:fs";
import path from "node:path";
import { TCG_LAUNCH_POOL, getCardById } from "@/content/tcg";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { isCombatEligibleCard } from "@/content/tcg/framework/combat-eligibility";
import { clearTcgCardCatalogCache, getTcgCardDef } from "@/game/tcg/card-catalog";
import { materializeDeck, shuffleDeck } from "@/game/tcg/deck";
import {
  applyTcgAction,
  createTcgMatch,
} from "@/game/tcg/match-engine";
import { STANDARD_BATTLE_RULES } from "@/game/tcg/rules/battle-rules-config";
import {
  analyzeCurve,
  analyzeDeckCurveWarnings,
} from "@/game/tcg/rules/mana-curve";
import { resolvePlayCost, playCostContextFromSide } from "@/game/tcg/play-cost";
import { canAffordRiftCost } from "@/game/tcg/rift-energy";

const SIM_COUNT = Number(process.env.CARD_ADV_SIM_COUNT || 2000);
const MAX_TURNS = 12;
const ROOT = process.cwd();

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function launchDeckIds(seed: number, bias: "aggro" | "mid" | "control"): string[] {
  const pool = TCG_LAUNCH_POOL.cardIds.filter((id) => {
    const card = getCardById(id);
    if (!card || !isCombatEligibleCard(id, card.type)) return false;
    const def = getTcgCardDef(id);
    return Boolean(def && def.type !== "AURA");
  });
  const r = rng(seed);
  const scored = pool.map((id) => {
    const cost = getTcgCardDef(id)?.riftCost ?? 3;
    let w = 1;
    if (bias === "aggro") w = cost <= 2 ? 3 : cost >= 5 ? 0.3 : 1;
    if (bias === "control") w = cost >= 4 ? 2.5 : cost <= 1 ? 0.5 : 1;
    return { id, w };
  });
  const picked: string[] = [];
  const used = new Set<string>();
  while (picked.length < CONSTRUCTED_RULES.deckSize && scored.length > 0) {
    const total = scored.reduce((a, s) => a + (used.has(s.id) ? 0 : s.w), 0);
    let roll = r() * total;
    let choice = scored.find((s) => !used.has(s.id))!;
    for (const s of scored) {
      if (used.has(s.id)) continue;
      roll -= s.w;
      if (roll <= 0) {
        choice = s;
        break;
      }
    }
    used.add(choice.id);
    picked.push(choice.id);
  }
  return picked;
}

type TurnSample = {
  turn: number;
  handSize: number;
  playable: number;
  dead: boolean;
};

type ArchetypeAcc = {
  matches: number;
  deadTurns: number;
  turns: number;
  handSum: number;
  playableSum: number;
  starvationHits: number;
};

function countPlayable(state: ReturnType<typeof createTcgMatch>, sideId: string): number {
  const side = state.players.find((p) => p.id === sideId)!;
  return side.hand.filter((c) => {
    const def = getTcgCardDef(c.defId);
    if (!def) return false;
    const cost = resolvePlayCost(def, playCostContextFromSide(side)).cost;
    return canAffordRiftCost(side.riftEnergy, cost);
  }).length;
}

function runMatch(
  seed: number,
  bias: "aggro" | "mid" | "control",
): TurnSample[] {
  const ids = launchDeckIds(seed, bias);
  const deck = materializeDeck(ids);
  const state = createTcgMatch({
    publicId: `sim_${seed}`,
    mode: "practice",
    skipMulligan: true,
    playerDeck: deck,
    rng: rng(seed + 99),
  });

  const samples: TurnSample[] = [];
  let guard = 0;
  while (state.status === "ACTIVE" && state.turn <= MAX_TURNS && guard < 80) {
    guard += 1;
    if (state.activeSideId !== "player" || state.phase === "MULLIGAN") {
      break;
    }
    const side = state.players[0]!;
    const playable = countPlayable(state, "player");
    const dead = playable === 0 && side.hand.length > 0;
    samples.push({
      turn: state.turn,
      handSize: side.hand.length,
      playable,
      dead,
    });

    // Greedy: play highest affordable, else channel/focus, else end.
    let plays = 0;
    while (plays < 6 && state.status === "ACTIVE" && state.activeSideId === "player") {
      const hand = [...side.hand];
      const ranked = hand
        .map((c) => ({ c, def: getTcgCardDef(c.defId) }))
        .filter((x) => x.def)
        .map((x) => ({
          ...x,
          cost: resolvePlayCost(x.def!, playCostContextFromSide(side)).cost,
        }))
        .filter((x) => canAffordRiftCost(side.riftEnergy, x.cost))
        .sort((a, b) => b.cost - a.cost);
      if (ranked[0]) {
        try {
          applyTcgAction(state, "player", {
            kind: "PLAY_CARD",
            handInstanceId: ranked[0].c.instanceId,
          });
          plays += 1;
          continue;
        } catch {
          break;
        }
      }
      try {
        applyTcgAction(state, "player", { kind: "ENERGY_TO_DRAW" });
        plays += 1;
        continue;
      } catch {
        /* unused */
      }
      try {
        applyTcgAction(state, "player", { kind: "COMMANDER_DRAW" });
        plays += 1;
        continue;
      } catch {
        /* unused */
      }
      break;
    }

    if (state.status !== "ACTIVE") break;
    if (state.activeSideId !== "player") continue;
    try {
      applyTcgAction(state, "player", { kind: "END_TURN" });
    } catch {
      break;
    }
  }
  return samples;
}

function run(): void {
  clearTcgCardCatalogCache();
  const byArch: Record<string, ArchetypeAcc> = {
    aggro: {
      matches: 0,
      deadTurns: 0,
      turns: 0,
      handSum: 0,
      playableSum: 0,
      starvationHits: 0,
    },
    mid: {
      matches: 0,
      deadTurns: 0,
      turns: 0,
      handSum: 0,
      playableSum: 0,
      starvationHits: 0,
    },
    control: {
      matches: 0,
      deadTurns: 0,
      turns: 0,
      handSum: 0,
      playableSum: 0,
      starvationHits: 0,
    },
  };
  const handByTurn: Record<number, { n: number; sum: number }> = {};
  let totalDead = 0;
  let totalTurns = 0;
  let totalPlayable = 0;

  const biases = ["aggro", "mid", "control"] as const;
  for (let i = 0; i < SIM_COUNT; i += 1) {
    const bias = biases[i % 3]!;
    const samples = runMatch(i * 7919 + 3, bias);
    const acc = byArch[bias]!;
    acc.matches += 1;
    let matchDead = 0;
    for (const s of samples) {
      acc.turns += 1;
      acc.handSum += s.handSize;
      acc.playableSum += s.playable;
      totalTurns += 1;
      totalPlayable += s.playable;
      if (s.dead) {
        acc.deadTurns += 1;
        totalDead += 1;
        matchDead += 1;
      }
      const bucket = (handByTurn[s.turn] ??= { n: 0, sum: 0 });
      bucket.n += 1;
      bucket.sum += s.handSize;
    }
    if (matchDead >= 3) acc.starvationHits += 1;

    // Curve warnings for the seeded list (once per archetype sample).
    if (i < 3) {
      const ids = launchDeckIds(i * 7919 + 3, bias);
      const cards = ids.map((id) => getCardById(id)!).filter(Boolean);
      analyzeDeckCurveWarnings(cards, STANDARD_BATTLE_RULES);
      analyzeCurve(cards);
    }
  }

  const avgHandByTurn: Record<string, number> = {};
  for (const [t, v] of Object.entries(handByTurn)) {
    avgHandByTurn[t] = v.sum / Math.max(1, v.n);
  }

  const report = {
    rulesVersion: STANDARD_BATTLE_RULES.rulesVersion,
    matches: SIM_COUNT,
    maxTurnsSampled: MAX_TURNS,
    avgHandSizeByTurn: avgHandByTurn,
    deadTurnFrequency: totalTurns ? totalDead / totalTurns : 0,
    avgPlayableCardsPerTurn: totalTurns ? totalPlayable / totalTurns : 0,
    archetypes: Object.fromEntries(
      Object.entries(byArch).map(([k, a]) => [
        k,
        {
          matches: a.matches,
          deadTurnRate: a.turns ? a.deadTurns / a.turns : 0,
          avgHandSize: a.turns ? a.handSum / a.turns : 0,
          avgPlayable: a.turns ? a.playableSum / a.turns : 0,
          starvationMatchRate: a.matches ? a.starvationHits / a.matches : 0,
        },
      ]),
    ),
    notes: [
      "Dead turn = hand non-empty but zero affordable plays at turn sample.",
      "Starvation match = ≥3 dead turns in first 12 turns.",
      "Standard: 1 draw/turn start; no auto-draw-on-play.",
      "Sim uses Channel/Focus when no plays remain.",
    ],
  };

  const outDir = path.join(ROOT, "artifacts", "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outPath = path.join(outDir, "card-advantage-sim.json");
  fs.writeFileSync(outPath, JSON.stringify(report, null, 2));
  console.log(JSON.stringify(report, null, 2));
  console.log(`Wrote ${outPath}`);
}

run();
