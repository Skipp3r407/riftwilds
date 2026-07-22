# Battle Rules — Riftwilds TCG

**Authority:** `src/game/tcg/rules/battle-rules-config.ts` · `src/game/tcg/match-engine.ts`  
**Version:** 2.1.0  
**Full rulebook:** [RULEBOOK.md](./RULEBOOK.md)

## Win

- Enemy Keeper reaches 0 HP (start **25**)
- Concede / disconnect beyond reconnect timer
- Alternate card win
- Fatal **Rift Collapse** from empty-deck draws (escalating)

## Resources

| System | Rule |
|--------|------|
| Opening hand | 5; soft-shaped ≥1 playable vs T1 Energy; mulligan once (Keep/Partial/Full) |
| Hand cap | 9 (overflow → Rift Burn) |
| Energy | Turn 1 max **2**, +1/turn to **10**; refill each turn start |
| Temp energy | Expires end of turn (Rift Spark) |
| 0-cost deck cap | Max **4** collectible zero-cost combat cards |
| P1 | No draw on turn 1 |
| P2 | Receives **Rift Spark** (+1 temp energy, exile) plus configurable turn-1 bonus Energy (default +2 temp) toward 49–51% FP win rate |

## Field

3 Frontline + 2 Backline + 1 Terrain + Commander (max 5 creatures).  
Frontline protects Keeper unless attacker has Flying, Pierce, Stealth, or Siege.

## Turn phases

`MULLIGAN → START → MAIN → COMBAT → SECOND_MAIN → END`

Practice / Quick / Casual auto-skip Second Main for pace. Practice **does** use mulligan (v2.1).

## Combat

Damage = `max(1, round((atk − def) × elementMod))` when atk > 0.  
Summoned units enter Exhausted unless Charge / Rush / Swift.

See also: [TURN_STRUCTURE.md](./TURN_STRUCTURE.md), [combat-resolution.md](./combat-resolution.md), [KEYWORDS.md](./KEYWORDS.md).
