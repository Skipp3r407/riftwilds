# Region Transitions

How Keepers move between Live World regions without void gaps or soft locks.

## Modes

| Mode | Trigger | Guard |
|------|---------|-------|
| Portal interact (E) | Portal interactable | `isPortalLocked`, combat, feature flags |
| Walk-in transition | Overlap `kind: "transition"` | Same locks; contextual seal dialogue if locked |
| Gateway fast travel | World map (M) | Activated Gateway + Credits + unlocks |

## Unlocked path

1. Portal / transition resolves `toRegionId`
2. `travelTo` runs SFX + `runTravelTransition`
3. Destination scene starts with `entryPortalId`
4. `resolveSafeSpawn` places the Keeper south of the arrival portal (clamped)

## Locked path

1. Runtime `seal` collider blocks the approach (amber debug / soft prop fill)
2. Interact or walk-in shows `lockedBlockerMessage` (bridge / seal / gate / forest / cliff / checkpoint)
3. Unmet unlock hints appended from `getRegionUnlockView`
4. No generic “You can’t go there.”

## Coordination

- Unlock evaluation: `src/game/world-travel/unlocks.ts`
- Portal catalog: `src/game/world-maps/defs/portals.ts`
- Gateway stones: `src/game/world-travel/gateways.ts`
- Pathway `locked` flags skipped by `pathAlongPathways` (map guidance)

## Authoring tips

- Keep portal rings **inside** the map (not under edge walls)
- Prefer roads / passes / bridges toward exits; edge walls stay continuous
- Factory hazards already encode cliffs/water so stubs feel bordered before art lands
