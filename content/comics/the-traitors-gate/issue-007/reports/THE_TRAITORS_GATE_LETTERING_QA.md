# The Traitor's Gate — Lettering QA

**Date:** 2026-07-20  
**Status:** PASS (programmatic bake)

## Checklist

| Check | Result |
|-------|--------|
| Two-stage art → letter → flatten | PASS |
| Private Comic Neue Bold (not `/public`) | PASS |
| Speech / narration / SFX baked into WebP | PASS |
| Transcripts retained in page JSON + generated catalog | PASS |
| Reader `bakedLettering: true` | PASS |
| No DOM speech overlays required | PASS |
| Gate / mirror magic text as balloon kinds | PASS |
| Page numbers in overlay | PASS |

## Gaps

- Automatic overflow/collision audit is visual — re-check after Grok plates replace procedural bases with `--letter-only` if needed.
