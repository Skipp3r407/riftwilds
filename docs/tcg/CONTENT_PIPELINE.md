# TCG Content Pipeline

## Goal

Scale to **500+ cards** without rewriting the battle engine. Designers and generators emit **structured JSON**; presentation (frames, art, VFX) attaches later.

**Current ROTR generate:** ~735 cards covering **100/100** lore species, plus catalog items, regions, and game-library props. Art uses optional `art.assetPath` when a public asset exists.

## Phases

| Phase | Deliverable | Gate |
|-------|-------------|------|
| 0 | Schema + keywords + Rift Energy | Done (local) |
| 1 | Foundational ROTR set + starters + heroes | Validate + playtest |
| 2 | NPC/boss decks, more heroes (→40) | Approval |
| 3 | Expansion 2 data (Frozen Kingdom) | After balance |
| 4 | Art production from `artPrompts.json` | Original/licensed only |
| 5 | Engine import + Live World encounter → TCG board | Pivot work |

## File map

```
src/content/tcg/
  types.ts                 # Schema
  index.ts                 # Loaders
  data/
    cards.json
    heroes.json
    decks.json
    keywords.json
    expansions.json
    boardThemes.json
    cardFrames.json
    artPrompts.json
    soundManifest.json
    animationManifest.json
    bundle.json
    balance/foundational-report.md
scripts/tcg/generate-foundational-set.mjs
scripts/tcg/content-sources.mjs   # read-only lore / catalogs / library loaders
docs/tcg/CARD_SYSTEM.md
docs/tcg/CONTENT_PIPELINE.md
docs/tcg/FOUNDATIONAL_SET.md
```

## Commands

```bash
npm run tcg:generate   # rewrite src/content/tcg/data/*.json from world sources
npm run tcg:validate   # vitest tests/unit/tcg-content.test.ts
```

## Rules

1. **Never copy** protected TCG characters, names, art, or mechanics verbatim.
2. **Expand** existing Riftwilds lore/regions/Riftlings — do not overwrite pet lore modules.
3. Cards reference `riftlingSlug` / `regionId` when applicable.
4. Art prompts include negative prompts against franchise resemblance; prefer `art.assetPath` when files exist under `public/assets`.
5. No commit/push until product owner approves the foundational set.

## Marvel Snap–like accessibility (inspiration, not a clone)

- Short matches, clear energy curve, readable boards  
- Starter decks teach one keyword family each  

## MTG–like depth (inspiration, not a clone)

- Keywords with counterplay  
- Deck archetypes and sideboard-style upgrades later  

## Living-world feel

- NPC-owned decks, locations as cards, quest cards tied to Commons activities  
