# Combat Resolution

1. Attacker declared (ready, ATK > 0)
2. Target selected via `pickCombatTarget`
3. Reaction window scaffold (depth ≤ 4, 8s — config only for now)
4. Strike damage: `max(1, round((atk − def) × elementMod))`
5. On-hit keywords (Poison, etc.)
6. Deaths → Defeated zone
7. Victory check

## Targeting priority

1. Guardians (Flying may ignore grounded Guardians for face)
2. Frontline blockers (unless Flying / Pierce / Stealth / Siege)
3. Keeper (blocked for Rush on arrival)
