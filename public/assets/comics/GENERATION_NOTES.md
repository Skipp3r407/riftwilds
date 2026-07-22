# Comics art

- Covers: AI GenerateImage (original IP) — 10 issue covers in `covers/`
- Key splashes: AI scenic PNGs in `splashes/` (rift-dawn, circus, lost-city, festival, spark/storm/merchant/hunt/guardian/shadow)
- Scenic keys: `pages/key-*.png`, `page-commons-dusk`, `page-layered-ruin`, `page-lantern-sky`
- Per-issue plates: `pages/<slug>/page-01.webp` … (36–40) — **illustrated** (not diagram stubs)
- Reader pages (lettered): `public/assets/comics/<slug>/issue-00N/pages/page-00N.webp` — 10×25 story pages + front/back matter
- Batch pipeline (local): `npm run comics:seed-letter-all` (composites/legacy seed → programmatic lettering). Grok upgrade: set `XAI_API_KEY` and `--prefer-grok --force`

## Issue #001 — The Pulse Below (2026-07-20)

- Structured book: `src/content/comics/the-first-rift/issue-001/`
- Flattened lettered plates: `public/assets/comics/the-first-rift/issue-001/pages/page-001.webp` … `page-032.webp`
- Pipeline: `npm run comics:issue001` (seed+letter) · Grok art: `COMIC_IMAGE_PROVIDER=grok` + `comics:issue001:pipeline`
- Reader: `bakedLettering` — no HTML bubbles; Transcript drawer for a11y
- Soft Dawn Wind / mud page: `/comics/the-first-rift?page=19`

### Comic-panel regen (2026-07-22, local)

- Pages **3–12** regenerated as Western comic layouts (panel grids / splash + inset) with baked oval balloons (no speaker-name UI chips, no pipeline meta credits).
- Clean art staging: `artifacts/comics/generated/the-first-rift/issue-001/page-00N-clean.png`
- Raw → lettered: `content/.../generated/raw-art` → `public/assets/comics/the-first-rift/issue-001/pages/`
- Preview: `/comics/the-first-rift?page=3` … `?page=12`
- References (inspiration only): Western Z-path tiers/gutters, balloon tails to speakers, caption boxes for narration — not copied IP.

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

- 10/10 issues: reader lettered plates present under `public/assets/comics/<slug>/issue-00N/pages/` (2026-07-22)
- Each issue: **25/25 story pages** lettered + front/back matter (32–39 pages total)
- Rollup status: `public/assets/comics/GENERATION_STATUS_ALL.json`
- Art engine without `XAI_API_KEY`: illustrated composites / legacy plates + programmatic lettering
- Remaining gap: upgrade plates with Grok (`--prefer-grok --force`) when `XAI_API_KEY` is available
- Narration: ElevenLabs optional; scripts under `.cache/elevenlabs/` / `public/assets/audio/comics/`
