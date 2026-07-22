import { writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";
import { createRequire } from "node:module";

// Run via: npx tsx scripts/tcg/write-migration-report.mjs
// (tsx resolves TS imports from the project)

const { TCG_CARDS } = await import("../../src/content/tcg/index.ts");
const {
  classifyCardSystem,
  isCombatEligibleCard,
} = await import("../../src/content/tcg/framework/combat-eligibility.ts");
const {
  listMigratedInventoryItems,
  migrationCountsByDomain,
} = await import("../../src/lib/items/card-inventory-migration.ts");

const migrated = listMigratedInventoryItems();
const byDomain = migrationCountsByDomain();
const combat = TCG_CARDS.filter((c) => isCombatEligibleCard(c.id, c.type));
const commanders = TCG_CARDS.filter((c) => {
  const cls = classifyCardSystem(c.id, c.type);
  return cls.system === "combat" && cls.kind === "commander";
});

const lines = [];
lines.push("# CARD_MIGRATION_REPORT");
lines.push("");
lines.push(
  "Safe reclassification — **no cards or artwork deleted**. Inventory/care goods stay in the catalog for lore/art but are illegal in combat decks.",
);
lines.push("");
lines.push(
  "Generated: 2026-07-22 (local). Battle potions/heals stay combat Utility; Companion Care meals/toys/housing/care-medicine → Inventory.",
);
lines.push("");
lines.push("## Summary counts");
lines.push("");
lines.push("| Bucket | Count |");
lines.push("|---|---:|");
lines.push(`| Total catalog cards | ${TCG_CARDS.length} |`);
lines.push(`| Combat-deck legal (main deck) | ${combat.length} |`);
lines.push(`| Commander (seat, not shuffled) | ${commanders.length} |`);
lines.push(`| Migrated to Inventory / Care | ${migrated.length} |`);
lines.push("");
lines.push("### Inventory by domain");
lines.push("");
lines.push("| Domain | Count |");
lines.push("|---|---:|");
for (const [k, v] of Object.entries(byDomain).sort((a, b) =>
  String(a[0]).localeCompare(String(b[0])),
)) {
  lines.push(`| ${k} | ${v} |`);
}
lines.push("");
lines.push("## Every migrated card");
lines.push("");
lines.push("| TCG card id | Name | Inventory id | Domain | Care hint |");
lines.push("|---|---|---|---|---|");
for (const row of migrated) {
  lines.push(
    `| \`${row.cardId}\` | ${row.name} | \`${row.inventoryItemId}\` | ${row.domain} | ${row.careActionHint ?? "—"} |`,
  );
}
lines.push("");
lines.push("## Deck auto-migration");
lines.push("");
lines.push(
  "On binder read (`getActiveDeckList`), non-combat ids are stripped from active + saved decks, granted into player inventory stacks via `grantFromTcgMigration`, and the combat list is padded to constructed size with unique combat cards.",
);
lines.push("");
lines.push(
  "Reject message: `This item belongs in your Inventory, not your Combat Deck.`",
);
lines.push("");
lines.push("## Stayed combat (Utility)");
lines.push("");
lines.push(
  "Battle heals, energy flasks, status cleanses, and Downed recovery items (e.g. Small Healing Salve, Spirit Crystal) remain combat Utility — not Companion Care medicine.",
);
lines.push("");
lines.push("Local only — no commit/push from this workstream.");

const out = new URL("../../docs/CARD_MIGRATION_REPORT.md", import.meta.url);
writeFileSync(out, lines.join("\n"), "utf8");
console.log("wrote", out.pathname, "rows", migrated.length);
