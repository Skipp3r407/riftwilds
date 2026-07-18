# Riftwilds printables (300 DPI)

Print-ready fan gear for Keepers and families: battle posters, companion trading cards, adventure bookmarks, sticker sheets, 5×7 cards, a Traveling Circus party invite, and a Spark paper standee.

**Tone:** warm fantasy + cyan/amber rift energy (art bible). Kid-OK adventure — not chibi sticker mush. Regenerate with `npm run assets:printables` after editing `scripts/assets/generate-printables.mjs`.

## Public URLs

| Surface | Path |
|---------|------|
| Hub | `/printables` |
| Fan Kit section | `/fan-kit#printables` |
| Coloring cross-link | `/coloring` |
| Assets | `/assets/printables/*` |

## Regenerate

```bash
npm run assets:printables
# or
node scripts/assets/generate-printables.mjs
```

Writes PNG (with 300 DPI density / pHYs metadata), PDF, and SVG sources under `public/assets/printables/`, plus `manifest.json`.

## Paper sizes @ 300 DPI

| Paper | Pixels | Notes |
|-------|--------|-------|
| US Letter 8.5×11" | 2550×3300 | Default for most sheets |
| A4 | 2480×3508 | `poster-spark-a4` |
| 5×7" | 1500×2100 | Keepsake cards |

## Print tips

1. Prefer **PDF** downloads for home printers.
2. Print at **100% / actual size** (disable fit-to-page).
3. Sticker paper for sticker sheets; cardstock for standees and trading cards.
4. Personal / kids / party use only — **not for resale**.

## License / credit

Original Riftwilds IP. Free for personal, kids, and party use. Credit Riftwilds when sharing. Do not resell.
