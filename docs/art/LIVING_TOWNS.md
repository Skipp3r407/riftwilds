# Living Towns — Urban Design Manifesto (Riftwild Commons)

> Companion to [ART_DIRECTION.md](./ART_DIRECTION.md).  
> Runtime: `src/game/world-maps/blueprints/riftwild-commons.ts` · districts catalog `commons-districts.ts`.

## Mindset

Stop thinking of the world as a **tilemap with scattered objects on a flat field**.  
Start thinking like a **city builder** with **environmental storytelling**.

The biggest failure mode is **empty urban design**, not missing graphics.

## Rules (must)

1. **Every building belongs to a district / purpose** — market, home, forge, dock, temple, etc.
2. **Every empty space has purpose** — square, garden, well, alley, park, croft, pier, shrine.
3. **Buildings create roads** → intersections → plazas → hubs. Never scatter POIs on grass.
4. **Major settlements have walls and gates** that enclose space (visual + collision).
5. **Roads are curved / worn** (cobble, mud, bloom edges) — not only axis-aligned strips.
6. **Alleys get props** — crates, barrels, lanterns, signs. Dead lawn is a bug.
7. **Landmarks** mark district identity (fountain, riftstone, stage, shrine, pier).
8. **Verticality** — terraces, stairs, elevation faces on Archive Terrace / portals.
9. **Water features** with docks that *cover* shoreline (layering), not float beside it.
10. **NPC density** matches district mood (hub high, crofts low, military medium).
11. **Living buildings** — smoke/campfire, lantern pulse, window-warm props where art allows.
12. **2.5D layering** — roofs/trees/docks occlude; fade when the player walks behind.

## Commons districts (showcase)

| District | Role |
|----------|------|
| Central Rift Plaza | Civic hub — fountain, riftstone, stage, waystone |
| Market District | Rift Exchange, stall rows, trade square |
| Keeper Row | Homes, gardens, neighborhood well |
| Ember Craft Quarter | Forge, charcoal yard |
| Festival Lane | Golden Tankard, musicians, lanterns |
| Archive Terrace | Library + stairs (elevated) |
| Player Academy | Tutorials / FAQ building |
| Portal Sanctum | Portal ring, shrine, pilgrimage road |
| Southwatch Yard | Arena + training |
| Stonebay Dock | Pier, skiff, fishing |
| Commons Crofts | Public farm plots |
| Guild Quarter | Guild hall + muster |
| Recovery Gardens | Healing center |
| Hatchery Nest | Egg care |
| Lantern Grove Park | East park (not empty lawn) |
| East Forest Gate / Outer Woods | Gate + optional fringe danger |

## Occlusion & layering (why the mockup feels 3D)

| Technique | Commons implementation |
|-----------|------------------------|
| Buildings overlap | Nested footprints + taller facades (`world-props` scale) |
| Trees hide paths | Tree props in **canopy** depth band above actors |
| Docks cover shore | Bridge/dock sprites in street/canopy band over water |
| Walls enclose | Drawn wall segments + gate gaps + colliders |
| Roof fade | `updateOccluderFades` when player behind footprint |
| Contact shadows | Soft ellipses under buildings/props |
| Elevation | Terrace/portal height grid + cliff faces |

Depth bands live in `src/game/live-world/systems/premium/depth-layers.ts`.  
Full band table: [DEPTH_SYSTEM.md](../rendering/DEPTH_SYSTEM.md).  
Commons HUD + 2.5D overhaul audit: [RIFTWILDS_2_5D_OVERHAUL_AUDIT.md](./RIFTWILDS_2_5D_OVERHAUL_AUDIT.md).

## Performance

- Prop scatter is **deterministic** and budget-filterable (`full` / `medium` / `low`).
- Occluder fade is O(occluders) per frame — keep canopy count district-anchored, not unbounded.
- Atmosphere particles still respect immersive `particleBudget`.
- Other regions: district **stubs / roadmap only** until Commons is the quality bar.

## Other regions (honest backlog)

- Apply district catalog pattern to Moonwater, Ember Crater, Elderwood hubs.
- Hand-authored unique facades per secondary cottage (today: homestead alias reuse).
- Interior shells, balcony meshes, true pre-rendered 3D→2D multi-layer exports.
- Multiplayer nearby-player name list (UI currently uses hub activity stubs).
