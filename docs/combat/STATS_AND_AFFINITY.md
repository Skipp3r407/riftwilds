# Stats, affinity, bond

## Combat stats

HP, Energy, Atk, Def, Magic, Res, Speed, Focus, Luck, Bond, Morale, XP, Level, Affinity.

- Physical hits use Atk vs Def  
- Affinity / Ultimate hits use Magic vs Resistance  
- Speed (+ status/weather/morale) breaks turn ties after action priority  
- Luck nudges accuracy and crit chance modestly  

## Affinity chart

Versioned in `affinity-matrix.ts` (`ARENA_AFFINITY_VERSION`). Modest bands: 1.15 / 1.25 advantage, 0.85 / 0.75 resist. Historical battles store `affinityVersion`.

## Bond (PvP-safe)

`bond.ts` caps Bond contribution (≤ +4% damage, +3 accuracy, +2% crit). Ranked/`careNormalized` battles flatten Bond to a constant so care farming cannot dominate ladders.

## Combo affinity (scaffold)

Same-affinity hit chains add up to +6% at 3 stacks (`combo-affinity.ts`). Team synergy scoring stubbed for 2v2/3v3.
