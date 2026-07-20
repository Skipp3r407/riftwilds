# SPARKS_JOURNEY_ART_QA.md

## Status
| Item | Status |
|------|--------|
| Page count | 38 book pages scripted + prompt files |
| Clean art | Placeholder seeded plates (`generated/raw-art/`) |
| Public lettered | `public/assets/comics/sparks-journey/issue-002/pages/` |
| Grok production art | **Pending** — XAI_API_KEY missing |

## Character lock
- Mira Eggwarden: hatchery robes, satchel, Compact mentor look
- Spark: Glowpup-line Riftborn (see SPARK_CANON_PROPOSAL.md)
- Do **not** generate Cal Reed

## Resume
```bash
COMIC_IMAGE_PROVIDER=grok XAI_API_KEY=… npx tsx scripts/comics/run-issue-002-pipeline.mts --from=1 --to=38
npx tsx scripts/comics/run-issue-002-pipeline.mts --lettering-only --from=1 --to=38
```
