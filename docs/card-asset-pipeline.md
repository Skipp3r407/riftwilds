# Card asset pipeline

## Target layout

```
/assets/cards/{expansion}/{slug}/
  art.webp          # clean subject / scene — no stats
  thumb.webp        # binder thumb
  foil-mask.webp    # optional cosmetic
```

## Current state

- **Published:** all 735 cards have folders under `/public/assets/cards/{expansion}/{slug}/`.
- Index: `src/content/tcg/data/migrations/card-asset-paths-v1.json`
- Resolver: `src/content/tcg/framework/card-asset-paths.ts` → `normalizeCard.cleanArtPath`
- Legacy baked faces remain at `/assets/tcg/cards/{id}.webp` as fallback only.
- Ids stay stable; ownership / decks unchanged.

## Publish steps (local)

```bash
npm run tcg:assets:publish
```

1. Copies existing clean source (pet thumb / subject / face) into the target folder.
2. Writes path index — never mutates `cards.json` combat numbers.
3. UI prefers clean art; MasterCardTemplate composes stats dynamically.

## Rules

- Never rasterize ATK/HP into `art.webp`.
- Founder / foil / champion finishes are cosmetic-only.
