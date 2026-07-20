/**
 * Audit content + teaching decks against rules v2. Writes DECK_MIGRATION_REPORT.md
 */

import fs from "node:fs";
import path from "node:path";
import {
  getHeroById,
  TCG_DECKS,
  TCG_FACTIONS,
  TCG_STARTER_SET_20,
} from "@/content/tcg";
import { expandContentDeck } from "@/game/tcg/deck";
import { auditDeckMigration } from "@/game/tcg/rules/deck-migration";

const FALLBACK_COMMANDER = "hero-elara-venn";

/** Commanders live on factions (defaultStarterDeckId), not on TcgDeck. */
function commanderForDeck(deckId: string, fallback = FALLBACK_COMMANDER): string {
  const faction = TCG_FACTIONS.find((f) => f.defaultStarterDeckId === deckId);
  const heroId = faction?.commanderHeroIds[0] ?? fallback;
  return getHeroById(heroId) ? heroId : fallback;
}

const rows = [];

for (const deck of TCG_DECKS) {
  const ids = expandContentDeck(deck);
  rows.push(
    auditDeckMigration({
      deckId: deck.id,
      cardIds: ids,
      commanderHeroId: commanderForDeck(deck.id),
    }),
  );
}

rows.push(
  auditDeckMigration({
    deckId: TCG_STARTER_SET_20.id,
    cardIds: TCG_STARTER_SET_20.cardIds,
    commanderHeroId:
      TCG_STARTER_SET_20.recommendedCommanderId || FALLBACK_COMMANDER,
  }),
);

const illegal = rows.filter((r) => !r.legal);
const lines = [
  `# Deck Migration Report`,
  ``,
  `**Rules:** v2 — 29 main + Commander, composition limits, copy caps.`,
  `**Collections:** preserved; illegal lists flagged (not deleted).`,
  ``,
  `| Deck | Original | Migrated | Legal | Flags |`,
  `|------|----------|----------|-------|-------|`,
  ...rows.map(
    (r) =>
      `| ${r.deckId} | ${r.originalSize} | ${r.migratedCardIds.length} | ${r.legal ? "yes" : "no"} | ${r.flags.map((f) => f.code).join(", ") || "—"} |`,
  ),
  ``,
  `## Summary`,
  ``,
  `- Audited: ${rows.length}`,
  `- Illegal / needs edit: ${illegal.length}`,
  `- Auto-trim applied when size > 29 (\`TRIMMED_TO_29\`)`,
  ``,
  `## Next steps`,
  ``,
  `1. Deck builder surfaces flags from \`auditDeckMigration\``,
  `2. Practice Board continues to use legal slices via \`toConstructedSlice\``,
  `3. Ranked queue rejects illegal lists`,
  ``,
];

const out = path.join(process.cwd(), "DECK_MIGRATION_REPORT.md");
fs.writeFileSync(out, lines.join("\n"));
console.log(`Wrote ${out} (${illegal.length}/${rows.length} illegal)`);
