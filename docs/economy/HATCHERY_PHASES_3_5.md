# Hatchery / Creature Loop — Phases 3–5 (Scaffold)

Phases 1–2 (starter, earn eggs, hatch, companion↔card, cosmetic perk config) are the live focus.  
Phases 3–5 are **documented + light scaffolds only** — not full production systems.

## Phase 3 — Guilds & shared egg goals

- Guild bank / community goals can unlock shared egg drops (`EGG_EARN_PATHS.GUILD`).
- Flag: `GUILDS_ENABLED` / `LIVE_WORLD_GUILDS_ENABLED` remain **false** until product ready.
- Scaffold: earn path + `/api/hatchery/earn` path `GUILD` accepted; no live guild ledger yet.

## Phase 4 — Housing / habitat companion display

- Homestead + player housing show hatched companions as cosmetic residents.
- Flags: `HOMESTEADS_ENABLED`, `PLAYER_HOUSING_ENABLED` (housing exists; egg display hooks deferred).
- No competitive power from furniture or habitat cosmetics.

## Phase 5 — Competitive blockchain mirrors (optional)

- Optional on-chain mirrors for collectible editions / cosmetics only.
- Flags stay **false**: `NFT_MINTING_ENABLED`, `SOL_MINTING_ENABLED`, `ONCHAIN_COLLECTIBLES_ENABLED`.
- Never required for hatch, battle, or Codex.
- No guaranteed earnings framing.

## Scaffold module

`src/game/eggs/phase-scaffolds.ts` — typed stubs for guild egg goals, habitat display hooks, and optional mirror intents.
