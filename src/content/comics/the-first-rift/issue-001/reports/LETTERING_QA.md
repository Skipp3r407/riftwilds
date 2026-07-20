# Lettering QA — Issue #001

## Rules
- **No HTML/DOM speech bubbles** on the visible page (`bakedLettering: true` on all pages).
- Dialogue flattened into `public/assets/comics/the-first-rift/issue-001/pages/page-NNN.webp`.
- Structured script retained in `pages/page-NNN.json` + `script.json` + reader **Transcript** drawer.
- Fonts for bake live under `issue-001/fonts/` (NOT `/public`).

## Engine
- `src/lib/comics/lettering-engine.ts` — wrap, collision nudge, safe margins, SVG balloons/captions/SFX.
- Bake via `scripts/comics/run-issue-001-pipeline.mts`.

## Soft Dawn Wind (user complaint page)
- Book **page 19** / story-15: narration “Mud took bootprints…”, Elara speech, SFX “soft dawn wind” baked into plate.
- Preview: `/comics/the-first-rift?page=19`

## Checklist
- [x] 32/32 lettered this run  
- [x] Reader hides bubble layer when `bakedLettering`  
- [x] Transcript drawer available  
- [ ] Manual visual pass for balloon overlap on dense 2x2 pages (14, 18)
