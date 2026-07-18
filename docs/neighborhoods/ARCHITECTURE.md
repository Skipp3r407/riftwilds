# Player Neighborhoods Architecture

**Status:** Production core (in-memory). Prisma prepare-only.  
**Pairs with:** [Housing Architecture](../housing/ARCHITECTURE.md)

## Design

- **Shared world exteriors** — roads, parks, lighting, trees, mailboxes, ponds, campfires, NPC visitors/animals/musicians
- **Private interiors** — enter via door/gate → owner `HomeInstance`
- **Future kingdoms/nations** — reserved; no wars / abuse powers in government

## Extends

Land ownership, player-cities (civic renown sibling), housing instances, player shops, guild halls, Credits, Live World Commons, events.

## Modules

`src/lib/neighborhoods/neighborhood-service.ts` — seed Commons Alpha (~36 plots), claim, projects, mayor/council cosmetic motions, storefronts, events, seasonal décor, abandonment tick.

## Districts

Residential · Merchant · Crafting · Farming · Fishing · Magic · Guild · Military (cosmetic) · Entertainment · Temple · Luxury

## Village evolution

Hamlet → Village → Town → City → Capital by occupied home thresholds. Unlocks bank, inn, AH, blacksmith, stable, fast-travel stubs, arena, museum, town hall.

## UI / API

- `/neighborhoods` · `GET/POST /api/neighborhoods`
- Live World entry stubs link `neighborhoodId: nbhd_commons_alpha`

## Coordinate with

- **Living Towns / Commons districts** — shared exterior props; do not fight map blueprint ownership
- **Comics** — housing `comic_cover_frame` display SKU; competitions remain separate
