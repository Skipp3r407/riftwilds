# Game Asset Validation — Live World

## Required Commons files

### Actors
- [x] `public/assets/game/actors/player-keeper.png`
- [x] `public/assets/game/actors/pet-riftling.png`

### New props
- [x] `public/assets/game/props/riftstone-monument.png`
- [x] `public/assets/game/props/training-dummy.png`
- [x] `public/assets/game/props/resource-berry.png`
- [x] `public/assets/game/props/resource-herb.png`
- [x] `public/assets/game/props/resource-fish.png`

### Buildings / terrain
- [x] All keys in `TERRAIN_KEYS` / `PROP_KEYS` / `BUILDING_KEYS` under `public/assets/game/`

### Commons NPCs (24 slugs)
Each folder under `public/assets/npcs/riftwild-commons/<slug>/` should have:
- [x] `portrait.png` (>2KB)
- [x] `full-body.png` (>2KB)
- [x] `sprite.png` (>2KB)
- [x] `thumbnail.png` (>2KB)
- [x] `dialogue-portrait.png`
- [x] `overworld-sheet.png` (512×128)

### Minimap
- [x] `public/assets/ui/map/minimap-{portal,waypoint,player,quest}.png`

## Automated checks

```bash
node scripts/npcs/generate-npc-catalog.mjs   # artStatus from disk
npm run assets:validate                     # broader PNG validation when configured
npm run assets:npc-sheets                   # rebuild sheets from sprites
```

## Fail conditions

- PNG ≤ 70 bytes / 1×1 → treat as placeholder
- BootScene falls back to `drawCircleTexture` for player/pet → actors missing
- Resource spawn draws `fillCircle` → resource prop keys missing from loader
