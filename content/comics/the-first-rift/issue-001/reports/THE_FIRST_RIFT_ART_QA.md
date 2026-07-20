# The First Rift — Art QA

**Updated:** 2026-07-20

## Generation summary

| Metric | Count |
|---|---|
| Book pages | 38 |
| Art generated | 38 |
| Grok pages | 0 (XAI_API_KEY missing) |
| Procedural text-free plates | 38 |
| Lettered + flattened | 38 |

## Paths

- Raw art: `content/comics/the-first-rift/issue-001/generated/raw-art/`
- Lettered: `content/comics/the-first-rift/issue-001/generated/lettered-pages/`
- Reader plates: `public/assets/comics/pages/the-first-rift/page-01.webp` … `page-38.webp`
- Cover: `public/assets/comics/covers/the-first-rift.webp`

## Gaps

1. **Grok upgrade pending** — set `XAI_API_KEY` and run:
   ```bash
   npm run comics:issue-001:generate -- --force
   ```
2. Procedural plates are composition placeholders (panels, silhouettes, balloon-safe zones) — not final painted quality.
3. Variant covers A/B/foil currently reuse standard plate.

## Resume

```bash
npm run comics:issue-001:generate -- --force --pages=1-10
npm run comics:issue-001:generate -- --force --pages=11-25
npm run comics:issue-001:generate -- --force --pages=26-38
```
