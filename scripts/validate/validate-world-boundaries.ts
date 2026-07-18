/**
 * Audit playable bounds, edge walls, transitions, and spawn containment.
 * Usage: npx tsx scripts/validate/validate-world-boundaries.ts
 */

import { allBlueprints } from "../../src/game/world-maps/blueprints";
import { auditAllBlueprints } from "../../src/game/world-maps/boundaries/audit";

function main() {
  const results = auditAllBlueprints(allBlueprints());
  let fails = 0;
  for (const { slug, result } of results) {
    const crit = result.issues.filter((i) => i.severity === "critical");
    const warns = result.issues.filter((i) => i.severity === "warn");
    const status = result.ok ? "OK" : "FAIL";
    if (!result.ok) fails += 1;
    console.log(
      `${slug}: ${status} · walls=${result.stats.edgeWalls} solids=${result.stats.solidColliders} transitions=${result.stats.transitions} deepWater=${result.stats.deepWater}`,
    );
    for (const i of crit) console.log(`  ✗ ${i.code}: ${i.detail}`);
    for (const i of warns) console.log(`  ⚠ ${i.code}: ${i.detail}`);
  }
  console.log(
    fails
      ? `\nBoundary audit FAILED (${fails} regions)`
      : `\nBoundary audit passed (${results.length} regions)`,
  );
  if (fails) process.exitCode = 1;
}

main();
