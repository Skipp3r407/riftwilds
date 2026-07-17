/**
 * Living world clock / disaster / festival sim stub for decade foundations.
 * Usage: npx tsx scripts/simulations/living-world-simulator.ts [--days=56]
 */

import { resolveLivingWorldClock, MS_PER_WORLD_DAY } from "../../src/game/living-world/clock";
import { resolveActiveDisaster } from "../../src/game/living-world/disasters";
import { resolveFestivalOccurrences } from "../../src/game/festivals/calendar";

const daysArg = process.argv.find((a) => a.startsWith("--days="));
const days = daysArg ? Number(daysArg.split("=")[1]) : 56;
const start = Date.now();

let disasterDays = 0;
const festivalActiveDays = new Map<string, number>();

for (let d = 0; d < days; d++) {
  const at = start + d * MS_PER_WORLD_DAY;
  const clock = resolveLivingWorldClock(at);
  const disaster = resolveActiveDisaster(clock);
  if (disaster) disasterDays += 1;
  for (const f of resolveFestivalOccurrences(clock)) {
    if (f.active) {
      festivalActiveDays.set(
        f.festival.key,
        (festivalActiveDays.get(f.festival.key) ?? 0) + 1,
      );
    }
  }
}

console.log(
  JSON.stringify(
    {
      simulatedWorldDays: days,
      disasterDays,
      festivalActiveDays: Object.fromEntries(festivalActiveDays),
      sampleNow: resolveLivingWorldClock().labels,
    },
    null,
    2,
  ),
);
