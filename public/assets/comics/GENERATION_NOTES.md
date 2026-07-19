# Comics art

- Covers: AI GenerateImage (original IP) — 10 issue covers in `covers/`
- Key splashes (rift-dawn, circus, lost-city, festival, spark/storm/merchant/hunt/guardian/shadow): AI scenic PNGs in `splashes/`
- Scenic pages (`page-commons-dusk`, `page-layered-ruin`, `page-lantern-sky`) + procedural keys (`key-*.png`)
- Per-issue unique plates: `pages/<slug>/page-01.webp` … `page-36.webp` via `node scripts/comics/generate-page-art.mjs`
- Key procedural fill: `node scripts/comics/generate-comic-art.mjs` (`--force` to regenerate)
- Audit: `npx tsx scripts/comics/audit-pages.mts`
- All `PAGE_ART` / `SPLASH` / `COVER` paths in `src/content/comics/art.ts` must exist under `public/`

## Completeness (2026-07-18)

- 10/10 published issues story-complete with expansions + thematic bridges
- Unique splash art for all 10 issue key visuals
- 360 unique per-issue page plates (36 × 10)
- Reader wires unique plates for non-splash pages via `ensureIssueArt`
- Narration: ElevenLabs mp3s optional; browser SpeechSynthesis fallback when clips missing
