# Riftwilds TCG — Card System

**Status:** Foundational content pipeline (data-first). Not committed until approved.  
**Principle:** Cards are **JSON game objects**. Art is metadata (prompts) until original/licensed assets land.

## Rift Energy

Replaces mana:

| Rule | Value |
|------|-------|
| Start | 1 |
| Per turn | +1 |
| Cap | 10 |

Effects may ramp, drain, steal, store, or temporarily boost energy. **Gameplay never requires SOL.**

## Card as data

Every card in `src/content/tcg/data/cards.json` includes:

- Stats (`energyCost`, `attack`, `health`)
- Structured `abilities[].effects[]` for the engine
- `localization` strings (name, rules, flavor)
- `art` prompt metadata (not final bitmaps)
- `animation` / `sound` cue IDs
- Economy (`craftCost`, `sellValue`)
- Links to regions, NPCs, quests, Riftling slugs

Import via `@/content/tcg` — do not hardcode card lists in React.

## Keywords (original)

Ward, Corrupt, Awaken, Overflow, Riftbond, Echo, Bloom, Shatter, Guardian, Soulbind, Harmony, Charge, Empower, Ancient.

Full rules: `src/content/tcg/data/keywords.json`.

## Expansions

1. **Rise of the Rift (ROTR)** — foundational / live-as-data  
2–8. Planned (Frozen Kingdom → Dragon Rebellion) — see `expansions.json`

## Regenerating

```bash
npm run tcg:generate
npm run tcg:generate:card-images
npm run tcg:validate
```

Card faces composite existing pet/item art onto rarity frames via sharp (local only):

- Script: `scripts/tcg/generate-card-images.mjs`
- Output: `public/assets/tcg/cards/{cardId}.webp`
- Manifest: `src/content/tcg/data/cardImages.json`
- Prefer `art.cardImagePath` in binder / battle UI

## Balance

See `src/content/tcg/data/balance/foundational-report.md`. Adjust numbers in JSON only after playtests; keep keyword identities stable.

## Runtime engine (Phase 1 begun)

- Match loop: `src/game/tcg/` (consumes this content pack via adapter)  
- Demo UI: `/tcg/battle`, `/tcg/collection`  
- World handoff: Live World encounters → TCG when `TCG_WORLD_ENCOUNTERS_ENABLED`  
- Product vision: `docs/vision/PROJECT_VISION.md`

## What this does *not* do yet

- Full keyword/effect interpreter (Phase 1 uses cost/power/board attack simplification)
- Does not download third-party art
- Does not commit/push (await approval)
- Arena pet battler remains soft-secondary (not deleted)
