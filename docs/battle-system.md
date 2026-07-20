# Battle System — Riftwilds TCG

> Runtime authority: `src/game/tcg/match-engine.ts`, `src/game/tcg/rules/battle-rules-config.ts`, `src/game/tcg/rift-energy.ts`.  
> UI: `src/components/tcg/rift-battle-board.tsx` (`/tcg/battle`).  
> Full rules: [battle-rules.md](./battle-rules.md). Audit: `/BATTLE_RULES_AUDIT.md`.

---

## 1. Goals

- Fast, readable practice duels (8–12 minutes casual).
- Preserve the **battle console / Practice Board** command-desk UX.
- Config-driven Standard rules: Rift Energy, Front/Back field, Keeper Core HP.
- Scaffold reactions, Commander powers, and mode overrides without discarding the playable demo.

---

## 2. Match state

`TcgMatchState`:

- Phases: `MULLIGAN | START | MAIN | COMBAT | SECOND_MAIN | END | REACTION | FINISHED`
- Per side: Keeper HP, Energy (+ temp), deck/hand/board, defeated/exile/riftBurn, terrain, Commander
- `rulesVersion`, mode, soft turn timer

---

## 3. Resources & tempo

| System | Behavior |
|--------|----------|
| Rift Energy | Turn 1 max 2; +1/turn to 10; refill at turn start |
| Draw | 1 at turn start; P1 skips turn 1; hand full → Rift Burn; empty → Rift Collapse |
| Opening hand | 5 |
| Max hand | 9 |
| Board | 3 Front + 2 Back; max 5; enter exhausted |
| Turn timer | Soft client cue (mode-dependent) |

---

## 4. Combat

Unit HP, strike targeting (Frontline + Guardian), keywords (Charge/Rush/Flying/Pierce/…).  
Formula: `max(1, round((atk − def) × element))`.

---

## 5. Actions

`PLAY_CARD` · `DECLARE_COMBAT` · `END_TURN` · `MULLIGAN` · `KEEP_HAND` · `SURRENDER`

---

## 6. Win / lose

Keeper ≤ 0 · Concede · Turn cap (higher HP) · Fatal Rift Collapse
