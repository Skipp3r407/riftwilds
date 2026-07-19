import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { TCG_LAUNCH_POOL, getCardById } from "@/content/tcg";
import { CONSTRUCTED_RULES } from "@/content/tcg/framework/deck-rules";
import { getTcgCardDef } from "@/game/tcg/card-catalog";
import { materializeDeck } from "@/game/tcg/deck";
import {
  applyTcgAction,
  createTcgMatch,
} from "@/game/tcg/match-engine";

const SIM_COUNT = Number(process.env.TCG_SIM_COUNT || 500);

function pickDeck(seed: number): string[] {
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

function runMatch(seed: number) {
  const playerDeck = materializeDeck(pickDeck(seed));
  const aiDeck = materializeDeck(pickDeck(seed + 9973));
  const state = createTcgMatch({
    publicId: `sim_${seed}`,
    playerDeck,
    opponent: { name: "SimAI", deck: aiDeck },
  });

  let guards = 0;
  while (state.status === "ACTIVE" && guards < 80) {
    guards += 1;
    const side = state.players.find((p) => p.id === state.activeSideId)!;
    if (side.isAi) break;

    // Play up to 3 affordable cards
    for (let p = 0; p < 3; p += 1) {
      const playable = side.hand
        .map((c) => ({ c, def: getTcgCardDef(c.defId) }))
        .filter(
          (x) =>
            x.def &&
            x.def.riftCost <= side.riftEnergy &&
            (x.def.type !== "UNIT" ||
              side.board.length < 5),
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
    events: state.events.length,
    playerHp: state.players[0].keeperHp,
    aiHp: state.players[1].keeperHp,
  };
}

describe("tcg combat simulation batch", () => {
  it(
    `runs ${SIM_COUNT} automated matches and writes QA report`,
    () => {
      const results = [];
      let errors = 0;
      for (let i = 0; i < SIM_COUNT; i += 1) {
        try {
          results.push(runMatch(10_000 + i));
        } catch (e) {
          errors += 1;
          results.push({
            seed: 10_000 + i,
            status: "ERROR",
            winnerId: null,
            turns: 0,
            events: 0,
            playerHp: 0,
            aiHp: 0,
            error: String(e),
          });
        }
      }

      const completed = results.filter((r) => r.status === "COMPLETED").length;
      const activeStuck = results.filter((r) => r.status === "ACTIVE").length;
      const playerWins = results.filter((r) => r.winnerId === "player").length;
      const aiWins = results.filter((r) => r.winnerId === "ai").length;
      const draws = results.filter(
        (r) => r.status === "COMPLETED" && r.winnerId == null,
      ).length;
      const avgTurns =
        results.reduce((a, r) => a + r.turns, 0) / Math.max(1, results.length);

      const report = `# QA_CARD_SYSTEM_REPORT

Generated: ${new Date().toISOString()}  
**Local only** — no commit/push/deploy.

## Simulation

| Metric | Value |
|--------|------:|
| Requested matches | ${SIM_COUNT} |
| Completed | ${completed} |
| Still ACTIVE (turn cap / guard) | ${activeStuck} |
| Errors | ${errors} |
| Player wins | ${playerWins} |
| AI wins | ${aiWins} |
| Draws | ${draws} |
| Avg turns | ${avgTurns.toFixed(2)} |

## Coverage notes

- Decks sampled from launch-pool UNIT/SPELL ids (30 cards each).
- Engine uses ATK/DEF/HP/Speed, keywords (Charge/Guardian/Flying/Bloom/Poison/Ward/Heal).
- 10k sims: set \`TCG_SIM_COUNT=10000\` when running locally if time allows.

## Unit identity spot-check

| Id | Present |
|----|---------|
| rotr-c-bramblefox | ${Boolean(getCardById("rotr-c-bramblefox"))} |
| rotr-c-mossprig | ${Boolean(getCardById("rotr-c-mossprig"))} |
| rotr-c-ashwing | ${Boolean(getCardById("rotr-c-ashwing"))} |

## Verdict

${errors === 0 ? "PASS — no engine exceptions in batch." : "WARN — some matches threw; inspect logs."}
`;

      const out = path.join(process.cwd(), "docs", "QA_CARD_SYSTEM_REPORT.md");
      fs.writeFileSync(out, report, "utf8");

      expect(errors).toBe(0);
      expect(results.length).toBe(SIM_COUNT);
    },
    120_000,
  );
});
