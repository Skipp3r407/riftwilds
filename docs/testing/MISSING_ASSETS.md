# Missing Assets

**Scan:** 2026-07-18T05:26:51Z  
**Totals:** generated=546, pending=0, legacy=12, failed=0

See also: [`docs/assets/IMAGE_GENERATION_REPORT.md`](../assets/IMAGE_GENERATION_REPORT.md) and [`docs/assets/IMAGE_ASSET_MANIFEST.json`](../assets/IMAGE_ASSET_MANIFEST.json).

## Closed (2026-07-18 full image authorization)

| Priority | Category | Items |
|----------|----------|-------|
| P4 | Ambient NPCs | 58 stub portraits → painted masters + derived thumbs/sprites |
| P2 | Items | 65 catalog icon paths (weapons/armor/potions/materials) |
| P2 | Site | OG default, empty states (wallpapers already present) |
| P2 | Live World | BootScene terrain masters + commons tileset |
| — | Maps | `maps/world-overview.png` (+ region overviews from parallel work) |

## Remaining quality backlog (not scan-pending)

1. Dedicated ambient full-body / overworld sprite sheets (currently portrait-derived)
2. Painted upgrades for procedural item icons (4 weapons already painted)
3. Wallpaper / affinity WebP delivery pass for remaining multi‑MB PNGs
4. Battle animation sheet packing (outside current registry pending list)

## Pipeline

```bash
npm run assets:scan
npm run assets:generate:all
npm run assets:report
node scripts/assets/derive-ambient-npc-art.mjs
node scripts/assets/optimize-site-surfaces.mjs
node scripts/assets/build-image-asset-manifest.mjs
```

Generated masters land under `public/assets/…`. Cursor `GenerateImage` outputs stage under the Cursor assets cache then copy into `public/assets`.
