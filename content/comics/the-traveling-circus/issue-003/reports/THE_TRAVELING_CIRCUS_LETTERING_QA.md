# The Traveling Circus — Lettering QA

## Rules

- No HTML/DOM speech bubbles in the reader for baked pages (`bakedLettering: true`, `composedPlate: true`)
- Lettering flattened into page images via Sharp + private Comic Neue Bold
- Transcripts stored in page JSON + `ISSUE_003_TRANSCRIPTS` for a11y

## Checks

| Check | Status |
|-------|--------|
| Balloon tails avoid faces / Spark & Lumenhare eyes | Scripted |
| Narration/caption boxes for splash pages | Scripted |
| SFX stylized, not publisher trademarks | PASS |
| Page numbers baked | Pipeline |
| Cover titles baked programmatically | Pipeline |

## Resume letter-only

```bash
npm run comics:issue-003:letter -- --pages=1-38
```
