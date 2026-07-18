# Quest ↔ Map Integration

**Date:** 2026-07-18

## Principle

The map **reads** `QUEST_CATALOG` + `quest-demo-store` progress. Quest definitions are never duplicated into map data.

## Bridge

`src/game/world-exploration/quest-map-bridge.ts`

- Resolves lore region keys (`sproutfall-grove` → `elderwood-forest`, `cindercrag-basin` → `ember-crater`) via `region-aliases.ts`
- Builds `MapMarker` rows with status: available / active / tracked / completed
- Active quests show live `current/target` objective subtitles
- Anchors prefer blueprint `quest` / board / waypoint / spawn

## Spoiler rules

| Status | Map behavior |
|--------|----------------|
| `locked` | Omitted |
| Secret keys (e.g. `community-boss-hit`) until active/completed | Omitted |
| `available` / `active` / `tracked` | Shown with coords |
| `completed` story/exploration | Light presence for region completion |

## Filters

Region map filter `quests` and legend toggle `quests` both gate quest markers. Search matches name, category, region, key.

## Sync

Overlay polls (~800ms) and rebuilds markers from demo store so tracker progress stays live without a separate quest copy.
