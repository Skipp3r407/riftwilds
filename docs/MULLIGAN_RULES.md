# MULLIGAN_RULES.md

**Authority:** Rules v2.1.0 · [RULEBOOK.md](./RULEBOOK.md)

## Rule

Each player may mulligan **once** at match start.

| Option | Effect |
|--------|--------|
| Keep | Lock current hand |
| Partial | Return selected cards → shuffle → draw that many |
| Full | Return all → shuffle → redraw opening size |

- Rift Spark tokens are not returned on mulligan.
- AI auto-keeps.
- Soft opening-hand shaping runs **before** the mulligan decision.

## UI

Practice / Standard: `MulliganPanel` on `/tcg/battle` when `phase === MULLIGAN`.

Actions: `KEEP_HAND` · `MULLIGAN { replaceInstanceIds }`.
