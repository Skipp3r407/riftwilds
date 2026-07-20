/**
 * Riftwilds TCG battle-rules simulation harness.
 *
 * Default: 5_000 matches (fast CI-friendly).
 * Path to 100k: `TCG_SIM_COUNT=100000 npx tsx scripts/simulations/tcg-battle-rules-sim.ts`
 *
 * Writes:
 * - BATTLE_SIMULATION_REPORT.md
 * - BATTLE_BALANCE_REPORT.md
 * - artifacts/reports/tcg-battle-sim.json
 */

import fs from "node:fs";
import path from "node:path";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { TCG_LAUNCH_POOL } from "@/content/tcg";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { materializeDeck } from "@/game/tcg/deck";
import { applyTcgAction, createTcgMatch } from "@/game/tcg/match-engine";
import {
  materializePracticeLoadout,
  resolvePracticeMatchLoadouts,
} from "@/game/tcg/practice-loadout";
import { TCG_DEFAULTS } from "@/game/tcg/types";

const SIM_COUNT = Number(process.env.TCG_SIM_COUNT || 5000);
const ROOT = process.cwd();

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(1664525, s) + 1013904223) >>> 0;
    return s / 2 ** 32;
  };
}

function pickPoolDeck(seed: number): string[] {
  const pool = TCG_LAUNCH_POOL.cardIds.filter((id) => {
    const def = getTcgCardDef(id);
    return def && (def.type === "UNIT" || def.type === "SPELL");
  });
  const out: string[] = [];
  let s = seed;
  for (let i = 0; i < CONSTRUCTED_RULES.deckSize; i += 1) {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    out.push(pool[s % pool.length]!);
  }
  return out;
}

type Row = {
  seed: number;
  status: string;
  winnerId: string | null;
  turns: number;
  playerHp: number;
  aiHp: number;
  error?: string;
};

