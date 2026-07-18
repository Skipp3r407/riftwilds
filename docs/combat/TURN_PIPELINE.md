# Turn pipeline

Each round runs this server-side sequence:

1. **TURN_START** — round counter, clear prior defend/focus/guard flags  
2. **WEATHER** — emit weather tick (modifiers applied during resolve)  
3. **TERRAIN** — emit terrain tick  
4. **STATUS** — DOT/HOT ticks, then duration decrement / removals  
5. **ENERGY** — baseline regen + weather/terrain energy  
6. **CHOOSE** — client selection window (30s); timeout → auto-defend  
7. **LOCK** — both actions committed (`ACTIONS_LOCKED`)  
8. **ORDER** — priority → effective Speed → seeded coin flip  
9. **RESOLVE** — actions in order (accuracy, damage, statuses, faint checks)  
10. **PASSIVES** — soft support drips / morale recover  
11. **EOT** — max-round check, then return to CHOOSE  

Priority bands (high → low): Surrender/Retreat → Switch → Defend/Guard/Focus → Charge/Meditate/Analyze → Ability priority → Basic.

Events include `PHASE`, `TURN_ORDER`, `DAMAGE`, `MISS`, `STATUS_*`, `BATTLE_ENDED` for client FX and replay stubs.
