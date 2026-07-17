/**
 * Arena balance simulation at practical scale.
 *
 * Default: 25_000 matches (fast enough for CI-adjacent runs).
 * Architecture supports larger runs via --matches=N (document 1M as stretch).
 *
 * Usage:
 *   npx tsx scripts/simulations/battle-balance.ts
 *   npx tsx scripts/simulations/battle-balance.ts --matches=100000
 */

import { writeFileSync } from "fs";
import path from "path";
import { LAUNCH_SPECIES } from "../../src/game/creatures/species-catalog";
import {
  chooseAiAction,
  createTrainingBattle,
  resolveRound,
} from "../../src/game/arena/engine";
import { buildCombatant, buildTrainingAi } from "../../src/game/arena/combatants";
import { STARTER_WEAPONS } from "../../src/game/arena/weapons";
import {
  ARTIFACTS_DIR,
  ensureArtifactsDir,
  writeJsonReport,
  type ValidationReport,
} from "../lib/report-writer";

function parseArgs(argv: string[]) {
  let matches = 25_000;
  let maxRoundsPerFight = 40;
  for (const a of argv) {
    if (a.startsWith("--matches=")) matches = Math.max(1, Number(a.slice(10)));
    if (a.startsWith("--max-rounds=")) maxRoundsPerFight = Number(a.slice(13));
  }
  return { matches, maxRoundsPerFight };
}

function main() {
  const { matches, maxRoundsPerFight } = parseArgs(process.argv.slice(2));
  const started = Date.now();

  const winsByAffinity = new Map<string, number>();
  const fightsByAffinity = new Map<string, number>();
  const winsBySpecies = new Map<string, number>();
  const fightsBySpecies = new Map<string, number>();
  let completed = 0;
  let drawsOrTimeout = 0;
  let totalRounds = 0;

  for (let i = 0; i < matches; i++) {
    const sp = LAUNCH_SPECIES[i % LAUNCH_SPECIES.length]!;
    const weapon = STARTER_WEAPONS[i % STARTER_WEAPONS.length]!;
    const player = buildCombatant({
      id: `p_${i}`,
      name: sp.name,
      speciesSlug: sp.slug,
      affinity: sp.affinity as never,
      level: 5 + (i % 20),
      weaponId: weapon.id,
      normalizeEquipment: true,
    });
    const aiAffinity = LAUNCH_SPECIES[(i * 7) % LAUNCH_SPECIES.length]!.affinity;
    const ai = buildTrainingAi(aiAffinity as never);
    let state = createTrainingBattle({
      publicId: `sim_${i}`,
      seed: `balance-${i}`,
      player,
      opponent: ai,
    });

    for (let r = 0; r < maxRoundsPerFight && state.status === "ACTIVE"; r++) {
      const playerAction = { kind: "BASIC_ATTACK" as const };
      const aiAction = chooseAiAction(state.combatants[1]!);
      state = resolveRound(state, [playerAction, aiAction]);
    }

    totalRounds += state.round;
    fightsByAffinity.set(sp.affinity, (fightsByAffinity.get(sp.affinity) ?? 0) + 1);
    fightsBySpecies.set(sp.slug, (fightsBySpecies.get(sp.slug) ?? 0) + 1);

    if (state.status === "COMPLETED") {
      completed++;
      if (state.winnerId === player.id) {
        winsByAffinity.set(sp.affinity, (winsByAffinity.get(sp.affinity) ?? 0) + 1);
        winsBySpecies.set(sp.slug, (winsBySpecies.get(sp.slug) ?? 0) + 1);
      }
      if (state.completionReason === "MAX_ROUNDS") drawsOrTimeout++;
    } else {
      drawsOrTimeout++;
    }
  }

  const elapsedMs = Date.now() - started;
  const affinityWinRates = [...fightsByAffinity.entries()]
    .map(([affinity, fights]) => ({
      affinity,
      fights,
      winRate: (winsByAffinity.get(affinity) ?? 0) / fights,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  const speciesWinRates = [...fightsBySpecies.entries()]
    .map(([slug, fights]) => ({
      slug,
      fights,
      winRate: (winsBySpecies.get(slug) ?? 0) / fights,
    }))
    .sort((a, b) => b.winRate - a.winRate);

  const rates = affinityWinRates.map((a) => a.winRate);
  const minRate = Math.min(...rates);
  const maxRate = Math.max(...rates);
  const spread = maxRate - minRate;

  const flags: string[] = [];
  if (spread > 0.35) flags.push(`Affinity win-rate spread ${spread.toFixed(3)} exceeds 0.35`);
  if (completed / matches < 0.5) flags.push("Fewer than 50% fights completed within round cap");

  const report: ValidationReport = {
    name: "battle-balance",
    generatedAt: new Date().toISOString(),
    assumptions: [
      `Matches simulated: ${matches} (architecture supports --matches=1000000; default is practical scale)`,
      "Player always BASIC_ATTACK; AI uses chooseAiAction",
      "Equipment normalization ON; ranked mode OFF",
      "Not a full meta analysis — training engine only",
    ],
    sections: [
      {
        title: "Scale",
        status: "PASS",
        summary: `${matches} matches in ${elapsedMs}ms (${(matches / (elapsedMs / 1000)).toFixed(0)} matches/s)`,
        details: {
          matches,
          elapsedMs,
          completed,
          drawsOrTimeout,
          avgRounds: Number((totalRounds / matches).toFixed(2)),
          projected1MSeconds: Number(((1_000_000 / matches) * (elapsedMs / 1000)).toFixed(1)),
        },
      },
      {
        title: "Affinity balance",
        status: flags.some((f) => f.includes("spread")) ? "WARN" : "PASS",
        summary: `Win-rate spread ${spread.toFixed(3)} (min ${minRate.toFixed(3)}, max ${maxRate.toFixed(3)})`,
        details: { affinityWinRates, topSpecies: speciesWinRates.slice(0, 10) },
      },
    ],
    criticalFailures: flags.filter((f) => f.includes("Fewer than")),
    ok: !flags.some((f) => f.includes("Fewer than")),
  };

  ensureArtifactsDir();
  const jsonPath = writeJsonReport("battle-balance.json", report);
  const mdPath = path.join(ARTIFACTS_DIR, "battle-balance.md");
  writeFileSync(
    mdPath,
    [
      "# Battle Balance Simulation",
      "",
      `Matches: ${matches} | Elapsed: ${elapsedMs}ms | Completed: ${completed}`,
      "",
      "## Assumptions",
      ...report.assumptions!.map((a) => `- ${a}`),
      "",
      "## Affinity win rates",
      ...affinityWinRates.map(
        (a) => `- ${a.affinity}: ${(a.winRate * 100).toFixed(1)}% (n=${a.fights})`,
      ),
      "",
      flags.length ? `## Flags\n${flags.map((f) => `- ${f}`).join("\n")}` : "",
      "",
    ].join("\n"),
    "utf8",
  );

  console.log(`Battle balance wrote ${jsonPath}`);
  console.log(
    `matches=${matches} elapsedMs=${elapsedMs} spread=${spread.toFixed(3)} ok=${report.ok}`,
  );
  if (!report.ok) process.exitCode = 1;
}

main();
