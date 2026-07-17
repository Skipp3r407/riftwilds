# Environment Style Guide

## Perspective

Original **three-quarter / top-down hybrid** 2D adventure maps. Not copied from any existing franchise world.

## Tile size (locked)

**64 × 64 pixels** for detailed Riftwilds maps (Phaser + Tiled).

Classic 32×32 is reserved only for optional low-power mode later — do not mix in production maps.

## Tileset categories

Ground · Grass · Dirt · Water · Cliffs · Trees · Bushes · Flowers · Rocks · Crystals · Bridges · Buildings · Portals · Paths · Signs · Camps · Ruins · Interactives · Collision · Foreground overlays · Animated props · Weather · Lighting  

## Map layers (Tiled / Phaser)

1. Ground  
2. GroundDetails  
3. Paths  
4. Water  
5. Buildings  
6. PropsBehind  
7. Collision  
8. Interactive  
9. SpawnZones  
10. NPCs  
11. Portals  
12. PropsFront  
13. Lighting  
14. Weather  

## Region — Sproutfall Grove

Bioluminescent forest · curled giant leaves · warm sunbeams · cyan mushrooms · mossy stone · streams · emerald/amber light · peaceful-mysterious · Grove & Spirit spawns  

Required: forest floor, grass, dirt, stream/pond, trees, bushes, flowers, mushrooms, mossy rocks, ruins, bridges, campsite, rift portal, signs, pickups, fireflies, fog, battle BG, region map art  

## Region — Cindercrag Basin

Volcanic canyon · black stone · orange magma · red crystals · ash · heat haze · ancient metal ruins · Ember & Alloy spawns  

Required: volcanic ground, cracked stone, lava, lava fall, obsidian cliffs, crystals, charred trees, metal ruins, bridges, steam vents, cave, portal, battle BG, region map art  

## Battle backgrounds

2048×1152 or 1920×1080 · no UI baked in · clear mid-ground stage · soft depth · region palette · creature readable in front  
