# Live World Premium Redesign

Riftwild Commons is the showcase hub: a living settlement, not a debug tile map. Classic MMORPG / modern strategy games are **high-level inspirations only** — art, layout, and UI are original Riftwilds IP.

## Goals

1. Layered hand-painted terrain (grass variants, worn paths, plaza stone, water, elevation)
2. Pseudo-isometric presentation (closer camera, soft follow, Y-sorted actors, 3/4 building facades)
3. Settlements with districts, props, and ambient life
4. Dynamic lighting (day/night) + weather ambience
5. Preserve NPCs, dialogue, quests, portals, input, minimap

## Architecture (extend, don’t rewrite)

| Layer | Location |
|-------|----------|
| Shared scene | `src/game/live-world/scenes/BlueprintRegionScene.ts` |
| Commons entry | `src/game/live-world/scenes/CommonsScene.ts` |
| Premium systems | `src/game/live-world/systems/premium/` |
| Blueprint | `src/game/world-maps/blueprints/riftwild-commons.ts` |
| Art | `public/assets/game/{terrain,props,buildings}/` |
| Install script | `scripts/assets/install-premium-world-art.mjs` |

`isPremiumRegion("riftwild-commons")` gates the full pass. Other regions keep the lighter legacy paint until they inherit the same systems.

### Premium modules

- **`layered-terrain.ts`** — variant tiles from the commons tileset, elevation offsets, cliff faces, curved path strokes
- **`world-props.ts`** — district prop scatter, building facades, landmark decorations
- **`atmosphere.ts`** — day/night overlay, torch/forge/portal glows, rain/fog/wind, fireflies, cloud shadows
- **`iso-camera.ts`** — soft follow, default zoom ~1.28, mouse-wheel zoom, shake only via `shakeMajor()`

## Commons districts

| District | Role |
|----------|------|
| Central Rift Plaza | Hub square, fountain, riftstone, stage |
| Rift Exchange | Market stalls, crates, banners |
| Ember Forge | Workshop + forge glow / smoke props |
| Guild Hall | Banners, benches |
| Training Yard | Dirt ground, posts |
| Keeper Row | Residential / homestead |
| Hatchery | Magical egg pavilion |
| Rift Archive | Library |
| Recovery Center | Care district |
| Portal Plaza | Portal ring + cyan glows |
| Forest Gate / Feeding Grove | Tree line into the wilds |

## Camera & presentation

- Physics remain axis-aligned arcade (no diamond-tile rewrite)
- Presentation reads isometric via: painted 3/4 buildings, elevation, Y-depth sort, closer zoom
- Debug zone rectangles and giant map-title overlays are suppressed on premium Commons
- Collision debug still available via the existing keybind

## Art pipeline

```bash
node scripts/assets/install-premium-world-art.mjs
```

Slices `commons-tileset.png`, installs generated prop/building sheets, and writes compact terrain keys under `public/assets/game/`.

Boot loads keys via `terrainTex` / `propTex` / `buildingTex` in `BootScene`.

## Weather & lighting

- ~8 minute day cycle (presentation only)
- Weather windows: clear / rain / fog / wind (ash on harsh regions later)
- Gameplay impact: visibility tint only (no hard debuffs in this pass)

## Performance notes

- Tile images are 128px sources displayed at 32px world tiles
- Prop count is deterministic and capped by district rings
- Particle emitters toggle `emitting` rather than recreate
- Other regions skip premium draw until opted in

## Done criteria (Commons)

- [x] No flat colored debug squares as the primary look
- [x] Layered terrain + props + building facades
- [x] Soft premium camera + atmosphere
- [x] Existing NPC / portal / quest / input systems retained
- [x] Design documented here

## Next inheritances

Apply `isPremiumRegion` (or a lighter `drawPremiumTerrain` subset) to Ember / Coast / Elderwood with region-specific palettes and fewer props.
