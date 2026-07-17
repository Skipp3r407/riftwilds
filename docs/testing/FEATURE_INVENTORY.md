# Riftwilds Feature Inventory

**Audited:** 2026-07-17  
**Environment:** Local production build (`next start` :3002) + prior local Turbopack/dev checks  
**Deployed URL:** NOT FOUND (`riftwilds.io` DNS unresolved; no `.vercel` project; `NEXT_PUBLIC_APP_URL=http://localhost:3000`)  
**Source of truth:** `tests/system-registry.json`, App Router pages, feature flags, live HTTP probes

## Classification legend

| Status | Meaning |
|--------|---------|
| **PASS** | UI/API produced expected result in this audit |
| **PARTIAL** | Works as demo/scaffold; labeled or flagged; not full product |
| **STUB** | Shell/UI only; incomplete authority |
| **OFF** | Feature-flagged off (correct for launch safety) |
| **NOT VERIFIED** | Needs deployed URL / wallet / DB / mainnet |

## Core playable loops

| Feature | Routes / APIs | Status | Evidence |
|---------|---------------|--------|----------|
| Marketing / brand home | `/` → `/about` (first visit) | PASS | Prod 200 after follow; origin-story gate intentional |
| Origin story / About | `/about` | PASS | Smoke + content markers; Elara Venn narrative |
| Play hub | `/play` | PASS | 200 ~64ms prod |
| Dashboard | `/dashboard` | PARTIAL | UI + API; DB may fall back to placeholders |
| Hatchery claim/list/hatch | `/hatchery`, `/api/hatchery/*` | PASS (demo) | Cookie jar: claim→eggs=1→hatch pet OK on prod after Secure-cookie fix |
| Pet care | `/pets/[id]`, care APIs | PARTIAL | Unit + API; in-memory pets |
| Collection | `/collection` | PARTIAL | Shell + demo data |
| Quests | `/quests` | PARTIAL | Demo tracking labeled; catalog present |
| Live World (Phaser shell) | `/live-world` | PARTIAL | Page loads; multiplayer authority still local/stub |
| World map | `/world` | PASS | 200; region art expanding |
| Arena training | `/arena`, `/arena/training` | PARTIAL | Engine unit-tested; ranked/duels OFF |
| Marketplace browse | `/marketplace` | PARTIAL | Demo catalog; `MARKETPLACE_ENABLED=false`, SOL escrow OFF |
| Item shop browse | `/shop/*` | PARTIAL | Catalog large (~562KB HTML); SOL purchases OFF |
| Inventory | `/inventory` | PARTIAL | Demo inventory hooks |
| Rewards center | `/rewards` | PARTIAL | Community treasury framing; claims OFF |
| Treasury | `/treasury` | PARTIAL | Demo buckets; balances N/A until ledger |
| Token / analytics | `/token`, `/analytics/token` | PARTIAL | Awaiting mint; no fabricated reward SOL |
| Ecosystem hub | `/ecosystem` | PARTIAL | Feed + presence stubs |
| Social hub | `/social` | STUB | Explicit stubs |
| Guilds / Homestead | `/guilds`, `/homestead` | STUB / OFF | Flags off |
| Creators | `/creators` | STUB | Scaffold |
| Wallet connect (SIWS) | header / login | PARTIAL | Provider always mounted (SSG fix); **mainnet spend NOT VERIFIED** (no real SOL tests) |
| Admin shell | `/admin/*` | PARTIAL | Redirects without session |

## Money / risk flags (defaults)

| Flag | Default | Audit note |
|------|---------|------------|
| `SOL_PURCHASES_ENABLED` | false | Confirmed |
| `SOL_ITEM_PURCHASES_ENABLED` | false | Confirmed |
| `REAL_SOL_MARKETPLACE_ENABLED` | false | Confirmed |
| `REWARD_CLAIMS_ENABLED` | false | Confirmed |
| `MARKETPLACE_ENABLED` | false | Demo catalog only |
| `PAID_RANDOM_REWARDS_ENABLED` | false | Hard-off |
| Real-value wagering | permanently off | Arena config |

## Persistence honesty

- Hatchery/pets Phase 1: **in-memory** (`globalThis` Maps) — not Prisma Creature/Egg at runtime.
- `/api/ready` returned **503 database down** in local audit → DB integrity **NOT VERIFIED** for production Postgres.

## Not tested / external blockers

- Public production hostname + HTTPS
- Wallet mainnet connect + SIWS against real RPC
- Pump.fun mint / Dexscreener live metrics
- Multiplayer Live World WebSocket authority
- Real SOL checkout / claims (correctly disabled)
