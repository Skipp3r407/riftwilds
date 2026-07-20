# Card keywords

Registry: `src/content/tcg/data/keywords.json`  
Handlers: `src/game/tcg/combat/keywords.ts` (not hardcoded in card React components).

See canonical table in [keywords.md](./keywords.md). Registry: `src/game/tcg/combat/keywords.ts`.

| Keyword | Support | Effect |
|---------|---------|--------|
| Charge | full | Enter ready; may strike Keeper |
| Rush | full | Enter ready; cannot strike Keeper |
| Swift | partial | Ready if Energy remains after summon |
| Vigilant | partial | Does not Exhaust after strike |
| Guardian / Taunt / Guard | full | Must be attacked first |
| Flying | full | Bypass grounded Frontline/Guardians for face |
| Pierce / Reach | full | Bypass Frontline for Keeper |
| Poison | full | On strike → dawn damage |
| Ward | full | Block next hostile spell |
| Bloom | full | +1/+1 at turn start |
| Heal | full | Spell restores Keeper HP |
| Echo / Awaken | full | Replay / transform |
| Shatter | partial | Bonus vs Ward |

Practice decks still filter unsupported equipment bricks unless they resolve as units or damage/heal spells.
