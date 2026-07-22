# TURN_STRUCTURE.md

**Authority:** Rules v2.1.0 · `battle-rules-config.ts` · [RULEBOOK.md](./RULEBOOK.md)

## Sequence

`MULLIGAN → START → MAIN → COMBAT → SECOND_MAIN → END`

| Phase | What happens |
|-------|----------------|
| MULLIGAN | Keep / Partial / Full once; AI auto-keeps |
| START | Energy max↑, refill, ready units, draw (P1 skips T1) |
| MAIN | Play cards / abilities |
| COMBAT | Declare attackers; resolve |
| SECOND_MAIN | Fast/Reaction (skipped in Practice/Quick/Casual) |
| END | Temp Energy expires; pass |

### Example — turn sequence (P1 turn 1)

1. Mulligan resolves → MAIN.
2. Energy 2/2. Play Plaza Scout (0) + Emberfox (2) if in hand.
3. Combat: Scout/Emberfox exhausted unless keywords allow.
4. Second Main skipped in Practice → END → opponent turn.
