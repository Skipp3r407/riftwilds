# World System — Reborn Overview

**Status:** Living World = **future release** (systems preserved); TCG is launch combat  
**Canonical playable doc:** [LIVE_WORLD_PLAYABLE.md](../LIVE_WORLD_PLAYABLE.md)  
**Maps:** [WORLD_MAPS.md](../WORLD_MAPS.md) · [docs/world/](./)

## Role in Reborn

The overworld is **not deleted** and is **not** required for Phase 1 launch. Phaser Live World, bridges, and maps stay for MMO compatibility and remain enterable during development (`LIVE_WORLD_PUBLIC_ACCESS_ENABLED` default on; set `false` for an optional Coming Soon gate before a public release). When the Living World is the focus release, players walk towns, talk to NPCs, care for companions, visit homes, and discover content — encounters **transition into** the same TCG board, then **return** to the world.

## Reuse (do not fork)

- `BlueprintRegionScene` + region scenes  
- `LiveWorldBridge` (dialogue, travel, navigate, equipment)  
- World-maps blueprints / unlock tiers  
- World-travel + exploration + quest-map-bridge  
- Persistence categories A/B/C  
- Presence / world-events HUD  

## Encounter contract (Phase 1)

1. Player enters `enemy_spawn` zone (existing blueprint objects).  
2. If `TCG_WORLD_ENCOUNTERS_ENABLED`: scene offers challenge dialogue and requests navigate to `/tcg/battle?...&returnTo=/live-world`.  
3. Match resolves via TCG APIs.  
4. Client returns to Live World; position cache restores placement.  

Legacy instant “Training clash resolved” dialogue remains behind `LIVE_WORLD_LEGACY_INSTANT_COMBAT_ENABLED`.

## Future MMO

Multiplayer instances, housing interiors, and raids extend this spine. TCG matches become server-authoritative sessions addressable from any instance — universe compatibility, not a rewrite.
