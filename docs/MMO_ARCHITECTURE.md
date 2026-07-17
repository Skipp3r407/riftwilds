# Riftwilds Browser MMO — Architecture Report & Roadmap

Produced after inspecting the existing repository. Preserve working systems; extend in phases.

**Decade expansion:** see `docs/TEN_YEAR_EXPANSION_PLAN.md` for living-world clock, story engine, civilization restoration, achievements, expeditions, housing, festivals, genetics 2.0, Archivist, and expansion-pack architecture.

---

## 1. Existing project architecture

Next.js 16 App Router monolith with:

| Layer | Location |
|-------|----------|
| Routes | `src/app/(marketing)`, `(game)`, `admin`, `api` |
| UI | `src/components/{arena,economy,items,revenue,marketing,wallet,game}` |
| Pure game logic | `src/game/{arena,combat,creatures,economy,randomness}` |
| Config | `src/lib/config/*` |
| Auth / Solana | `src/lib/auth`, `src/lib/solana` |
| Item + revenue catalogs | `src/lib/items`, `src/lib/revenue` |
| Prisma | `prisma/schema.prisma` (large domain schema) |
| Art | `asset-prompts/`, `public/assets/`, `scripts/assets/` |

---

## 2. Current routes

**Marketing:** `/`, `/creatures`, `/docs`, `/fairness`, `/token`, `/transparency`, `/economy`, `/economy/policies`, `/legal/*`  
**Game:** `/play`, `/hatchery`, `/world`, `/collection`, `/creature/[id]`, `/inventory`, `/marketplace`, `/shop/*`, `/arena/*`, `/pets/*/loadout`, `/quests`, `/leaderboards`, `/memorials`  
**Admin:** `/admin`, `/admin/{arena,items,economy,assets,...}`  
**API:** auth, token balance, shop catalog, arena training, economy, transparency  

---

## 3. Current database models

Present across: User/Wallet/Session, Egg/Creature/Care, Items/Crafting, Regions/Encounters, Battles, Quests, Marketplace, Treasury/Reward epochs, Arena, Payment intents, Revenue allocation, Feature flags, Audit.  
Gaps for later phases: Guild*, Homestead*, FarmPlot, PetJob, WorldBoss*, Habitat*, BreedingRecord, PetMemory, CommunityVote, PlayerBusiness (to be appended as phases unlock).

---

## 4. Current authentication

SIWS: `GET /api/auth/nonce` → wallet `signMessage` → `POST /api/auth/verify` → HTTP-only session cookie → `getSessionContext()`. Roles via `src/lib/security/authorization.ts`.

---

## 5. Current Solana integration

Wallet Adapter (Phantom/Solflare), RPC helper, SPL token balance → tiers, lamport pricing, payment intent models. Live SOL checkout and atomic program splits remain flagged off.

---

## 6. Current art assets

Style guides + prompts for creatures/eggs/weapons/armor/potions/abilities/materials. SVG placeholder generators. Admin sprite inspector / equipment aligner. Phaser package not installed (helpers only).

---

## 7. Missing dependencies

Not in `package.json` yet: Redis/Upstash client, Phaser 3, WebSocket server, job queue (BullMQ). Env stubs exist for Redis. Realtime must run outside pure serverless.

---

## 8. Proposed architecture

```
Browser (Next.js UI + Phaser Live World client)
    │ REST / WS
    ▼
API layer (Next.js) — auth, shop, hatch, care, marketplace intents
    │
    ├── Authoritative battle service (dedicated process, Phase 3+)
    ├── Live World service (WebSocket + Redis, Phase 4)
    └── Postgres (Prisma) + Redis (queues, presence, rate limits)
            │
            └── Settlement / epoch jobs (worker)
```

---

## 9. Database migration strategy

Append-only Prisma models; never rewrite financial ledger rows. Soft-launch flags. Seed expands species toward 50+ over Phase 1–2. Use `db push` / migrations per environment.

---

## 10. Realtime-service architecture

Dedicated Node host (Fly/Railway/ECS): Habitat instances, pet presence, emotes, events. Redis for room state + pub/sub. Next.js proxies auth; never simulates authoritative multiplayer inside Vercel functions alone.

---

## 11. Financial architecture

Collection vault → verified payment → `AllocationLedgerEntry` (Strategy A ledger) → batch settlement. Shop 70/15/10/5, marketplace 90/5/3/1/1. Epoch accrual for holders; pull claims later. Lamports only.

---

## 12. Security threat model

Ownership spoofing, fake browser payments, replay, race listings, win-trading, bot farms, rate abuse. Mitigations: server ownership, finalized tx verify, idempotency, ranked anti-cheat signals, admin audit, emergency pauses.

---

## 13. Asset-generation plan

Continue `asset-prompts/*` + `scripts/assets/generate-*-placeholders.ts`. Species expansion prompts first; then homes/furniture/bosses. CDN + atlases before Live World launch.

---

## 14. Performance plan

Route splitting, lazy Phaser, sprite atlases, WebP/AVIF, viewport culling, Redis presence, graphics quality tiers, homepage &lt;3s target on broadband.

---

## 15. Implementation roadmap

| Phase | Focus | Status |
|-------|--------|--------|
| 1 | Auth, eggs, care, inventory, catalogs, nav, admin | **In progress** |
| 2 | Exploration, quests, gathering, crafting, evolution, genetics | Planned |
| 3 | Arena expansion, gear live, AI/PvP | Partial (training) |
| 4 | Live World multiplayer service | Phase 1 playable local demo shipped — see `docs/LIVE_WORLD_PLAYABLE.md` |
| 5 | Marketplace + SOL + revenue + epochs | Partial (browse/policies) |
| 6 | Guilds, homesteads, farms, businesses, bosses | Stubs |
| 7 | Breeding, tournaments, seasons | Planned |
| 8 | Audit + mainnet | Planned |

---

## Phase 1 checklist

- [x] Architecture report (this file)
- [x] Identity + primary navigation (`Riftwilds`, World vs Live World)
- [x] Egg dashboard + claim/hatch demo APIs (`/api/hatchery/*`)
- [x] Pet care authoritative helpers + API (`/api/pets/*`)
- [x] Profile + pet memory timeline (demo store)
- [x] Guilds + Homestead shells
- [x] 50 launch species catalog (TS)
- [x] MMO feature flags + Prisma shells (Guild, Homestead, PetMemory, …)
- [x] Admin foundation links
- [x] Automated tests (care, hatch, ownership)
- [ ] Prisma migrate/push in each environment
- [ ] Persist eggs/pets to Postgres (replace in-memory store)
