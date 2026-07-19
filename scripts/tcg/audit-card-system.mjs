/**
 * Full card-system audit → docs/CARD_AUDIT_REPORT.md (+ balance/migration/visual stubs).
 *   node scripts/tcg/audit-card-system.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./content-sources.mjs";

const cards = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/content/tcg/data/cards.json"), "utf8"),
);
const migration = JSON.parse(
  fs.readFileSync(
    path.join(ROOT, "src/content/tcg/data/migrations/card-stats-v2.json"),
    "utf8",
  ),
);
const cardImages = JSON.parse(
  fs.readFileSync(path.join(ROOT, "src/content/tcg/data/cardImages.json"), "utf8"),
);

const UNIT = new Set(["creature", "companion", "legendary", "token", "hero"]);
const byType = {};
const missingArt = [];
const missingAtkHp = [];
const nameDupes = new Map();
const idDupes = new Set();
const seenIds = new Set();

for (const c of cards) {
  byType[c.type] = (byType[c.type] || 0) + 1;
  if (seenIds.has(c.id)) idDupes.add(c.id);
  seenIds.add(c.id);
  const nm = (c.localization?.name || "").toLowerCase();
  nameDupes.set(nm, (nameDupes.get(nm) || 0) + 1);
  if (!c.art?.assetPath && !c.art?.cardImagePath && !cardImages.cards?.[c.id]) {
    missingArt.push(c.id);
  }
  if (UNIT.has(c.type) && (c.attack == null || c.health == null)) {
    missingAtkHp.push(c.id);
  }
}

const dupeNames = [...nameDupes.entries()]
  .filter(([, n]) => n > 1)
  .map(([n]) => n)
  .slice(0, 40);

const overlayCount = Object.keys(migration.overlays || {}).length;
const units = cards.filter((c) => UNIT.has(c.type));
const unitsWithOverlay = units.filter((c) => migration.overlays[c.id]).length;
const leftovers = cards
  .filter((c) => !UNIT.has(c.type) && !migration.overlays[c.id])
  .map((c) => c.id);

const faceOnDisk = cards.filter((c) => {
  const p = path.join(ROOT, "public", "assets", "tcg", "cards", `${c.id}.webp`);
  return fs.existsSync(p);
}).length;

const audit = `# CARD_AUDIT_REPORT — Riftwilds TCG

Generated: ${new Date().toISOString()}  
Local-only audit (no deploy).

## Counts

| Metric | Value |
|--------|------:|
| Total cards | ${cards.length} |
| By type | ${Object.entries(byType).map(([k, v]) => `${k}:${v}`).join(", ")} |
| Unit-like (creature/companion/legendary/token/hero) | ${units.length} |
| Stat overlays (v2) | ${overlayCount} |
| Units with overlay | ${unitsWithOverlay}/${units.length} |
| Legacy baked faces on disk | ${faceOnDisk} |
| cardImages.json entries | ${Object.keys(cardImages.cards || {}).length} |

## Missing / risks

| Issue | Count | Notes |
|-------|------:|-------|
| Missing art path entirely | ${missingArt.length} | Prefer clean \`art.assetPath\` |
| Units missing raw ATK/HP in JSON | ${missingAtkHp.length} | Overlays + normalize fill gaps |
| Duplicate ids | ${idDupes.size} | ${[...idDupes].slice(0, 10).join(", ") || "none"} |
| Duplicate display names (sample) | ${dupeNames.length} | Teaching/twins may share titles |

### Sample missing art ids
${missingArt.slice(0, 25).map((id) => `- \`${id}\``).join("\n") || "- none"}

### Sample units missing raw ATK/HP
${missingAtkHp.slice(0, 25).map((id) => `- \`${id}\``).join("\n") || "- none"}

## Migration approach

- **Source JSON untouched** — \`cards.json\` preserved; backup under \`data/migrations/backups/\`.
- **Overlays** — \`card-stats-v2.json\` merges at normalize time (ATK/HP/DEF/Speed/role/keywords).
- **IDs / ownership / decks** — card ids unchanged; constructed lists remain valid.
- **Competitive vs collection** — finishes/founder cosmetics never alter engine defs.
- **Leftover non-combat types without overlay** (${leftovers.length}): equipment/relics/locations etc. still collectible; practice filter keeps unsupported stubs out of randomized practice.

### Leftover type sample (no combat overlay)
${leftovers.slice(0, 40).map((id) => `- \`${id}\``).join("\n")}

## Template migration

- Canonical presentation: **dynamic MasterCardTemplate** (stats from data).
- Clean art preferred (\`art.assetPath\` / \`cleanArtPath\`); baked WebP faces are legacy fallback only.
- Target asset layout: \`/assets/cards/{expansion}/{slug}/\` (art, thumb, optional foil-mask) — resolver scaffolded; full file moves can follow without id changes.

## Engine integration

- Board units carry ATK/DEF/HP/Speed/keywords/statuses/exhausted.
- Combat: speed order, ATK−DEF (+element ±15%), min damage, Guardian/Flying/Charge/Bloom/Poison/Ward/Heal.
- Surfaces updated: collection, pack open, inspect modal, battle field overlay, admin Card Studio.

## Known gaps

- Equipment attach / full Echo / Awaken transform still partial or stub.
- Full physical relocate of 735 assets into \`/assets/cards/...\` not completed (paths still resolve via existing thumbs + legacy faces).
- Visual QA screenshots not auto-captured in CI yet.
`;

const balance = `# CARD_BALANCE_REPORT

Generated: ${new Date().toISOString()}

## Framework

- Cost 1–10, ATK 0–15, HP 1–30, DEF 0–10, Speed 1–10
- Power budget soft bands in \`src/content/tcg/framework/power-budget.ts\`
- Element ±15% in \`src/game/tcg/combat/formulas.ts\`
- Overlay pass: ${overlayCount} cards (STATS-V2)

## Identity templates

| Card | Role intent |
|------|-------------|
| Bramblefox | Grove bruiser + Bloom |
| Mossprig | Grove tank + Bloom/Guardian |
| Ashwing | Ember flyer |
| Cinderquill / Emberfox | Charge assassins |

## Warnings policy

Deck atelier / admin studio surface soft warnings only — no silent stat rewrites.
`;

const migrationReport = `# CARD_MIGRATION_REPORT

Generated: ${new Date().toISOString()}

## What moved

| Layer | Action |
|-------|--------|
| \`cards.json\` | Untouched (backup created) |
| \`card-stats-v2.json\` | ${overlayCount} overlays authored |
| Engine \`TcgCardDef\` / \`TcgBoardUnit\` | Expanded for full combat stats |
| UI | Master template + field overlay |

## Preservation

- Card ids stable → collections, decks, codex, hatchery links intact.
- Cosmetic finishes remain power-neutral (\`variants.ts\`).

## Rollback

Restore \`cards.json\` from \`data/migrations/backups/\` and remove or empty \`overlays\` in \`card-stats-v2.json\`.
`;

const visual = `# CARD_VISUAL_QA_REPORT

Generated: ${new Date().toISOString()}

## Progressive disclosure

| Size | Shows |
|------|-------|
| thumb | Cost, name, ATK/DEF/HP condensed |
| hand | + type/element/role |
| field | Live ATK/DEF/HP/Speed + exhausted/status |
| collection | Rules summary + keywords |
| inspect | Full stats + ability text |

## Checks (manual / local)

- [ ] Collection binder renders DEF/Speed for units
- [ ] Battle field overlay updates after strikes
- [ ] Inspect modal role + speed present
- [ ] Card Studio preview on \`/tcg/admin\`
- [ ] Founder/foil finish does not change ATK vs competitive base
- [ ] Lazy-loaded art (\`loading="lazy"\`) on master template

## Performance notes

- Prefer clean art thumbs; avoid decoding large baked faces in hand rows when possible.
- Virtualization: collection flat list still capped (120); binder virtualization can follow.
`;

const regen = `# CARD_REGENERATION_PLAN

## Principle

**Do not bake changing combat stats into source art.** Compose frame/labels/stats in UI from gameplay data.

## Phases

1. ✅ Dynamic MasterCardTemplate + field overlay
2. ✅ Stat overlays for all combat units (+ combat spells)
3. ⏳ Publish clean plates to \`/assets/cards/{expansion}/{slug}/art.webp\`
4. ⏳ Deprecate reliance on baked \`/assets/tcg/cards/{id}.webp\` text
5. ⏳ Optional foil-mask / finish layers (cosmetic only)

## Commands

\`\`\`bash
node scripts/tcg/generate-card-stats-v2.mjs
node scripts/tcg/audit-card-system.mjs
npm run tcg:validate
npm run test:unit -- tests/unit/tcg-combat-stats.test.ts
\`\`\`
`;

fs.mkdirSync(path.join(ROOT, "docs"), { recursive: true });
fs.writeFileSync(path.join(ROOT, "docs/CARD_AUDIT_REPORT.md"), audit);
fs.writeFileSync(path.join(ROOT, "docs/CARD_BALANCE_REPORT.md"), balance);
fs.writeFileSync(path.join(ROOT, "docs/CARD_MIGRATION_REPORT.md"), migrationReport);
fs.writeFileSync(path.join(ROOT, "docs/CARD_VISUAL_QA_REPORT.md"), visual);
fs.writeFileSync(path.join(ROOT, "docs/CARD_REGENERATION_PLAN.md"), regen);
console.log("Wrote CARD_* reports under docs/");
