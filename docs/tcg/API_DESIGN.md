# Riftwilds TCG — API Design

Base path: `/api/tcg/*`  
Feature flag: `TCG_FRAMEWORK_ENABLED`

## Core (Phase 1–2)

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/tcg/deck` | Catalog + save/load constructed decks (exactly 30 + commander) |
| GET | `/api/tcg/collection` | Binder ownership |
| GET | `/api/tcg/families` | Card family progress for Codex |
| POST | `/api/tcg/match/*` | Practice / invite match loop |

### Deck GET extras (AAA)

- `constructedRules` — 30 cards, copy limits, F2P note
- `formats`, `liveOps`, `facets`, `launchPool`
- Catalog rows include `role`, `defense`, `speed`, `familyId`, `competitiveEligible`

### Deck POST `save`

```json
{
  "action": "save",
  "name": "My Midrange",
  "cardIds": ["…30 ids…"],
  "commanderHeroId": "hero-elara-venn"
}
```

## Economy / live ops (Phase 3 scaffolding)

| Method | Path | Purpose |
|--------|------|---------|
| GET/POST | `/api/tcg/craft` | Quote craft costs (Gold / Shards / Fragments). Execute TBD |
| GET | `/api/tcg/formats` | Format rotation + expansions |
| GET | `/api/tcg/stats` | Collection completion + balance buckets |
| GET | `/api/tcg/live-ops` | Featured cards / season banner |
| GET | `/api/tcg/admin` | Read-only ops snapshot (auth TODO) |

## Craft policy (enforced in docs + code)

```ts
cryptoRequired: false
solRequired: false
wageringAllowed: false
```

Competitive path: soft currencies and/or duplicates only.

## Search facets

Registry facets (also returned from deck GET):

`elements`, `rarities`, `types`, `roles`, `factions`, `regions`, `expansions`, `families`, `unlockMethods`, `keywords`

Client query helper: `queryCards(registry, query)` in `framework/registry.ts`.

## UI routes

| Route | Role |
|-------|------|
| `/tcg/deck-builder` | Constructed atelier |
| `/tcg/collection` | Binder |
| `/tcg/codex` · `/tcg/codex/[familyId]` | Rift Codex |
| `/tcg/museum` | Museum hall |
| `/tcg/battle` | Practice board |
| `/tcg/admin` | Ops scaffold (staff TODO) |

## Auth

Guest cookie owner key for local binder/match. Admin writes must add staff session gate before production.
