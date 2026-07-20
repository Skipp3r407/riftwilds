# Comics art

- Covers: AI GenerateImage (original IP) — 10 issue covers in `covers/`
- Key splashes: AI scenic PNGs in `splashes/` (rift-dawn, circus, lost-city, festival, spark/storm/merchant/hunt/guardian/shadow)
- Scenic keys: `pages/key-*.png`, `page-commons-dusk`, `page-layered-ruin`, `page-lantern-sky`
- Per-issue plates: `pages/<slug>/page-01.webp` … (36–40) — **illustrated** (not diagram stubs)

## Issue #001 — The Pulse Below (2026-07-20)

- Structured book: `src/content/comics/the-first-rift/issue-001/`
- Flattened lettered plates: `public/assets/comics/the-first-rift/issue-001/pages/page-001.webp` … `page-032.webp`
- Pipeline: `npm run comics:issue001` (seed+letter) · Grok art: `COMIC_IMAGE_PROVIDER=grok` + `comics:issue001:pipeline`
- Reader: `bakedLettering` — no HTML bubbles; Transcript drawer for a11y
- Soft Dawn Wind / mud page: `/comics/the-first-rift?page=19`

## Illustrated plate pipeline (2026-07-20)

1. **Composites (batch, resume-friendly)** — `npm run comics:composites -- <slug|--all>`  
   Composites official covers/splashes + card/NPC cast art into multi-panel comic plates.
2. **AI showcase upgrades** — Cursor GenerateImage → `npm run comics:install-page -- <slug> <n> <png>`  
   Issue #1 AI showcase pages (among others): 4, 5, 7, 8, 9, 11, 12, 13, 14  
   Staging copies: `artifacts/comics/generated/<slug>/`
3. **Prompts** — `npm run comics:prompts -- [slug]` → `artifacts/comics/prompts/`
4. **Progress** — `npm run comics:progress` (heuristic: ≥80KB = illustrated)
5. **Audit** — `npm run comics:audit` (every catalog page has `artSrc` + file on disk)

Reader: unique plates set `composedPlate: true` so multi-panel layouts show one full painted page (bubbles remapped to page space) instead of CSS-cropping the same plate.

## Completeness

- 10/10 issues: all page plate slots illustrated (audit: 0 missing files)
- Issue #1: 40/40 plates; AI showcase on key story beats (Gateway Hearts p9, Forest Bond p12, etc.)
- Remaining gap: continue AI GenerateImage upgrades page-by-page using prompt dumps (rate-limit resume)
- Narration: ElevenLabs optional; scripts under `.cache/elevenlabs/` / `public/assets/audio/comics/`
