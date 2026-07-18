# Actions & loadout

## Action kinds

Attack · Ability · Ultimate · Defend · Guard · Switch · Item · Charge · Meditate · Analyze · Retreat · Surrender  
(Also accepted: `BASIC_ATTACK`, `FOCUS` for back-compat.)

| Action | Notes |
|--------|-------|
| Attack / Basic | Free Rift Strike |
| Ability | Energy cost; 4 actives typical |
| Ultimate | Spends Rift Burst meter (100) |
| Defend | +35% defense this resolve |
| Guard | Stronger brace + GUARDING status |
| Focus | +energy, +accuracy next, Rift Burst gain |
| Charge | Heavy Rift Burst gain |
| Meditate | Larger energy + morale |
| Analyze | Applies ANALYZED to foe |
| Switch | Scaffold (1v1 no bench) |
| Item | Stub event |
| Retreat / Surrender | Ends battle; foe wins |

## Loadout slots

4 active · 2 passives · 1 ultimate · 1 signature (`loadout.ts`), aligned with species kits. Missing ultimates receive a generated **Rift Burst** finisher.
