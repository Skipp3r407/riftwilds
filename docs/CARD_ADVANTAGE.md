# Card Advantage (Rules v2.2.0)

**Authority:** `src/game/tcg/rules/card-advantage.ts` · `src/game/tcg/match-engine.ts`  
**Official:** [RULEBOOK.md](./RULEBOOK.md)

## Design goals

1. Draw **one card at the start of each turn** (P1 skips turn-1 draw).
2. **Do not** auto-replace every played card with a new draw.
3. Reduce dead turns via **strategic** advantage — keywords, limited Commander Focus, relics, and optional conversions — not unlimited draw.

## Keywords

| Keyword | Effect |
|---------|--------|
| **Insight** | When this resolves, draw 1. |
| **Inspire** | Once/turn: when you summon another companion while an Inspire unit is already on board, draw 1. |
| **Scout** | Draw 1, then put a hand card on the bottom of your deck (filter). |
| **Discover** | Look at top 3; put one in hand, shuffle the rest. |

Practice / AI auto-picks: Scout bottoms highest cost; Discover takes lowest cost.

## Conversions (once each per turn)

| Action | Cost | Result |
|--------|------|--------|
| **Channel** (`ENERGY_TO_DRAW`) | 2 Energy | Draw 1 |
| **Bank** (`DISCARD_FOR_ENERGY`) | Discard 1 | +1 temp Energy next turn |
| **Recycle** (`RECYCLE`) | Shuffle 1 into deck | Draw 1 (net zero, filters) |

## Commander Focus

Once per turn: spend **1** Energy → draw 1 (`COMMANDER_DRAW`).

## Relics

**Keeper's Quill** (Insight): at end of turn, if Energy is 0 and you played a card, draw 1.

## Example cards

See `src/content/tcg/data/card-advantage-kit.json` — Plaza Herald, Pathfinder's Glance, Rift Reshuffle, Keeper's Quill; patches Storm Sip (Insight) and Pocket Scout (Scout).

## Simulation

```bash
npx tsx scripts/simulations/card-advantage-sim.ts
```

Output: `artifacts/reports/card-advantage-sim.json`

### 2k matches (Rules v2.2.0, turns 1–12, Channel/Focus when stuck)

| Metric | Value |
|--------|------:|
| Dead-turn frequency | **1.57%** |
| Avg playable cards / turn | **3.77** |
| Avg hand size (T1→T12) | 5.0 → ~4.3–4.9 |

| Archetype | Dead-turn rate | Starvation matches (≥3 dead) |
|-----------|---------------:|-----------------------------:|
| Aggro | 0.16% | 0% |
| Mid | 1.19% | 0% |
| Control | 3.52% | 0% |

Control holds larger hands but bricks more often on expensive curves — Deck Atelier high-curve / starvation warnings target that archetype.
