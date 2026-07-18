# Collision Authoring Guidelines

## Prefer natural barriers

1. Cliffs, rivers/deep water, lava, dense forest blockers, collapsed bridges, checkpoint wards
2. Building footprints for structures
3. Edge `wall` colliders only as the outer frame (auto via `borderColliders`)

Do **not** plaster invisible walls across unfinished interiors when a cliff strip or forest thicket communicates the same limit.

## Water

- `deep_water` / `water` — solid until swim/boat ships
- `shallow_water` — walkable ford (optional visual slow later)
- Leave a shore band outside deep pools so fishing docks stay reachable

## Transition zones

- Auto-generated around each portal (`transition-*`) unless authored
- Must remain **non-solid**
- Never place edge walls over transition centers
- Locked portals get runtime `seal` solids on the approach side — not over the whole plaza

## Locked / quest blockers

Use `blocker` or runtime seals with `metadata.barrierStyle`:

- `collapsed_bridge` · `seal` · `checkpoint` · `forest` · `cliff` · `gate`

Copy must explain **why** the path is closed (story/repair/ward), never “You can’t go there.”

## Spawn safety

- Authored `spawn` must not sit inside solids
- Runtime `resolveSafeSpawn` pushes saved positions out of solids and into the playable inset
- Honor `entryPortalId` on arrival (stand south of the portal ring)

## Testing

- Unit: `tests/unit/world-boundaries.test.ts`
- Audit: `npm run validate:boundaries`
- Manual: `docs/testing/WORLD_COLLISION_QA.md`
