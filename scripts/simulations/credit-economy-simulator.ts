/**
 * Credits economy simulation — 7 / 30 / 90 day stubs.
 * Models faucet caps + sink absorption. Not a promise of live balances.
 *
 * Usage: npx tsx scripts/simulations/credit-economy-simulator.ts
 */

import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import {
  FAUCET_RULES,
  SINK_RULES,
  STARTER_CREDITS,
  CREDITS_DISCLAIMER,
} from "../../src/lib/credits/config";
import { runCreditPlaythrough } from "../../src/lib/credits/playthrough";

type DaySim = {
  days: number;
  players: number;
  projectedFaucetPerPlayer: number;
  projectedSinkPerPlayer: number;
  netPerPlayer: number;
  circulationEstimate: number;
  sinkRatio: number;
};

function dailyFaucetBudget(): number {
  return Object.values(FAUCET_RULES).reduce((sum, r) => {
    if (r.reason === "ADMIN_ADJUST" || r.reason === "STARTER_GRANT") return sum;
    return sum + Math.min(r.dailyCap, r.maxPerGrant * r.dailyGrantCount);
  }, 0);
}

function assumedDailySink(): number {
  // Conservative player spend mix
  return (
    40 + // NPC shop
    20 + // travel
    15 + // repair
    25 + // craft fees
    30 + // restoration donate avg
    10 // marketplace fees
  );
}

function simulate(days: number, players: number): DaySim {
  const faucet = Math.min(dailyFaucetBudget() * 0.55, 400); // utilization
  const sink = assumedDailySink();
  const starter = STARTER_CREDITS;
  const netPerPlayer = starter / days + (faucet - sink);
  const circulationEstimate = Math.max(0, Math.floor(players * (starter + (faucet - sink) * days)));
  return {
    days,
    players,
    projectedFaucetPerPlayer: Math.round(faucet),
    projectedSinkPerPlayer: sink,
    netPerPlayer: Math.round(netPerPlayer),
    circulationEstimate,
    sinkRatio: sink / Math.max(1, faucet),
  };
}

function main() {
  const playthrough = runCreditPlaythrough("sim-keeper");
  const horizons = [7, 30, 90].map((d) => simulate(d, 1000));

  const report = {
    ok: playthrough.passed && horizons.every((h) => h.sinkRatio >= 0.35),
    disclaimer: CREDITS_DISCLAIMER,
    generatedAt: new Date().toISOString(),
    playthrough: {
      passed: playthrough.passed,
      earned: playthrough.earned,
      spent: playthrough.spent,
      finalBalance: playthrough.finalBalance,
      steps: playthrough.steps.length,
    },
    horizons,
    faucetRulesCount: Object.keys(FAUCET_RULES).length,
    sinkRulesCount: Object.keys(SINK_RULES).length,
    notes: [
      "Simulation is a model — not live ledger truth.",
      "No extreme auto-tuning; admin adjusts config.",
      "Credits are not SOL / token profit.",
    ],
  };

  const outDir = path.join(process.cwd(), "artifacts", "reports");
  mkdirSync(outDir, { recursive: true });
  const outJson = path.join(outDir, "credit-economy-simulator.json");
  writeFileSync(outJson, JSON.stringify(report, null, 2));

  const md = [
    "# Credit Economy Simulation",
    "",
    CREDITS_DISCLAIMER,
    "",
    `Generated: ${report.generatedAt}`,
    "",
    `Playthrough passed: **${report.playthrough.passed}** (earned ${report.playthrough.earned}, spent ${report.playthrough.spent}, balance ${report.playthrough.finalBalance})`,
    "",
    "| Days | Faucet/player/day | Sink/player/day | Sink ratio | Circulation est. (1k players) |",
    "|------|-------------------|-----------------|------------|-------------------------------|",
    ...horizons.map(
      (h) =>
        `| ${h.days} | ${h.projectedFaucetPerPlayer} | ${h.projectedSinkPerPlayer} | ${h.sinkRatio.toFixed(2)} | ${h.circulationEstimate.toLocaleString()} |`,
    ),
    "",
    report.ok ? "Status: OK (model)" : "Status: REVIEW (sink ratio or playthrough)",
    "",
  ].join("\n");
  writeFileSync(path.join(outDir, "credit-economy-simulator.md"), md);
  console.log(md);
  console.log(`Wrote ${outJson}`);
  process.exit(report.ok ? 0 : 1);
}

main();
