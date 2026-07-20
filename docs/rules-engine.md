# Rules Engine

## Modules

| Module | Role |
|--------|------|
| `rules/battle-rules-config.ts` | Canonical numbers + mode overrides |
| `rules/deck-composition.ts` | Creature/spell/support counts |
| `rules/deck-migration.ts` | Flag/trim illegal decks |
| `rules/rift-spark.ts` | P2 balance token |
| `match-engine.ts` | Deterministic match state machine |
| `rift-energy.ts` | Energy ramp helpers |
| `combat/*` | Formulas, keywords, statuses, equipment |

## Determinism

- Shuffle uses injectable / crypto RNG
- Combat order: speed DESC, instanceId ASC
- All mutations emit events on `state.events`

UI and APIs must read config — never hardcode HP, deck size, or energy caps.
