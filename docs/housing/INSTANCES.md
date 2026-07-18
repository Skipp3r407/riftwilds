# Private Home Instances

## Identity

- `homeId` + `ownerUserId` (one primary home per owner in Phase 1)
- `HomeInstance.instanceKey` for runtime shard routing later
- Entry kinds: door / portal / gate (`entry-stubs.ts`)

## Persisted state (logical)

Furniture, walls, floors, lighting, storage, décor, music, NPCs, Riftlings, visitors, plants, crafting stations, secret rooms, events.

## Acquisition

1. **Buy prebuilt** — Credits purchase of property tier shell
2. **Claim land & build** — empty/unlocked-minimal shell; decorate yourself
3. **Neighborhood deed** — plot claim bundles modest interior fee (no double land tax)

## Visitor flow

`enterHomeInstance` → permission check → private instance handle. Social likes/guestbook via `visitHomeSocial` + existing home-visits service.
