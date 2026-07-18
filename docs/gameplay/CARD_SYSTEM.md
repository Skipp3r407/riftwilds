# Card System — Engine Overview (Reborn)

**Canonical content rules:** [docs/tcg/CARD_SYSTEM.md](../tcg/CARD_SYSTEM.md)  
**Foundational set:** [docs/tcg/FOUNDATIONAL_SET.md](../tcg/FOUNDATIONAL_SET.md)  
**Data:** `src/content/tcg/` · **Runtime:** `src/game/tcg/`

## Split of responsibility

| Layer | Owns |
|-------|------|
| `@/content/tcg` | Cards, keywords, heroes, decks, Rift Energy constants, art prompts |
| `@/game/tcg` | Match engine, stores, Live World encounter bridge, content→engine adapter |

Do **not** maintain a second card list generated only from species kits. Species kits remain the living-pet RPG source; content cards already link via `riftlingSlug`.

## Rift Energy

Loaded from `TCG_BUNDLE.riftEnergy` (start 1, +1/turn, cap 10). Not Arena combat energy / Rift Burst.

## Playable surfaces (Phase 1 launch — TCG-first)

- `/tcg/battle` — primary combat  
- `/tcg/collection` — binder / decks  
- `/play` — TCG-first hub  
- `/api/tcg/match/*`, `/api/tcg/collection`  
- Live World encounter → TCG when public Living World opens + `TCG_WORLD_ENCOUNTERS_ENABLED`

## Soft-secondary / future

- Arena pet battler (`/arena`) — practice; affinities/kits/rewards reused, not deleted.  
- Live World (`/live-world`) — enterable during development; optional Coming Soon via `LIVE_WORLD_PUBLIC_ACCESS_ENABLED=false`.
