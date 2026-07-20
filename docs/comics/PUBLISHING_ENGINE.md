# Riftwilds Comic Publishing Engine

Professional comic **publishing** stack for Legends of the Rift — not a simple page flipper.

> Original Riftwilds fantasy IP only. Marvel/DC characters, layouts, and proprietary SFX are direction-only references and must never be copied.

## Architecture

```
content/comics/
  types.ts              — issue / page / panel / dialogue / unlock / covers
  catalog.ts            — ten published issue seeds
  page-builder.ts       — beats → story pages + lettering helpers
  publishing-engine.ts  — front/back matter, panel frames, cover variants, publishIssue()
  story-arcs.ts         — volumes + arcs
  canon-links.ts        — comic → Codex / TCG / deck builder
  story-expansions.ts   — bridge copy for page targets
  art.ts / rewards.ts

lib/comics/
  progress.ts           — localStorage progress, favorites, settings
  unlock.ts             — free-first unlock evaluation (never crypto-gate core story)
  offline.ts            — Cache API prefetch scaffolding
  audio-hooks.ts        — music / voice cue stubs
  bubble-layout.ts      — lettering placement

components/comics/
  comics-library.tsx    — shelves + filters + continue + offline prefetch
  comic-reader.tsx      — publisher reader (zoom, guided panels, VO, music toggles)
  comic-page-view.tsx   — multi-panel canvas + impacts
  comic-speech-bubbles.tsx — full dialogue kinds
  comic-studio.tsx      — admin publishing UI
  comic-book-stage.tsx  — page-turn stage
```

## Routes

| Route | Purpose |
|-------|---------|
| `/comics` | Lore Library (volumes, arcs, search, favorites, progress) |
| `/lore` | Alias → `/comics` |
| `/comics/[issueSlug]` | Reader (`?page=`) |
| `/admin/comics` | Comic Studio (catalog, pages, lettering, covers, publish, arcs) |

Preview examples (local):

- `http://localhost:3000/comics`
- `http://localhost:3000/comics/the-first-rift`
- `http://localhost:3000/comics/the-first-rift?page=6`
- `http://localhost:3000/admin/comics`

## Issue book format (~30–40 pages)

`publishIssue()` wraps story beats with:

1. Front cover  
2. Inside cover (free-story promise)  
3. Title  
4. Credits  
5. Recap  
6. **Story pages** (existing beats + expansions + bridges)  
7. End / vote pages (from page-builder)  
8. Character / creature profiles (Codex + card links)  
9. Map  
10. Fake Riftwilds ad  
11. Next-issue teaser  
12. Letters  
13. Back cover  

Capped at 40 pages (trims ads/letters/map first if needed).

## Dialogue system

Kinds: `speech` · `thought` · `narration` · `whisper` · `shout` · `magic` · `telepathy` · `creature` · `sfx` · `caption`

Fantasy SFX lexicon (examples): `KRRRAAAK`, `FWOOOM`, `THRUMMM`, `LEAF-SNAP`, `RIFT-HUMMM` — never proprietary third-party onomatopoeia.

## Canon deep links

Hotspots and cast can carry `ComicCanonLink`:

- World Codex → `/codex/world/[entryId]`
- Riftling Codex → `/codex/riftlings/[speciesSlug]`
- TCG family → `/tcg/codex/[familyId]`
- Card / deck → `/tcg/collection?card=` · `/tcg/deck-builder?highlight=`

Official creatures wired in `canon-links.ts`: Ashwing, Bramblefox (Forest Bond), Mossprig, Thornling.

## Covers

Kinds: standard, variant-a/b, anniversary, foil, animated, founder, seasonal.  
Art may stub to the standard plate; UI + collectibles still list all variants.

## Unlock policy

`ComicUnlockGate`: free · campaign · boss · achievement · event · battle-pass · season · marketplace  

**Hard rule:** core story always includes a `free` gate. Marketplace / founder are cosmetic-only. Never require crypto/SOL to read.

## Progress & offline

- Key: `riftwilds-comics-progress-v1`
- Settings: dark/lamp, contrast, music, SFX, narration VO, **guided reading**, zoom
- Offline: `prefetchIssueOffline()` via Cache API; SW registration TBD (`lib/comics/offline.ts`)

## DB proposal

See `prisma/schema-proposals/comics-publishing.prisma`  
Tables: `comic_series`, `comic_volumes`, `comic_story_arcs`, `comic_issues`, `comic_pages`, `comic_panels`, `comic_dialogue`, `comic_characters`, `comic_creatures`, `comic_rewards`, `comic_reading_progress`.

Do not migrate until explicitly approved.

## Reader UX (publisher-grade)

- Cover open + 3D/crossfade page turns  
- Zoom, fullscreen, thumbs, bookmark, continue  
- Guided panel + bubble focus (Space / Next panel)  
- Hotspot → Codex / card toast links  
- Music + narration toggles (future beds / ElevenLabs)  
- Desktop / tablet / mobile layout via existing comic CSS  

## Studio

`/admin/comics` — usable scaffold: select issue, inspect pages/roles/lettering/covers, stub publish status, browse arcs. Mutations remain local until auth + DB.

## Upgraded vs new

| Upgraded | New |
|----------|-----|
| Types, catalog, reader, library, admin comics page | `publishing-engine.ts`, `story-arcs.ts`, `canon-links.ts` |
| Speech bubbles, page view, progress | Unlock / offline / audio-hooks |
| SERIES docs | `PUBLISHING_ENGINE.md`, prisma proposal |
| Issue #1 Forest Bond showcase + creature cast | Cover variant expansion, front/back matter pipeline |

## Illustrated plates

- Batch composites: `npm run comics:composites -- <slug|--all>`
- Prompt dumps: `npm run comics:prompts -- [slug]`
- Install AI page: `npm run comics:install-page -- <slug> <n> <png>`
- Progress / audit: `npm run comics:progress` · `npm run comics:audit`
- Reader uses `composedPlate` on unique issue plates (full painted page + remapped bubbles)

## Gaps (intentional)

- Continue AI GenerateImage upgrades beyond composites (resume via prompt dumps; rate-limit friendly)  
- Animated/foil cover shaders still stub  
- Server-side progress + Studio mutations  
- Full service worker offline  
- Real music beds / complete VO library  
- Expanding every issue’s *story* beat count beyond current expansions (pipeline ready)

## Local-only

This work stays local. No commit / push / deploy unless explicitly requested.
