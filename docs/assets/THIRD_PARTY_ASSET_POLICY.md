# Third-Party Asset Policy (Riftwilds)

**Status:** Binding for discovery / import work  
**Owner:** Art + Legal review (human)  
**Registry:** `assets/licenses/third-party-assets.json`

## Purpose

Allow aggressive search for **clearly licensed** third-party materials that can accelerate UI, ambience, textures, and prototype tiles — without compromising Riftwilds commercial rights or original IP.

## Allowed license categories

| Category | Notes |
|----------|--------|
| CC0 | Preferred |
| Public domain | Verify jurisdiction / dedication |
| Explicit free commercial | Creator must state commercial game use OK |
| MIT / Apache 2.0 / BSD | Software-style; confirm asset applicability |
| Creator commercial-use with attribution | Track attribution text in registry |

## Rejected (hard)

- No license / “all rights reserved” without grant
- Personal use only / non-commercial (NC)
- Unclear ownership or missing author
- Ripped commercial game assets
- Trademarked characters / franchise lookalikes
- AI packs with unclear training / redistribution rights
- Fan-art that conflicts with third-party IP
- Pokémon / Digimon / Palworld / Axie / Neopets / Tamagotchi lookalikes
- Bypassing paywalls, logins, robots.txt, ToS, or rate limits

## Kenmi / “Cute Fantasy” note

Art direction may cite **Kenmi-quality** as a visual bar. That is **not** a license grant. Do **not** import Kenmi (or similar) packs until the exact listing’s commercial license is verified and recorded. Until then: `RESTRICTED`.

## Workflow statuses

`DISCOVERED` → `LICENSE_REVIEW` → (`APPROVED` | `NEEDS_ATTRIBUTION` | `REJECTED` | `RESTRICTED`) → `IN_USE`

Only `APPROVED`, `NEEDS_ATTRIBUTION`, and `IN_USE` may touch `public/` runtime paths.

## Original creatures

All Riftling species art must remain **original Riftwilds IP**. Third-party creature sprites are not a substitute for the companion roster.

## Related docs

- [ASSET_DISCOVERY_PIPELINE.md](./ASSET_DISCOVERY_PIPELINE.md)
- [ASSET_IMPORT_PIPELINE.md](./ASSET_IMPORT_PIPELINE.md)
- [ASSET_LICENSE_REVIEW.md](./ASSET_LICENSE_REVIEW.md)
- [ASSET_SECURITY.md](./ASSET_SECURITY.md)
- [THIRD_PARTY_ASSET_REGISTRY.md](./THIRD_PARTY_ASSET_REGISTRY.md)
- [ASSET_STYLE_GUIDE.md](./ASSET_STYLE_GUIDE.md)
