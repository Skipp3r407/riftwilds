/**
 * Validates 10-year expansion foundations are wired and non-empty.
 * Exit 1 on structural failure.
 */

import { ensureCoreDecadePackRegistered } from "../../src/game/expansion/packs/core-decade-pack";
import {
  countContentByKind,
  listExpansionPacks,
} from "../../src/game/expansion/registry";
import { ACHIEVEMENT_CATALOG } from "../../src/game/achievements/catalog";
import { CIVILIZATION_MILESTONES } from "../../src/game/civilization/milestones";
import { SAMPLE_STORY_ARCS } from "../../src/game/story/arcs/sample-branching";
import { FESTIVAL_CATALOG } from "../../src/game/festivals/calendar";
import { resolveLivingWorldClock } from "../../src/game/living-world/clock";
import { featureFlagDefaults } from "../../src/lib/config/feature-flags";

const errors: string[] = [];

function assert(cond: boolean, msg: string) {
  if (!cond) errors.push(msg);
}

ensureCoreDecadePackRegistered();
const packs = listExpansionPacks();
const counts = countContentByKind();
const clock = resolveLivingWorldClock();

assert(packs.length >= 1, "Expected at least one expansion pack");
assert((counts.achievement ?? 0) >= 30, "Achievement registry too small");
assert((counts.milestone ?? 0) >= 10, "Civilization milestones missing");
assert((counts.region ?? 0) === 12, "Expected 12 region content entries");
assert(ACHIEVEMENT_CATALOG.length >= 30, "Achievement catalog seed too small");
assert(CIVILIZATION_MILESTONES.length >= 10, "Milestone catalog too small");
assert(SAMPLE_STORY_ARCS.length >= 2, "Need sample story arcs");
assert(FESTIVAL_CATALOG.length >= 4, "Need festival catalog");
assert(Boolean(clock.labels.season), "Living world clock broken");
assert(
  featureFlagDefaults.EXPANSION_FRAMEWORK_ENABLED === true,
  "EXPANSION_FRAMEWORK_ENABLED should default on for foundations",
);
assert(
  featureFlagDefaults.ECOSYSTEM_DASHBOARD_ENABLED === true,
  "ECOSYSTEM_DASHBOARD_ENABLED should default on",
);

if (errors.length) {
  console.error("validate-expansion FAILED:");
  for (const e of errors) console.error(` - ${e}`);
  process.exit(1);
}

console.log("validate-expansion OK");
console.log(
  JSON.stringify(
    {
      packs: packs.map((p) => ({ id: p.id, entries: p.entryCount })),
      counts,
      season: clock.labels.season,
      achievements: ACHIEVEMENT_CATALOG.length,
      milestones: CIVILIZATION_MILESTONES.length,
    },
    null,
    2,
  ),
);
