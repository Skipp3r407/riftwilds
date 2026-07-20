# Art QA — Issue #001

## Pipeline
1. **Stage A — text-free art:** Grok (`XAI_API_KEY` + `COMIC_IMAGE_PROVIDER=grok`) or cursor-local jobs / OpenAI.  
2. **Stage B — lettering:** `lettering-engine.ts` flattens balloons into WebP.  
3. **Seed mode (this run):** `--seed-from-legacy` reused prior Issue #1 plates as clean bases so all 32 pages could be lettered immediately.

## Status (2026-07-20)
| Metric | Count |
|--------|------:|
| Book pages | 32 |
| Clean art present | 32 (seeded-legacy) |
| Lettered public plates | 32 |
| True Grok regenerations | 0 this run (use resumeArt) |

## Gaps
- Replace seeded bases with dedicated Grok plates matching each `prompts/page-NNN.txt` for showcase fidelity (especially p019 Soft Dawn / mud, p013 Forest Bond, p027 cliffhanger).
- Cover variants A/B/foil still point at standard cover art until generated into `public/assets/comics/the-first-rift/issue-001/covers/`.

## Resume art
```bash
set COMIC_IMAGE_PROVIDER=grok
set XAI_API_KEY=…
npx tsx scripts/comics/run-issue-001-pipeline.mts --from=1 --to=32
# or single page after dropping clean PNG into generated/clean/
npx tsx scripts/comics/run-issue-001-pipeline.mts --lettering-only --from=19 --to=19
```
