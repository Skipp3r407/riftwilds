# NPC Audit — Riftwilds

**Date:** 2026-07-17  
**Source:** `src/content/npcs/catalog.generated.ts` + `public/assets/npcs/**`

## Totals

| Metric | Count |
|--------|------:|
| Named NPCs | 54 |
| Ambient / guard / riftling NPCs | 58 |
| Total catalog entries | 112 |
| Named with generated portraits (≥5KB) | 54 |
| Named missing art | 0 |

## By region

| Region | Named | Ambient+ | Density OK |
|--------|------:|---------:|:----------:|
| riftwild-commons | 10 | 14 | Yes (10 named, 8+ ambient, guards + riftlings) |
| ember-crater | 4 | 4 | Yes |
| moonwater-coast | 4 | 4 | Yes |
| elderwood-forest | 4 | 4 | Yes |
| stormspire-peaks | 4 | 4 | Yes |
| stoneheart-canyon | 4 | 4 | Yes |
| frostveil-basin | 4 | 4 | Yes |
| radiant-citadel | 4 | 4 | Yes |
| void-hollow | 4 | 4 | Yes |
| alloy-ruins | 4 | 4 | Yes |
| spirit-marsh | 4 | 4 | Yes |
| celestial-rift | 4 | 4 | Yes |

## Dialogue / quests / shops

- All named NPCs have greeting dialogue nodes (no null / TODO / placeholder lines in defaults).
- Starter chain: 8 quests (`starter-q1-awakening` … `starter-q8-world-beyond`).
- Shop NPCs (soft demo credits): Mira, Bram, Tessa, Solen, Nyla, Pip, Rook (+ regional merchants).
- Services: hatch assist, heal, craft, codex, training spar.

## Art status

- **Generated:** all 54 named portraits via Grok `GenerateImage`, installed under `public/assets/npcs/{region}/{slug}/`.
- Full-body dedicated art: Elara, Rowan, Mira (+ portrait stand-ins for remaining named full-body/sprite until sprite sheets ship).
- Ambient NPCs: labeled development placeholders (SVG + tiny PNG stubs).

## Tests

- `tests/unit/npc-catalog.test.ts` — passed
- `tests/unit/npc-assets.test.ts` — passed
- E2E: `npc-population.spec.ts`, `npc-assets.spec.ts`, `new-player-playthrough.spec.ts` (RUN_E2E=1)

## Failing NPCs

None for named portrait coverage.
