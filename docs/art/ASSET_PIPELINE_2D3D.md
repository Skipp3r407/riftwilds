# 2D / 3D Hybrid Asset Pipeline (Living Towns)

> Aligns with [ART_DIRECTION.md](./ART_DIRECTION.md) · [LIVING_TOWNS.md](./LIVING_TOWNS.md).  
> Original Riftwilds IP only — never copy franchise layouts or assets.

## Goal

Make **painterly 2D sprites read as 3D space** through layering, not photoreal meshes in the browser.

## Recommended pipeline (target)

```
Blockout (city plan) → Greybox districts in Blender/Godot
  → Light & camera (soft iso / 3/4)
  → Render layered passes (diffuse cutout, AO, soft shadow)
  → Composite to transparent PNG sheets
  → Import under public/assets/game/{buildings,props,terrain}
  → Bind via asset-keys.ts + blueprint placement
```

### Layer passes (per landmark / building)

| Pass | Use in Phaser |
|------|----------------|
| Ground plaque / foundation | Depth `ground` / `elevFace` |
| Facade cutout | Depth `building`, occluder + roof fade |
| Overhang / balcony / eave | Depth `canopy` (can hide player) |
| Roof / chimney smoke plate | Canopy or FX tween |
| Contact shadow (baked or runtime ellipse) | Depth `groundShadow` |

### Practical rules

1. **Cutout facades** — transparent background; readable door at game scale (~40–54px actors).
2. **Footprint south edge** drives Y-sort depth (`depthAt(band, footY)`).
3. **Never** ship opaque scenic rectangles behind buildings.
4. **Prompt / generate** with `RIFTWILDS_STYLE_SUFFIX` (warm earth, cyan/amber accents — not purple glow soup).
5. **Reuse aliases** for district density (cottage → homestead texture) until unique art ships.

## Current Commons status

| Asset class | Status |
|-------------|--------|
| Premium terrain tiles | Present |
| Named building keys (10) | Present; secondary cottages alias homestead/market |
| Prop kit | Present; district scatter densified |
| Wall visuals | Procedural stone blocks from collider segments |
| Roof / canopy fade | Runtime occluder system |
| Full multi-layer 3D renders | Backlog |
| Unique tavern / annex art | Backlog (aliases OK for showcase) |

## Runtime code map

| Concern | Path |
|---------|------|
| Depth bands + occluders | `src/game/live-world/systems/premium/depth-layers.ts` |
| Props / buildings / walls | `src/game/live-world/systems/premium/world-props.ts` |
| Terrain + elevation | `layered-terrain.ts` + `premium-logic.ts` |
| Texture keys | `asset-keys.ts` |
| Blueprint districts | `src/game/world-maps/blueprints/riftwild-commons.ts` |

## Performance notes

- Prefer **variety within a fixed budget** over unbounded particle/prop counts.
- `filterScatterForBudget` drops non-landmark props on medium/low.
- Cull distant props when immersive `performanceCull` is on (existing helper).
- Do not add real-time 3D meshes to the Live World canvas for v1.

## Game library (bulk catalog)

Bulk original-IP sprites (≥1000) live under `public/assets/game/library/` with catalog at `src/content/assets/game-library.*`. See [GAME_ASSET_LIBRARY.md](./GAME_ASSET_LIBRARY.md). BootScene only loads a small `lib-*` subset after `npm run assets:install:library`.

## Backlog

- Export balcony / eave plates as separate canopy sprites for Market + Tavern.
- Bake AO under major plazas into terrain variants.
- Tooling: blueprint → Blender blockout JSON exporter.
- Night window emissive plates tied to day phase.
- Optional xAI/Grok hero-pass over high-visibility library families (paid upgrade only; procedural library is the default and ships without any key).
