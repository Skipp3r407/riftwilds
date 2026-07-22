# OPENING_HAND_SYSTEM.md

**Authority:** Rules v2.1.0 · `src/game/tcg/rules/opening-hand.ts`

## Goal

Opening hands are **almost never dead**: ≥1 card playable vs starting Energy (2).

## Algorithm

1. Deal top N (5).
2. If any card has `riftCost ≤ turn1Max` (and is playable def), done.
3. Else swap priciest hand card with cheapest qualifying card from the remainder.
4. Soft fallback: allow cost ≤ turn1Max+1 if no exact match deeper in deck.

Practice teaching path uses `practiceUsefulOnly` (units + solo-playable spells).

## Sim stats

Run: `npx tsx scripts/simulations/opening-hand-sim.ts`  
Output: `artifacts/reports/opening-hand-sim.json`

### 10k deals (Rules v2.1.0, turn1 Energy = 2, opening = 5)

| | Dead hand % | T1 playable % |
|--|------------:|---------------:|
| Raw shuffle | 2.02% | 97.98% |
| After soft-shape | **0.00%** | **100%** |
