# Asset Import Pipeline (scaffolded)

**Gate:** No production import until discovery report is human-approved.

## Stages

```
DISCOVERED → LICENSE_REVIEW → APPROVED / NEEDS_ATTRIBUTION
       ↓                              ↓
  private-assets/discovered    private-assets/approved
                                      ↓
                         process (resize, atlas, tint)
                                      ↓
                         public/assets/… or public/sounds/…
                                      ↓
                                   IN_USE + credits
```

## Scaffolding in repo

| Piece | Path | State |
|-------|------|--------|
| Registry | `assets/licenses/third-party-assets.json` | Live metadata |
| Schema / validate | `src/lib/assets/third-party/*` | Enforced by tests |
| Import gate | `scripts/assets/third-party/import-gate.mjs` | Check-only |
| Staging dirs | `private-assets/{discovered,approved,rejected,restricted}` | Empty |
| Admin UI | `/admin/assets/library` | Browse stub |
| Admin API | `/api/admin/assets/library` | GET live; POST stubbed |

## Process rules (when approved)

1. Download **only** the approved pack URL into `private-assets/discovered/{id}/`.
2. Re-verify license file inside the zip matches registry.
3. Move to `approved/` and set status `APPROVED` or `NEEDS_ATTRIBUTION`.
4. Process into game-ready formats (prefer existing `scripts/assets/*` optimizers).
5. Copy **derivatives** into `public/` — keep raw packs private.
6. Set `runtimePath`, status `IN_USE`, update credits docs.
7. Run `import-gate.mjs` + unit tests.

## Must not

- Copy `RESTRICTED` / `REJECTED` / `DISCOVERED` into `public/`
- Execute untrusted install scripts from packs
- Rebuild Live World / `BlueprintRegionScene` as part of import
