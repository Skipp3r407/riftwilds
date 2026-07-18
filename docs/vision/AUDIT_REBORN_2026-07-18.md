# Riftwilds Reborn — Audit Findings (2026-07-18)

## Stack

- Next.js 16 + React 19 + Phaser 3 Live World  
- Prisma models prepared for arena/quests/housing; many hot paths still in-memory  
- Credits ledger authoritative; SOL flags default off  
- Original species kits + affinity chart; third-party assets gated  

## Reusable systems (do not rebuild)

| Pillar | Key paths |
|--------|-----------|
| Live World | `src/game/live-world/`, `BlueprintRegionScene`, `LiveWorldBridge` |
| Maps / travel | `src/game/world-maps/`, `world-travel/`, `world-exploration/` |
| Arena (secondary) | `src/game/arena/`, affinities, kits, AP rewards |
| Pets / Riftlings | `src/game/creatures/`, hatchery, genetics, spirit |
| Quests | `src/game/quests/`, quest-map-bridge |
| Economy | `src/lib/credits/`, `src/lib/economy/`, marketplace |
| Housing | `src/lib/housing/`, neighborhoods, world-expansion |
| Social | friends/PM, social-presence, emotes |
| Auth | SIWS + wallet-optional play |

## Gaps filled this session (Phase 1 start)

- Foundational **content pack already present** (`src/content/tcg/`, ~120 cards) — engine adapts it (no duplicate catalog)  
- Playable match loop → `src/game/tcg/` + `/tcg/battle`  
- World encounters did not open battles → TCG handoff via `pve-stub` + flags  
- Vision docs for Reborn pillars under `docs/vision/` + gameplay/economy/npc/housing/riftlings  
- Cross-link `docs/tcg/*` content pipeline with runtime engine

## Soft-deprecated (not deleted)

- Instant Live World “Training clash resolved” demo (`LIVE_WORLD_LEGACY_INSTANT_COMBAT_ENABLED`)  
- Live World as **launch** primary product — enterable in development (`LIVE_WORLD_PUBLIC_ACCESS_ENABLED` default on); TCG / Rift Battles is Phase 1  
- Arena as primary combat UX (still playable at `/arena`)  

## Asset / IP gate

Kenmi / unlicensed packs remain restricted — see `docs/assets/THIRD_PARTY_ASSET_POLICY.md`.
