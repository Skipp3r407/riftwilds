# Riftwilds Game Asset Library

> **1000+** original-IP overworld / UI sprites for Living Towns and the broader game.  
> Aligns with [ART_DIRECTION.md](./ART_DIRECTION.md) · [LIVING_TOWNS.md](./LIVING_TOWNS.md) · [ASSET_PIPELINE_2D3D.md](./ASSET_PIPELINE_2D3D.md).

## What’s shipped

| Piece | Path |
|-------|------|
| Catalog (JSON + typed helpers) | `src/content/assets/game-library.json` · `game-library.ts` |
| Sprite files | `public/assets/game/library/{trees,bushes,…}/*.webp` |
| Boot subset (Commons) | Installed into `public/assets/game/props/lib-*.png` |
| Generator | `scripts/assets/generate-game-library.mjs` |
| Installer | `scripts/assets/install-game-library.mjs` |
| Optional Blender | `scripts/assets/blender/render_iso_prop.py` |
| Progress / report | `artifacts/assets/game-library/` |

Catalog fields per entry: `id`, `category`, `path`, `tags`, `biome`, `layer` (`ground` / `prop` / `entity` / `structure` / `overhead` / `fx`), `anchors`, plus `family` / `variant` for regeneration.

## Quantity & coverage

Target: **≥1000 catalog entries with real files on disk**. Variants count (season × size × palette). Categories include terrain decals, roads, water, rocks, trees, bushes, flowers, grass, vines, mushrooms, modular building parts, stalls, fences, gates, bridges, docks, crates/barrels/lanterns/signs/furniture/tools/goods, animals, ambient FX, Riftling species stages, NPCs, Keepers, items, eggs, equipment icons, and weather/smoke/sparkle/shadow frames.

See `artifacts/assets/game-library/GENERATION_REPORT.md` for the latest count and breakdown.

## Engines

| Engine | When | Notes |
|--------|------|--------|
| **procedural** (default) | No API key | Deterministic SVG → WebP via `sharp`. Warm earth palette, cyan/amber accents. |
| **grok** | `XAI_API_KEY` set | `POST https://api.x.ai/v1/images/generations` with `RIFTWILDS` style suffix. Rate-limited, resumable via `artifacts/assets/game-library/progress.json`. |
| **Blender** (optional) | `blender` on PATH | Iso prop renders; does not replace the catalog bulk path. |

**Honesty:** If `XAI_API_KEY` is missing, the pipeline falls back to procedural and records that in the generation report. Never commit secrets.

## Commands

```bash
# Expand catalog + write all library WebPs (resume-safe)
npm run assets:generate:library

# Catalog JSON/TS only
node scripts/assets/generate-game-library.mjs --catalog-only

# Force rewrite
npm run assets:generate:library -- --force

# Grok batch (costs credits)
GAME_LIBRARY_ENGINE=grok XAI_API_KEY=... npm run assets:generate:library -- --limit=50

# Copy boot-critical props into Live World prop folder
npm run assets:install:library

# Optional Blender sample
blender --background --python scripts/assets/blender/render_iso_prop.py -- --out public/assets/game/library/props/blender-crate.png --kind crate
```

## Live World integration

- **BootScene** loads only existing `PROP_KEYS` (including seven `lib-*` keys). It does **not** preload all 1000+ files.
- `npm run assets:install:library` converts boot-critical WebPs → PNGs under `public/assets/game/props/`.
- Commons scatter uses a **small subset** of library keys (market / grove / landmarks). The rest is available via `GAME_LIBRARY` for tools, editors, and future Living Towns scatter-by-tag.
- Missing `lib-*` textures are skipped safely (`textures.exists` guard) so Live World still loads.

## Style contract

Prompts / procedural art must follow `RIFTWILDS_STYLE_SUFFIX` / art bible:

- Original Riftwilds IP only — never franchise names or copied assets
- Warm earth first; cyan rift + amber hearth accents
- Soft-isometric / painterly cutouts; transparent backgrounds for props/actors
- No text, watermarks, or opaque scenic plates

## Tests

`tests/unit/game-library-assets.test.ts` asserts catalog count ≥ 1000 and that every entry path exists with real bytes.
