# Keywords

**Registry:** `src/game/tcg/combat/keywords.ts` · content mirror `src/content/tcg/data/keywords.json`

| Keyword | Support | Summary |
|---------|---------|---------|
| Charge | full | Attack including Keeper on arrival |
| Rush | full | Attack creatures on arrival, not Keeper |
| Swift | partial | Ready if Energy remains after summon |
| Vigilant | partial | Does not Exhaust after strike |
| Guardian | full | Must be attacked first |
| Flying | full | Bypass grounded Frontline/Guardians for Keeper |
| Pierce / Reach | full | Bypass Frontline for Keeper |
| Ward | full | Blocks next hostile spell |
| Bloom | full | +1/+1 at turn start |
| Poison | full | Dawn damage stacks |
| Echo | full | Replay cheap spell once at +1 |
| Awaken | full | Transform next turn |
| Heal | full | Restore Keeper HP |
| Shatter / Empower / … | partial | Expanding |

Never hardcode keyword logic in React card faces — resolve via the registry.
