# The Lost City — Art QA

**Date:** 2026-07-20  
**Status:** PARTIAL — lettered procedural plates ready; Grok pending

## Status

| Metric | Value |
|--------|--------|
| Book pages | 38/38 |
| Raw art | 38 procedural |
| Lettered public | 38/38 under `public/assets/comics/the-lost-city/issue-004/pages/` |
| Grok | 0 (no `XAI_API_KEY`) |
| Font | Comic Neue Bold in `assets/fonts/comics/` (not `/public`) |

## Consistency locks (prompts)

- Spark Glowpup-line cyan-gold design  
- Mira Eggwarden hatchery travel coat  
- Aureth Vale pale stone / teal crystal / gold inlay  
- Last Guardian mossed armor + damaged sensor eye  
- Meridian three-arc sigil  
- NO purple AI-fantasy default  

## Resume (Grok)

```bash
# PowerShell
$env:XAI_API_KEY="..."
node scripts/comics/issue-004/generate-and-letter.mjs --force
# or batch:
node scripts/comics/issue-004/generate-and-letter.mjs --force --pages=1-10
```

## Gaps

- Procedural plates are layout/atmosphere placeholders — replace with Grok for production art.
- Reference sheets listed in `references/INDEX.json` — visual sheets not painted yet.
- Variant/foil covers exist as prompts in `covers.json`; only main cover baked from page 001.
