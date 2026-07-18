# World Map System

**Date:** 2026-07-18

## Overview

The Live World map (M key) is a React overlay over Phaser regions. It has two modes:

1. **World view** — continent tiles, Gateway fast travel (Credits only, never SOL), unlock teasers
2. **Region view** — fog, pan/zoom, dynamic markers, legend, search, custom pins, exploration sidebar

This document covers the map shell. Quest/discovery specifics live in sibling docs.

## Key paths

| Area | Path |
|------|------|
| Overlay UI | `src/components/live-world/world-map-overlay.tsx` |
| Minimap | `src/components/live-world/minimap.tsx` |
| UI state | `src/game/live-world/types.ts` (`WorldMapUiState`) |
| Fog | `src/game/live-world/systems/exploration-fog.ts` |
| Exploration layer | `src/game/world-exploration/` |
| Blueprints | `src/game/world-maps/` |
| Travel / Gateways | `src/game/world-travel/` |

## Controls

- **M** — toggle map
- **Esc** — close
- Region filters, search, legend toggles, Drop pin, exploration log
- Click Gateway → World view fast-travel preview
- Click waypoint / quest / POI → walking guidance (pathway preference + A*)

## Fast travel rules

- Only unlocked, discovered Gateway destinations
- Fees in **Credits** (free on early hubs)
- Never SOL for basic travel

## Performance

- Marker query capped (`limit`, default 180)
- Clusters when pin count ≥ threshold (~56)
- Minimap nearby query limited to ~24 pins within radius
- Fog cells capped on minimap render

## Icons

Original Grok / GenerateImage assets under `public/assets/ui/map/`:

- quests, treasures, bosses, enemy territories, POIs, habitats, events, custom pins, perks
- minimap variants for quest / treasure / enemy / event / portal / waypoint / player

## Honest backlog (Phaser)

- Treasure chests / boss arenas are blueprint data + map UI; full 3D/Phaser loot pickup UX is partial
- World event markers read Living World disasters; in-scene VFX may be stubbed per region
- Clustering is UI-side only (not Phaser camera LOD)
