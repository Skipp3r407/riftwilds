# Exploration System

**Date:** 2026-07-18

## Progress store

`riftwilds-exploration-progress-v1` (localStorage) via `src/game/world-exploration/progress.ts`

Tracks:

- `discoveredIds` — secrets/POIs/habitats/bosses revealed
- `claimedTreasureIds`
- `earnedPerkIds` — perks stay unnamed until earned
- `defeatedBossIds`
- `customWaypoints`
- `legendToggles`
- `log` — exploration log (capped)

Fog remains in `riftwilds-exploration-fog-v1` (visited cells, waypoints, landmarks).

## Proximity discovery

`tryDiscoverNearby(regionSlug, x, y)` runs from `BlueprintRegionScene` fog tick. Walking into a discoverable radius reveals it (SFX via waypoint cue).

## Region completion

`getRegionCompletion(slug)` weights fog, treasures, POIs, habitats, bosses, quests, landmarks → `percentComplete`. Shown on region map sidebar and world tiles.

## Perks

Defined in `EXPLORATION_PERKS`. UI never shows unearned perk names — only after `earnedPerkIds` includes them (discovery or milestones like 3 treasures).

## Exploration log

Sidebar **Log** lists recent discovery / pin / perk events without spoiling undiscoved content.
