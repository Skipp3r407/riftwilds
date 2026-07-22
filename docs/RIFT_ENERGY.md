# RIFT_ENERGY.md

**Authority:** Rules v2.1.0 · `rift-energy.ts` · [RULEBOOK.md](./RULEBOOK.md)

## Growth table

| Turn | Max Energy |
|------|------------|
| 1 | 2 |
| 2 | 3 |
| … | +1 / turn |
| 9+ | 10 (cap) |

Each turn start: refill current Energy to that turn’s max (unspent base does not carry).

## Modifiers

- **Temp Energy** (Rift Spark, effects): stacks this turn; expires at END.
- **First companion discount**: −1 once per game when Commander present.
- **Cost reduction / temp modifiers**: applied in `resolvePlayCost` before affordability.

## Validation

`canAffordPlay` / `spendRiftEnergy` — playing without enough Energy throws `INSUFFICIENT_RIFT_ENERGY`. UI shows “Not enough Rift Energy.”

## Starting Energy audit (v2.1)

**Decision: keep turn1Max = 2.**

Raising to 3 would:

- Mindlessly accelerate early turns
- Inflate the value of every 0-cost and 1-cost
- Overlap Quick mode (already turn1Max 3)

Instead: opening-hand shaping, mulligan UI, 0-cost utilities (capped), deck curve warnings.
