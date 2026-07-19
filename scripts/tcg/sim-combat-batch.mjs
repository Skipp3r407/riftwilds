/**
 * Headless combat simulation batch (Node, no Vitest).
 * Uses compiled TS via tsx if available; otherwise documents skip.
 *
 * Prefer: npx vitest run tests/unit/tcg-combat-sim.test.ts
 *
 *   node scripts/tcg/sim-combat-batch.mjs
 */
console.log(
  "Run: npx vitest run tests/unit/tcg-combat-sim.test.ts — writes docs/QA_CARD_SYSTEM_REPORT.md",
);
