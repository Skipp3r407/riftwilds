# CARD_MIGRATION_REPORT

Generated: 2026-07-19T16:52:00.000Z

## What moved

| Layer | Action |
|-------|--------|
| `cards.json` | Untouched (backup created on each stats regen) |
| `card-stats-v2.json` | **697** overlays (units + spells + equipment + terrain/trap) |
| `card-asset-paths-v1.json` | **735/735** published clean-art paths |
| `/public/assets/cards/{exp}/{slug}/` | art.webp + thumb.webp per card (copied, not regenerated AI) |
| Engine `TcgBoardUnit` / side | equipmentIds, summonedOnTurn, echoReady |
| UI | `RiftCardFrame` → `MasterCardTemplate` adapter; specialized layouts |

## Preservation

- Card ids stable → collections, decks, Codex, hatchery links intact.
- Cosmetic finishes remain power-neutral (`variants.ts`).
- Legacy `/assets/tcg/cards/{id}.webp` faces retained as fallback.

## Engine gaps closed this pass

- Equipment attach (ATK/DEF mods + keyword grants)
- Echo (arm + cheap-spell replay at +1 energy)
- Awaken (transform at start of owner's next turn)

## Rollback

1. Restore `cards.json` from `data/migrations/backups/` if ever edited.
2. Empty or revert `overlays` in `card-stats-v2.json`.
3. Optionally delete `/public/assets/cards/` and clear `card-asset-paths-v1.json` paths (UI falls back to legacy art).
