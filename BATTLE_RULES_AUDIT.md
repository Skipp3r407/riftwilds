# Battle Rules Audit — Riftwilds TCG v2

**Date:** 2026-07-20  
**Canonical config:** `src/game/tcg/rules/battle-rules-config.ts`  
**Engine:** `src/game/tcg/match-engine.ts`

## Summary

The prior Practice Board engine used Keeper 20 HP, opening hand 4, Energy starting at 1, a flat 5-unit board, MAIN→COMBAT→END phases, and 30-card main decks + separate Commander. Spec v2 redefines Standard as **25 HP**, **5-card open**, **Energy 2→10**, **29+Commander**, **Front/Back lanes**, full phase list, Rift Spark for P2, and composition limits.

## Gap matrix (pre → post)

| Area | Old (v1) | Spec / v2 | Status |
|------|----------|-----------|--------|
| Keeper HP | 20 | 25 | Implemented |
| Opening hand | 4 | 5 | Implemented |
| Mulligan | Soft practice only | Once, optional keep | Implemented (skipped in practice/quick) |
| P1 turn-1 draw | Already skipped | Skip | Implemented |
| P2 Rift Spark | None | 0-cost +1 temp energy, exile | Implemented |
| Energy T1 | 1 | 2 | Implemented |
| Energy cap | 10 | 10 | Unchanged |
| Hand max | 8 | 9 | Implemented |
| Main deck | 30 | 29 (+1 Commander) | Implemented |
| Copy limits | C/U 3, R 2, E/L 1 | C–E 2, L/M/A 1 | Implemented |
| Composition | Size + copies | Min 14 creatures, max 10 spells, max 6 support, max 3 power | Implemented |
| Field | Flat 5 | 3 Front + 2 Back + Terrain + Commander | Implemented |
| Frontline protect | Guardian only | Frontline + Guardian; Flying/Pierce/Siege bypass | Implemented |
| Phases | MAIN/COMBAT/END | Start→Main→Combat→Second Main→End | Implemented (practice auto-skips Second Main) |
| Keywords | Charge, Guardian, Flying… | + Rush, Swift, Vigilant, Pierce | Implemented (Swift/Vigilant partial) |
| Zones | discard | defeated / exile / rift burn | Implemented |
| Empty deck | Fatigue −1 | Rift Collapse escalating | Implemented |
| Spell speeds | None | Slow / Fast / Reaction | Scaffolded (Second Main gates Slow) |
| Reactions | None | Depth 4 / 8s | Config only (scaffold) |
| Modes | practice/casual/ranked/private | + Quick, Expanded, Legacy, Draft, Sealed, Commander, PvE, Arena | Config live; formats listed |
| Tutorials | None | 8 stages | Scaffold pages |
| Sims 100k | ~500 batch | Large batch + path to 100k | See BATTLE_SIMULATION_REPORT |

## Preserved systems

- Match store + `/api/tcg/match/*`
- Practice loadout variety + soft opening-hand help
- Affinity/element strike formula `max(1, scaled(atk−def))`
- Echo, Awaken, Bloom, Poison, Ward, Equipment attach
- Commander as non-shuffled hero identity
- Competitive normalized stats (no cosmetics in ranked power)

## Migration

- Oversized 30-card lists trim to 29 via `deck-migration.ts` (flagged, not deleted)
- Composition failures flagged in `DECK_MIGRATION_REPORT.md`
- Collections preserved

## Known gaps

- Interactive tutorial step validation (progress persistence) not wired to rewards ledger
- Full reaction window UI / nested priority not playable yet
- Commander active powers still Phase-2
- Element deck legality (1–2 elements) not enforced in validator yet
- Simultaneous lethal / alternate win card ops unfinished
