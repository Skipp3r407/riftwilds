# Missing Assets

**Scan:** 2026-07-17T22:41:21Z  
**Totals:** generated=295, pending=136, legacy=12, failed=0

## Closed this session (critical)

| Priority | Category | Items |
|----------|----------|-------|
| P2 | Bosses | alloy-warframe, spirit-lantern-king, celestial-rift-entity key-art |
| P3 | Worlds | 8 region overviews (stormspire → celestial-rift) |
| P4 | Pets | 11 starter pipeline portraits (frostuft…astralynx) |
| P4 | Affinities | 11 affinity icons (ember…celestial) |
| P4 | NPCs | elara-venn, archivist-solen, plaza-vendor-cal, portal-keeper |

Verified via HTTP 200 on local servers for sample world/pet/boss paths.

## Still missing (non-P0)

Dominant backlog after scan:

1. **NPC portraits** (~100+) — story/plaza/region cast (parallel agents may still be filling)
2. **Enemy portraits** (~19) — Live World PvE art
3. **Battle animation sheets** (P9) — creature sheet packing
4. Occasional world/pet gaps if manifest grows

## Acceptance for closed alpha

- Critical navigation surfaces (home/about/hatchery/world/shop) must not 404 core brand/hero art.
- Missing NPC/enemy art may use placeholders; document as content backlog.
- Do **not** mark full art production-ready until `asset-status.json` approvals catch up.

## Pipeline

```bash
npm run assets:scan
npm run assets:generate:all
npm run assets:report
```

Generated masters land under `public/assets/…`. Cursor `GenerateImage` outputs may stage in the project assets cache then copy into `public/assets`.