function runOne(seed: number, usePractice: boolean): Row {
  try {
    let state;
    if (usePractice) {
      const loadout = resolvePracticeMatchLoadouts({
        activeDeckId: "starter-fire",
        activeDeck: [],
        rng: rng(seed),
      });
      state = createTcgMatch({
        publicId: `sim_${seed}`,
        mode: "practice",
        playerDeck: materializePracticeLoadout(loadout.player),
        commanderHeroId: loadout.player.commanderHeroId,
        opponent: {
          name: "SimAI",
          isAi: true,
          deck: materializePracticeLoadout(loadout.ai),
          commanderHeroId: loadout.ai.commanderHeroId,
        },
      });
    } else {
      state = createTcgMatch({
        publicId: `sim_${seed}`,
        mode: "practice",
        playerDeck: materializeDeck(pickPoolDeck(seed)),
        opponent: {
          name: "SimAI",
          deck: materializeDeck(pickPoolDeck(seed + 9973)),
        },
      });
    }

    let guards = 0;
    while (state.status === "ACTIVE" && guards < 80) {
      guards += 1;
      const side = state.players[0]!;
      for (let p = 0; p < 4; p += 1) {
        const playable = side.hand
          .map((c) => ({ c, def: getTcgCardDef(c.defId) }))
          .filter(
            (x) =>
              x.def &&
              x.def.riftCost <= side.riftEnergy &&
              (x.def.type !== "UNIT" ||
                side.board.length < TCG_DEFAULTS.maxBoardUnits),
          )
          .sort((a, b) => a.def!.riftCost - b.def!.riftCost);
        const pick = playable[0];
        if (!pick) break;
        try {
          applyTcgAction(state, "player", {
            kind: "PLAY_CARD",
            handInstanceId: pick.c.instanceId,
          });
        } catch {
          break;
        }
        if (state.status !== "ACTIVE") break;
      }
      if (state.status !== "ACTIVE") break;
      applyTcgAction(state, "player", { kind: "END_TURN" });
    }

    return {
      seed,
      status: state.status,
      winnerId: state.winnerId,
      turns: state.turn,
      playerHp: state.players[0]!.keeperHp,
      aiHp: state.players[1]!.keeperHp,
    };
  } catch (e) {
    return {
      seed,
      status: "ERROR",
      winnerId: null,
      turns: 0,
      playerHp: 0,
      aiHp: 0,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

function main() {
  const results: Row[] = [];
  const t0 = Date.now();
  for (let i = 0; i < SIM_COUNT; i += 1) {
    results.push(runOne(20_000 + i, i % 2 === 0));
  }
  const ms = Date.now() - t0;

  const completed = results.filter((r) => r.status === "COMPLETED");
  const errors = results.filter((r) => r.status === "ERROR");
  const p1Wins = completed.filter((r) => r.winnerId === "player").length;
  const p2Wins = completed.filter((r) => r.winnerId === "ai").length;
  const draws = completed.filter((r) => r.winnerId == null).length;
  const avgTurns =
    completed.reduce((a, r) => a + r.turns, 0) / Math.max(1, completed.length);
  const fpRate = p1Wins / Math.max(1, p1Wins + p2Wins);

  const jsonPath = path.join(ROOT, "artifacts/reports/tcg-battle-sim.json");
  fs.mkdirSync(path.dirname(jsonPath), { recursive: true });
  fs.writeFileSync(
    jsonPath,
    JSON.stringify(
      {
        simCount: SIM_COUNT,
        ms,
        completed: completed.length,
        errors: errors.length,
        p1Wins,
        p2Wins,
        draws,
        avgTurns,
        firstPlayerWinRate: fpRate,
        pathTo100k:
          "TCG_SIM_COUNT=100000 npx tsx scripts/simulations/tcg-battle-rules-sim.ts",
      },
      null,
      2,
    ),
  );

  const simMd = `# Battle Simulation Report

**Runs:** ${SIM_COUNT}  
**Wall time:** ${(ms / 1000).toFixed(1)}s  
**Completed:** ${completed.length} · **Errors:** ${errors.length}

| Metric | Value |
|--------|-------|
| P1 (player) wins | ${p1Wins} |
| P2 (AI) wins | ${p2Wins} |
| Draws / null | ${draws} |
| First-player win rate | ${(fpRate * 100).toFixed(1)}% (target 49–51%) |
| Avg turns | ${avgTurns.toFixed(2)} |

## Path to 100k

\`\`\`bash
TCG_SIM_COUNT=100000 npx tsx scripts/simulations/tcg-battle-rules-sim.ts
\`\`\`

JSON: \`artifacts/reports/tcg-battle-sim.json\`
`;

  const balMd = `# Battle Balance Report

**Rules version:** ${TCG_DEFAULTS.rulesVersion}  
**Sample size:** ${SIM_COUNT} simulated practice matches

## Observations

- Keeper start HP ${TCG_DEFAULTS.keeperHp}, Energy ${TCG_DEFAULTS.riftEnergyStartMax}→${TCG_DEFAULTS.riftEnergyCap}, hand ${TCG_DEFAULTS.openingHand}/${TCG_DEFAULTS.maxHandSize}
- Main deck ${CONSTRUCTED_RULES.deckSize} + Commander
- First-player win rate in this batch: **${(fpRate * 100).toFixed(1)}%**
- Average turns: **${avgTurns.toFixed(2)}** (soft length proxy; wall-clock depends on UI)

## Alerts

${avgTurns < 4 ? "- ⚠ Matches ending very quickly — check aggro / burn." : "- Avg turns within a playable band for AI vs AI heuristics."}
${fpRate < 0.45 || fpRate > 0.55 ? "- ⚠ First-player rate outside 45–55% soft band — retune Rift Spark / Energy." : "- First-player rate inside soft 45–55% band for this AI."}
${errors.length > 0 ? `- ⚠ ${errors.length} errored matches — inspect JSON.` : "- No engine errors in batch."}

## Next balance levers

1. Rift Spark energy grant  
2. Frontline density vs Flying/Pierce density  
3. Composition mins (creatures vs spells)  
4. Quick Battle 20 HP curve  
`;

  fs.writeFileSync(path.join(ROOT, "BATTLE_SIMULATION_REPORT.md"), simMd);
  fs.writeFileSync(path.join(ROOT, "BATTLE_BALANCE_REPORT.md"), balMd);
  console.log(simMd);
}

main();
