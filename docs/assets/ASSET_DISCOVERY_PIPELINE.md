# Asset Discovery Pipeline

## Goal

Find **reputable, clearly licensed** candidates and score them for Riftwilds style fit — **without** downloading into production runtime.

## Allowed sources (search list)

| Source | Typical licenses | Notes |
|--------|------------------|-------|
| [Kenney.nl](https://kenney.nl/assets) | CC0 | Prefer official site |
| [OpenGameArt](https://opengameart.org/) | Mixed — verify each | Watch CC-BY-SA |
| itch.io free listings | Mixed — verify each | Read license field |
| [game-icons.net](https://game-icons.net/) | CC BY 3.0 / some CC0 | Attribution |
| [Freesound](https://freesound.org/) | Mixed — filter CC0 | No bulk scrape |
| [Poly Haven](https://polyhaven.com/) | CC0 | Photoreal — style risk |
| [ambientCG](https://ambientcg.com/) | CC0 | Photoreal — style risk |
| Wikimedia Commons | PD / CC — per file | Reference mood only |
| Licensed GitHub | MIT/Apache/BSD/CC0 | Prefer upstream LICENSE |

## Process

1. Search source → open listing → capture metadata.
2. Add row to `assets/licenses/third-party-assets.json` with `DISCOVERED` or `LICENSE_REVIEW`.
3. Score style 0–100 (see [ASSET_STYLE_GUIDE.md](./ASSET_STYLE_GUIDE.md)).
4. Link preview URL — **do not** import pack into `public/`.
5. Human review via [ASSET_DISCOVERY_CANDIDATES.md](./ASSET_DISCOVERY_CANDIDATES.md).
6. Only after approval: download into `private-assets/discovered/` then license review.

## Hard stops

- No scraping sites or bypassing paywalls / robots / ToS.
- No Pokémon / Digimon / Palworld lookalike creature packs.
- No Kenmi pack import without verified commercial license.
- No commit/push/deploy of bulk binary packs without approval.

## Tools

- Registry + validators (`src/lib/assets/third-party/`)
- Gate script: `node scripts/assets/third-party/import-gate.mjs`
- Admin browse: `/admin/assets/library`
