# Combat formulas

## Strike damage

```
raw = max(0, ATK - DEF)
scaled = round(raw * elementMod)   // strong 1.15 / weak 0.85 / else 1.0
damage = ATK > 0 ? max(1, scaled) : 0
```

## Ordering

Ready units sorted by **Speed descending**, then `instanceId` ascending.

## Targeting

- Guardian / Taunt / Guard must be struck first.
- Flying may strike the Keeper over non-Flying Guardians.

## Keywords (engine-backed)

Charge, Guardian(+aliases), Flying, Poison, Ward, Bloom, Heal, Shatter (partial).

See `docs/card-keywords.md` and `src/game/tcg/combat/keywords.ts`.
