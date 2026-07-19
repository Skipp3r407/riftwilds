# Card stats

| Stat | Range | Battle role |
|------|-------|-------------|
| Energy Cost | 1–10 | Play cost (Rift Energy) |
| ATK | 0–15 | Strike power |
| HP / MaxHP | 1–30 | Survival; 0 → death |
| DEF | 0–10 | Subtracted from ATK before min-damage |
| Speed | 1–10 | Combat order (desc; `instanceId` tie-break) |

Formulas: `docs/combat-formulas.md` · engine: `src/game/tcg/combat/formulas.ts`.

Roles: tank, bruiser, assassin, support, healer, controller, summoner, swarm, defender, energy_generator, disruptor, finisher, utility.
