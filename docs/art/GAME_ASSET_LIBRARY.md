# Riftwilds Game Asset Library

> **1000+** original-IP overworld sprites. A **large Live World pack** is installed into Commons so players see them in `/live-world`.  
> Aligns with [ART_DIRECTION.md](./ART_DIRECTION.md) · [LIVING_TOWNS.md](./LIVING_TOWNS.md) · [ASSET_PIPELINE_2D3D.md](./ASSET_PIPELINE_2D3D.md).

## In-world vs catalog-only

| Scope | Count (approx) | Where |
|-------|----------------|--------|
| **Full catalog** | ≥1000 (currently **1284**) | `public/assets/game/library/**/*.webp` + `src/content/assets/game-library.json` |
| **Live World installed** | **~232** `lw-*` props (+ 7 legacy `lib-*`) | `public/assets/game/props/lw-*.png` — preloaded by BootScene via `PROP_KEYS` |
| **Catalog-only** | catalog − world pack | Remaining library WebPs — not Boot-preloaded; available for tools / future districts |

Exact install numbers: `public/assets/game/library/WORLD_INSTALL.json` and `artifacts/assets/game-library/WORLD_INSTALL_REPORT.md`.

## What’s shipped

| Piece | Path |
|-------|------|
| Catalog | `src/content/assets/game-library.json` · `game-library.ts` |
| World pack keys (generated) | `src/content/assets/library-world-keys.ts` |
| Library sprites | `public/assets/game/library/{trees,bushes,…}/*.webp` |
| Live World props | `public/assets/game/props/lw-*.png` (+ legacy `lib-*.png`) |
| Install index | `public/assets/game/library/WORLD_INSTALL.json` |
| Generator / pack / install | `scripts/assets/generate-game-library.mjs` · `game-library/world-pack.mjs` · `install-game-library.mjs` |

## Live World wiring

1. `npm run assets:install:library` selects the world pack, re-renders PNG props, writes `library-world-keys.ts`.
2. `PROP_KEYS` in `asset-keys.ts` spreads `LIBRARY_WORLD_KEYS` → BootScene preloads them.
3. `commonsPropScatter` in `premium-logic.ts` mixes pack keys into every district and places **every** world-pack key once across Commons hubs (variety pass), plus denser pathway clutter.
4. `filterScatterForBudget` keeps landmarks / lanterns on medium & low; drops every 2nd / 4th prop otherwise.

Missing textures are skipped (`textures.exists`) so Phaser boot stays safe.

## Commands

**No API key required.** Default path is fully local (procedural SVG → WebP/PNG via `sharp`).

```bash
npm run assets:generate:library          # full catalog WebPs (procedural, offline)
npm run assets:install:library           # world pack → props + keys (rerender quality pass)
npm run assets:install:library -- --no-rerender   # copy existing WebPs only
```

Optional paid upgrade (not needed for shipping base assets):

```bash
# Hero-quality pass via xAI Images — only if you want it
GAME_LIBRARY_ENGINE=grok XAI_API_KEY=... npm run assets:generate:library -- --limit=50
npm run assets:install:library
```

## Engines

| Engine | Status |
|--------|--------|
| **procedural** | **Default** — SVG→WebP/PNG, warm earth + cyan/amber accents. Works offline / CI with no keys. |
| **grok** | Optional upgrade when `XAI_API_KEY` is set — never required |
| **Blender** | Optional `scripts/assets/blender/render_iso_prop.py` |

## Style

Original Riftwilds IP only. Follow art bible / `RIFTWILDS_STYLE_SUFFIX`. No franchise names or copied assets.

## Tests

- `tests/unit/game-library-assets.test.ts` — catalog ≥1000 + files on disk
- `tests/unit/live-world-premium.test.ts` — Commons scatter + premium art
- `tests/unit/library-world-install.test.ts` — world pack installed + scatter uses `lw-*`
