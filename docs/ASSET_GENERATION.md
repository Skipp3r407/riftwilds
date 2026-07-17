# Riftwilds asset generation

## Goal

Produce **real PNG masters** under `public/assets/`, register them in `public/assets/asset-manifest.json`, and wire game paths. Prompts/SVGs alone are not done.

## Provider

| `IMAGE_PROVIDER` | Behavior |
| --- | --- |
| `cursor-local` (default) | Writes batch jobs to `artifacts/assets/batches/`. Agent uses Cursor **GenerateImage**, copies into `public/`. |
| `openai` | Calls Images API when `IMAGE_API_KEY` / `OPENAI_API_KEY` is set. |
| `replicate` | Needs `REPLICATE_API_TOKEN`; otherwise falls back to cursor-local batch. |
| `none` | Skip generation. |

Env vars are documented in `.env.example`. Keys stay server/script-side only.

## Commands

```bash
npm run assets:scan              # compare defs vs files → manifest + report
npm run assets:generate          # batch for all missing (cursor-local by default)
npm run assets:generate:worlds   # category filters
npm run assets:generate:pets
npm run assets:generate:eggs
npm run assets:generate:items
npm run assets:generate:npcs
npm run assets:generate:enemies
npm run assets:generate:bosses
npm run assets:generate:buildings
npm run assets:generate:ui
npm run assets:generate:effects
npm run assets:generate:animations
npm run assets:generate:all      # priority ≤ 2
npm run assets:optimize          # sharp recompress (default worlds/)
npm run assets:validate          # real PNG checks for generated/legacy
npm run assets:report            # markdown + json under artifacts/assets/reports/
npm run assets:mask              # transparent matte key
```

## Directory layout (preferred)

```
public/assets/
  worlds/{slug}/card.png
  worlds/{slug}/overview.png
  pets/{slug}.png                 # launch portraits (keep URL stable)
  eggs/egg-{class}.png
  items/{cat}/icons/{id}.png
  npcs/{id}/portrait.png
  bosses/{id}/key-art.png
  buildings/commons/{slug}.png
  ui/map/{slug}.png
  regions/{slug}.png              # legacy banners (still wired as fallback)
```

## Honest status

Manifest statuses: `generated` only when the file exists. Animation sheets and most enemies remain `pending` until masters exist — never mark complete without files.

## Admin

`/admin/assets` reads `asset-manifest.json` and filters missing / generated / failed / legacy.

## Style guides

See `artifacts/assets/style-guides/`.
