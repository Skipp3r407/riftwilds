# Riftling Equipment, Cosmetics & Loadouts

Phase-1 playable loop for clickable companions, owned gear, world layers, and appearance stubs.

## Player loop

1. Click / tap the active companion in Live World (or press E when near).
2. Context menu → **Equipment** (select highlight on pet).
3. Equipment panel: preview, slots, owned compatible list, filters, presets.
4. Equip / unequip / swap — server validates ownership + anatomy.
5. Layers render on the world pet via attachment anchors.
6. Shop purchase → inventory grant → **Equip Now** → Live World.

## Ownership (server-authoritative)

| Surface | Role |
|---------|------|
| `src/lib/equipment/inventory-store.ts` | Owned-item ledger (starter kit + shop grants) |
| `POST /api/inventory/grant` | Catalog-validated grant after purchase |
| `POST /api/pets/[id]/equipment/equip` | Equip / unequip with ownership + safety gates |
| `GET /api/pets/[id]/equipment` | Loadout, appearance, compatible owned list, presets |

**Never trust the client** for ownership. Unowned items and other players’ pets return `403` (`NOT_OWNED` / `PET_NOT_OWNED` / `OTHER_PLAYER`).

## Compatibility

`validateEquipCompatibility` checks catalog presence, equippable family, slot, anatomy tags (from species `bodyType`), and level. Failures return human-readable reasons in the panel.

## Persistence & revision

- Active loadout + named presets (`Default`, `Adventure`, `Arena`, `Homestead`, `Ceremony`) live in the Phase-1 in-memory store (same `globalThis` pattern as hatchery).
- Each mutation bumps `revision`; Live World bridge `petAppearance` / `appearanceRevision` refresh overlays.
- Prisma `PetLoadout` / `CreatureEquipment` / `InventoryItem` remain the Phase-2 durable target.

## World visuals

- `PetEquipmentLayerManager` attaches overlay sprites at `AttachmentPoint` anchors (`src/lib/equipment/anchors.ts`).
- Icons used as overlays today; optional `public/assets/items/{weapons,armor}/world/{id}.png` for dedicated layers.
- **Backlog:** per-species animation-frame anchors, admin aligner → DB rows, perfect idle/walk sync.

## Multiplayer (honest Phase-1 stub)

- `MultiplayerClient.sendAppearance` stashes a local appearance stub.
- `NearbyPlayerStub.petAppearance` is typed for future presence payloads.
- **Not done:** WebSocket broadcast, remote pet layer hydration, server-authoritative appearance validation across shards. Documented in `docs/LIVE_WORLD_PLAYABLE.md` Phase 2.

## Safety gates

- Combat / cutscene → equip locked (`SAFETY_BLOCKED`).
- Other players → inspect-only (`OTHER_PLAYER`).
- Ranked: cosmetics visible; paid gear power normalized (`RANKED_EQUIPMENT_NORMALIZATION_ENABLED`).

## Academy

Lesson `b17-loadout` steers Keepers into Live World Equipment + Arena Loadout practice.

## Economy honesty

- Credits / in-game SOL labels stay accurate; wallet SOL remains gated by flags.
- **SOL is never required for basic cosmetics.**

## Tests

- `tests/unit/equipment-loadout.test.ts` — equip, grant, anatomy, presets, safety
- `tests/security/equipment-ownership.test.ts` — cross-owner + unowned rejection
