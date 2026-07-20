# Battle Balance Report

**Rules version:** 2.0.0  
**Sample size:** 3000 simulated practice matches

## Observations

- Keeper start HP 25, Energy 2→10, hand 5/9
- Main deck 29 + Commander
- First-player win rate in this batch: **51.5%**
- Average turns: **12.19** (soft length proxy; wall-clock depends on UI)

## Alerts

- Avg turns within a playable band for AI vs AI heuristics.
- First-player rate inside soft 45–55% band for this AI.
- No engine errors in batch.

## Tuning applied

- `secondPlayerTurn1BonusEnergy: 2` (plus Rift Spark +1) brought FP win rate from ~65% → **51.5%** on 3k greedy-AI matches.

## Next balance levers

1. Rift Spark energy grant vs P2 turn-1 bonus  
2. Frontline density vs Flying/Pierce density  
3. Composition mins (creatures vs spells)  
4. Quick Battle 20 HP curve  
5. Equal-skill mirror bots for cleaner FP measurement  

