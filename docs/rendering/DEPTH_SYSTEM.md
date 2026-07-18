# Live World Depth System (2.5D)

Runtime: `src/game/live-world/systems/premium/depth-layers.ts`  
Companions: [LIVING_TOWNS](../art/LIVING_TOWNS.md) · [ART_DIRECTION](../art/ART_DIRECTION.md)

## Hybrid layers

| Band | Depth | Contents |
|------|------:|----------|
| water | 0.1 | Ponds / shoreline |
| ground | 0.5 | Terrain tiles |
| groundDecal | 0.62 | Path bloom, grass speckles |
| elevFace | 0.55 | Cliff / terrace faces |
| pathPaint | 0.7 | Pathway strokes |
| groundShadow | 1.0 | Contact shadows |
| buildingFoundation | 1.35 | Plinths |
| wallBase | 1.5 | City walls |
| buildingWall | 4.2 | Side massing |
| lowProp | 3.0 | Barrels, flowers |
| building | 5.0 | Facades |
| buildingRoof | 5.4 | Soft roof caps (fade) |
| streetProp | 6.0 | Docks, street clutter |
| actor / canopy | 10.0 | Keepers, NPCs, trees (Y-sorted) |
| nameplate | 14.0 | Labels |
| uiWorld | 40.0 | Atmosphere overlay |

## Sorting rule

`depthAt(band, footY) = band + footY * 0.001 (+ bias)`

Actors and buildings use **ground anchor** (sprite origin `0.5, 1`). Southern feet paint above northern ones within the same band.

## Occlusion fade

`updateOccluderFades` softens building / roof / tree / dock alpha when the player stands behind the footprint. Roofs fade hardest (`~0.28`).

## Debug

Dev/admin only: Display & HUD → **Debug depth layers**. Never shown in production player UI.
