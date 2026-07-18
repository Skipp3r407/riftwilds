# Environment Guide — Riftwilds Commons & Beyond

Implementation: `premium-logic.ts`, `layered-terrain.ts`, `world-props.ts`, terrain under `public/assets/game/terrain/`.

## Commons as showcase

The Riftwild Commons must feel like a **living medieval hub** where rift energy is a resident guest, not a sci-fi overlay.

### Terrain language

| Kind | Look |
|------|------|
| Grass | Warm meadow greens, flower/fern variants, dry patches at wild edges |
| Path | Worn dirt → stone blend; bloom at plaza approaches |
| Plaza | Sandstone, medallion near Riftstone, moss in joints |
| Settlement soil | Packed earth near buildings |
| Water | Clear stream/pond with cyan caustics; readable stones beneath |
| Cliff / elevation | Soft face rectangles + drop shadows; height 0–3 |

### Vegetation density targets (Commons)

- Forest entrance / north edge: **heavy** tree + bush rings.
- Plaza ring: benches, lanterns, flowers — not solid forest.
- Market: stalls + crates + barrels (clutter > lawn).
- Pathways: intermittent flowers/rocks; occasional signposts.
- Avoid large empty grass rectangles between districts.

Prop scatter is deterministic (`commonsPropScatter`). Prefer adding rings/paths over random per-frame spawn.

### Buildings

- Soft-isometric **RGBA cutouts** (no scenic plate).
- Scale: ~1.08× blueprint width, **max height 1.35×** so NPCs stay readable.
- Materials: timber + stone + thatch/tile; cyan only on hatchery/portal accents.
- District identity via props and banners more than neon roof colors.

### Water

- Fishing pond / streams: `water-master` / `water-stream` tiles.
- Runtime: cool tint OK; optional soft shimmer via atmosphere (no heavy shaders).
- Deep water colliders remain gameplay — art must not hide shore edges.

### Clutter vocabulary

Priority props: lantern-post, barrel, crate, market-stall, tree-small, bush-berry, flowers, bench, banner-pole, campfire, signpost, watchtower, bridge, rift-crystal.

### Other regions (later)

Same bible, different biomes:

| Hub | Earth base | Accent |
|-----|------------|--------|
| Ember Forge | Ash brown, basalt | Ember orange |
| Moonwater | Cool teal sand | Tide blue |
| Elderwood | Deep green, roots | Amber fireflies |
| Void Hollow | Cool grey-violet (rare) | Cyan rifts |

Until premium packs ship, fallback terrain + stubs are acceptable — document in [ART_BACKLOG](./ART_BACKLOG.md).

## Streaming / LOD stubs

- Non-visible chunks may defer prop spawn (future).
- Particle density already scales with immersive performance settings.
- Do not block load on non-Commons premium art.
