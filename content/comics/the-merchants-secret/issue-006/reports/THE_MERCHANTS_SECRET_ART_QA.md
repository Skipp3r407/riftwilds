# The Merchant's Secret — Art QA

## Pipeline

- Stage 1: Grok (`XAI_API_KEY`) or procedural plate  
- Stage 2: Programmatic lettering (Comic Neue Bold under `assets/fonts/comics/` — **not** `/public`)  
- Flattened output: `public/assets/comics/the-merchants-secret/issue-006/pages/`  
- Fonts never served from `/public`

## Palette lock

Black lacquer, warm gold, deep red fabric, teal Rift glass, brass — **no purple neon AI-fantasy default**.

## Design locks

| Subject | Lock |
|---------|------|
| Mira / Spark | Same as Issues #1–5 |
| Aurelia Voss | Black-gold coat, half-veil, keys, ledger chains |
| Lockjaw Wisp | Keyhole pupils, brass rings |
| Cindermink | Ember-red, chain scar, smoke tail |
| Seris | Three-arc Meridian + ledger |

## Current generation status (2026-07-20)

| Metric | Value |
|--------|-------|
| Pages art+lettered | **38 / 38** |
| Engine | procedural (Grok not configured — `grokConfigured: false`) |
| Font | ComicNeue-Bold (private `assets/fonts/comics/`) |
| Errors | 0 |

## Resume / upgrade to Grok

```bash
npm run comics:issue-006:generate
npm run comics:issue-006:generate -- --pages=1-10
npm run comics:issue-006:generate -- --force
npm run comics:issue-006:letter -- --pages=1-38
# With Grok:
# set XAI_API_KEY=... 
# npm run comics:issue-006:generate -- --force
```

See `GENERATION_STATUS.json` after each run.
