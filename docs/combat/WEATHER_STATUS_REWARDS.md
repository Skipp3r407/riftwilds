# Weather, terrain, status, rewards

## Weather & terrain

Original Riftwilds field IDs (not third-party clones). Combined via `combineFieldMods` for affinity dealt, energy regen, speed, accuracy. Practice battles pick field from the player affinity’s biome arena.

## Status catalog

Burn/Singed, Soaked, Rooted, Charged, Fortified, Chilled, Illuminated, Shrouded, Armored, Inspired, Weakened, Slowed, Silenced, Regenerating, Analyzed, Guarding — see `status-catalog.ts`.

## Rewards

`rewards.ts` grants capped Credits, XP, Arena Points. Practice wins are small. Daily clamps exist for Credits/XP from battles. No SOL. Cosmetic/item drops stubbed for non-practice modes.

## Anti-cheat

- Server validation of action kinds / ability ownership / energy / Rift Burst  
- Idempotency keys on turn submit  
- Per-owner rate limit (40 turns/min)  
- Timeout default = Defend  
- Seed withheld from client until battle completes  
