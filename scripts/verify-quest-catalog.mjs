import { readFileSync } from "node:fs";

const seed = readFileSync("src/game/quests/quest-catalog.ts", "utf8");
const exp = readFileSync("src/game/quests/quest-catalog-expansion.ts", "utf8");

const seedKeys = [...seed.matchAll(/^\s+key:\s*"([^"]+)"/gm)]
  .map((m) => m[1])
  .filter((k) => !k.includes("/") && !["sproutfall-grove", "cindercrag-basin"].includes(k));

// Seed file also has REGION_NAMES keys — take only from QUEST_CATALOG_SEED block
const seedStart = seed.indexOf("const QUEST_CATALOG_SEED");
const seedEnd = seed.indexOf("export const QUEST_CATALOG:");
const seedBlock = seed.slice(seedStart, seedEnd);
const seedQuestKeys = [...seedBlock.matchAll(/^\s+key:\s*"([^"]+)"/gm)].map((m) => m[1]);

const expQuestKeys = [...exp.matchAll(/^\s+key:\s*"([^"]+)"/gm)].map((m) => m[1]);

const tabs = { story: 0, daily: 0, exploration: 0 };
for (const m of exp.matchAll(/boardTab:\s*"(\w+)"/g)) tabs[m[1]]++;

const seedTabs = { story: 0, daily: 0, exploration: 0 };
for (const m of seedBlock.matchAll(/boardTab:\s*"(\w+)"/g)) seedTabs[m[1]]++;

const all = [...seedQuestKeys, ...expQuestKeys];
console.log({
  seed: seedQuestKeys.length,
  expansion: expQuestKeys.length,
  total: all.length,
  unique: new Set(all).size,
  seedTabs,
  expansionTabs: tabs,
  combinedTabs: {
    story: seedTabs.story + tabs.story,
    daily: seedTabs.daily + tabs.daily,
    exploration: seedTabs.exploration + tabs.exploration,
  },
});

if (expQuestKeys.length !== 100) throw new Error("Expected 100 expansion quests");
if (all.length !== new Set(all).size) throw new Error("Duplicate keys across catalog");
if (seedQuestKeys.length + expQuestKeys.length !== 120) {
  throw new Error(`Expected 120 total, got ${all.length}`);
}
console.log("OK");
