# SPARKS_JOURNEY_LETTERING_QA.md

## Pipeline
Two-stage: text-free art → `lettering-engine.ts` SVG composite → flattened WebP.  
**No HTML/DOM speech bubbles** on the reader plate (`bakedLettering: true`).

## Status
- All 38 pages: `letteringStatus: lettered` (over placeholder art)
- Fonts: shared engine fonts outside `/public` (same as Issue #1)
- Transcripts: JSON + `ISSUE_002_TRANSCRIPTS` for a11y drawer

## Checks
- [x] Balloon positions % based
- [x] Captions for Codex fail / cliffhanger / TO BE CONTINUED
- [x] SFX lexicon Riftwilds-original (no Marvel/DC onomatopoeia)
- [ ] Re-letter after Grok art replace (faces/tails clearance pass)
