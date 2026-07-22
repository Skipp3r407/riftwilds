# MANA_CURVE_ANALYSIS.md

**Rules version:** 2.1.0  
**Generated with:** card pool + `analyzeCurve` (`src/game/tcg/rules/mana-curve.ts`)

## Combat collectible histogram (post v2.1)

| Cost | Count |
|------|------:|
| 0 | 24 |
| 1 | 167 |
| 2 | 139 |
| 3 | 162 |
| 4 | 96 |
| 5 | 37 |
| 6 | 23 |
| 7+ | 11 |

- Combat collectibles ≈ **659**
- Zero-cost share ≈ **3.6%** of full combat catalog; ≈ **6.9%** of launch combat pool (in band)

## Before v2.1

Zero collectible combat 0-costs (catalog floored non-token costs to ≥1). Curve was 1-heavy with no free glue.

## Starting Energy

Turn 1 max **2** retained — see [RIFT_ENERGY.md](./RIFT_ENERGY.md) audit.
