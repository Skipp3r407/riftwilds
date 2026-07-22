# TURN_STRUCTURE.md

**Authority:** Rules v2.2.0 · `battle-rules-config.ts` · [RULEBOOK.md](./RULEBOOK.md) · [CARD_ADVANTAGE.md](./CARD_ADVANTAGE.md)

## Sequence

`MULLIGAN → START → MAIN → COMBAT → SECOND_MAIN → END`

| Phase | What happens |
|-------|----------------|
| MULLIGAN | Keep / Partial / Full once; AI auto-keeps |
| START | Energy max↑, refill, ready units, draw **one** (P1 skips T1); banked Energy |
| MAIN | Play cards / abilities / Commander Focus / conversions |
| COMBAT | Declare attackers; resolve |
| SECOND_MAIN | Fast/Reaction (skipped in Practice/Quick/Casual) |
| END | Relic thrift draws; temp Energy expires; pass |

Playing a card does **not** auto-draw a replacement.

### Example — turn sequence (P1 turn 1)

1. Mulligan resolves → MAIN.
2. Energy 2/2. Play Plaza Scout (0) + Emberfox (2) if in hand.
3. Combat: Scout/Emberfox exhausted unless keywords allow.
4. Second Main skipped in Practice → END → opponent turn.
