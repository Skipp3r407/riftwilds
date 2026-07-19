# Card keywords

Registry: `src/content/tcg/data/keywords.json`  
Handlers: `src/game/tcg/combat/keywords.ts` (not hardcoded in card React components).

| Keyword | Support | Effect |
|---------|---------|--------|
| Charge | full | Enter ready |
| Guardian / Taunt / Guard | full | Must be attacked first |
| Flying | full | Bypass grounded Guardians for face |
| Poison | full | On strike → dawn damage |
| Ward | full | Block next hostile spell |
| Bloom | full | +1/+1 at turn start |
| Heal | full | Spell restores Keeper HP |
| Shatter | partial | Bonus vs Ward |
| Others (Echo, Awaken, …) | stub/partial | Documented; expanding |

Practice decks still filter unsupported equipment/heal-stub cards unless they resolve as units or damage/heal spells.
