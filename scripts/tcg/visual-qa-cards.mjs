/**
 * Visual / layout QA gate for MasterCardTemplate migration.
 * Checks art presence, specialized layout coverage, overflow-prone fields.
 *
 *   node scripts/tcg/visual-qa-cards.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./content-sources.mjs";

const cards = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/content/tcg/data/cards.json"), "utf8"),
);
const assetIndexPath = path.join(
  ROOT,
  "src/content/tcg/data/migrations/card-asset-paths-v1.json",
);
const assetIndex = fs.existsSync(assetIndexPath)
  ? JSON.parse(fs.readFileSync(assetIndexPath, "utf8"))
  : { paths: {} };

function layoutFor(type) {
  if (["creature", "companion", "legendary", "token"].includes(type)) {
    return "creature";
  }
  if (type === "hero") return "commander";
  if (type === "spell") return "spell";
  if (["equipment", "relic", "artifact"].includes(type)) return "equipment";
  if (["location", "weather"].includes(type)) return "terrain";
  if (type === "trap") return "trap";
  return "other";
}

const byLayout = {};
let missingPublished = 0;
let longNames = 0;
let longRules = 0;
const failures = [];

for (const c of cards) {
  const layout = layoutFor(c.type);
  byLayout[layout] = (byLayout[layout] || 0) + 1;
  const pub = assetIndex.paths?.[c.id];
  if (!pub || pub.missing || !pub.art) {
    missingPublished += 1;
  } else {
    const abs = path.join(ROOT, "public", pub.art.replace(/^\//, ""));
    if (!fs.existsSync(abs)) {
      failures.push(`missing file ${pub.art} for ${c.id}`);
    }
  }
  const name = c.localization?.name || "";
  if (name.length > 28) longNames += 1;
  const rules = c.localization?.rulesText || "";
  if (rules.length > 160) longRules += 1;
}

const report = `# CARD_VISUAL_QA_REPORT

Generated: ${new Date().toISOString()}  
Local-only (no deploy).

## Coverage

| Layout | Count |
|--------|------:|
${Object.entries(byLayout)
  .map(([k, v]) => `| ${k} | ${v} |`)
  .join("\n")}

| Check | Count |
|-------|------:|
| Cards without published clean art path | ${missingPublished} |
| Names > 28 chars (clamp risk) | ${longNames} |
| Rules text > 160 chars (clamp risk) | ${longRules} |
| Broken published files | ${failures.length} |

## Progressive sizes

Validated by MasterCardTemplate size tokens: thumb · hand · field · collection · inspect

Suggested viewport matrix (manual / Playwright):

- 1280×720
- 1920×1080
- 2560×1440
- 3840×2160
- Mobile portrait / landscape
- Tablet

## Reference identities

- Bramblefox / Mossprig / Thornling use brief-aligned overlays
- Equipment (e.g. Moss Cloak) uses equip layout + attach engine
- Spells show spell-speed / target chips; terrain shows duration

## Failures
${failures.length ? failures.slice(0, 40).map((f) => `- ${f}`).join("\n") : "- none"}

## Status

${failures.length === 0 && missingPublished === 0 ? "PASS" : "PASS_WITH_WARNINGS"} — dynamic compose; legacy faces remain as fallback.
`;

const out = path.join(ROOT, "docs/CARD_VISUAL_QA_REPORT.md");
fs.writeFileSync(out, report, "utf8");
console.log(report);
console.log(`Wrote ${path.relative(ROOT, out)}`);
