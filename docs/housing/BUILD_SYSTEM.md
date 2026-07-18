# Build System

## Placement

- **Grid snap** (32px) or **free place**
- Rotate 0/90/180/270; scale when SKU allows
- Collision AABB for `collides` furniture
- Undo / redo stack (40 ops)
- Copy / move / delete
- Multi-select stub (`selectedIds`)
- Blueprint mode flag on session (layout capture → blueprint service)

## Limits

Property tier `maxFurniture` / `buildLimit` / `decorLimit` enforced on place.

## Security

- Permission gate `build` / `decorate`
- No place into locked rooms
- Collision + revision bump for concurrency honesty

## UI

`/housing` build panel + `POST /api/housing` actions: `build_start`, `place`, `move`, `delete_furniture`, `copy`, `undo`, `redo`.

## A11y

Labeled inputs, focus-ring buttons, keyboard-driven actions (same API as touch). Controller assist reuses action IDs via Live World `openHousing` panel.
