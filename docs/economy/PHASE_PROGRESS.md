# Economy Roadmap — Phase Progress Log

Append-only status after each phase completes.

---

## Phase 0 — Complete project audit (2026-07-18)

**Status:** DONE  
**Deliverables:** `PHASE_0_AUDIT.md`, `MASTER_ECONOMY_ROADMAP.md`, `ARCHITECTURE_MAP.md`, this file.

---

## Phase 1 — Master Economy Core (2026-07-18)

**Status:** DONE  
**Delivered:**
- `src/lib/economy/core/` — SettlementService (`settleCredit` / `settleDebit` / `settleTransfer` / `settleSolIntent`)
- Credits↔lamports pricing helper; `DEMO_CREDITS` → `CREDITS` normalization
- Shop Credits checkout (`SHOP_CREDITS_CHECKOUT_ENABLED`); `/api/shop/purchase`
- Extended faucet/sink reasons for later phases
- Flags: `MASTER_ECONOMY_CORE_ENABLED`, `SOL_SPIRIT_RECALL_ENABLED` (false)
- Tests: `tests/economy/master-economy-core.test.ts`

---

## Phase 2 — Player Marketplace (2026-07-18)

**Status:** DONE  
**Delivered:**
- `src/lib/marketplace/credits-settle.ts` — buyer debit / seller net / fee
- Purchase route settles Credits before marking listing sold
- `MARKETPLACE_WRITES_ENABLED=true` (SOL escrow still 501)
- Tests: `tests/economy/marketplace-credits.test.ts`

---

## Phase 3 — Creator Marketplace (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/creator-marketplace.ts` + `economy/v1` ops `creator.*`  
**Backlog:** Prisma persistence, creator KYC UI

---

## Phase 4 — Land Ownership (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/land.ts` — parcel registry, Credits claim/transfer  
**Backlog:** Prisma LandParcel model, Live World plot visuals

---

## Phase 5 — Housing (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/housing-service.ts` — create / unlock room / furniture Credits sinks  
**Backlog:** Prisma Homestead wiring, Live World homestead flag

---

## Phase 6 — Guild Economy (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/guild-bank.ts` — create, contribute, officer payout + audit  
**Backlog:** Prisma Guild* persistence, invite/join flow

---

## Phase 7 — Riftling Breeding (2026-07-18)

**Status:** DONE (core)  
**Delivered:** Credits fee table; `BREEDING_ENABLED=true`; `/api/breeding/attempt` commits Credits  
**Backlog:** Egg mint + Prisma `BreedingRecord` / supply counters (still `eggMinted: false`)

---

## Phase 8 — Riftling Recovery (2026-07-18)

**Status:** DONE (integrated — no rebuild)  
**Delivered:**
- Integration note: `PHASE_8_SPIRIT_INTEGRATION.md`
- Compatibility facade `/api/spirit/recover` → shipped `src/game/spirit` + canonical `/api/pets/[id]/recovery`
- Does **not** duplicate Spirit Realm / memorials / hardcore
**Canonical:** `/spirit-realm`, `docs/riftlings/*`, pets spirit/recovery/hardcore APIs

---

## Phase 9 — Premium Store (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/premium-store.ts` — Credits SKUs (cosmetics/convenience); SOL path blocked  
**Ops:** `premium.catalog` / `premium.buy` on `/api/economy/v1`

---

## Phase 10 — Season Pass (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/season-pass.ts` — Credits premium unlock, XP tiers, cosmetic claims  
**Backlog:** Season UI track, content reward catalog binding

---

## Phase 11 — Player Shops (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/player-shops.ts` — open / stock / buy with fee  
**Backlog:** Prisma `PlayerBusiness`, inventory lock on list

---

## Phase 12 — Tournament Economy (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/tournament.ts` — Credits entry + prize pool; no real-value wagering  
**Backlog:** Arena match integration, AP entry alternative UI

---

## Phase 13 — Community Events / Rift Storm (2026-07-18)

**Status:** DONE (hook — loyalty owns claims)  
**Delivered:** `rift_storm.treasury_hook` on `/api/economy/v1` pointing at loyalty/storm APIs  
**Note:** Soft Credits path already live in `src/lib/loyalty/*`; `RIFT_STORM_SOL_ENABLED=false`

---

## Phase 14 — Collectibles (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/collectibles.ts` — off-chain badges/titles/cosmetics; NFT flags stay off  
**Backlog:** UI gallery, achievement auto-grants

---

## Phase 15 — SOL Blockchain (2026-07-18)

**Status:** DONE (scaffolding only)  
**Delivered:** `src/lib/economy/sol-adapter.ts` — PaymentIntent dry-run / blocked; no chain writes  
**Invariant:** Credits remain required play path; all `SOL_*` settlement flags default false

---

## Phase 16 — Administration (2026-07-18)

**Status:** DONE (core)  
**Delivered:** `src/lib/economy/admin-ops.ts` — health snapshot, freeze marketplace/shop, audited grant/revoke  
**Wired:** freeze gates on `/api/shop/purchase` + marketplace purchase  
**Ops:** `admin.*` on `/api/economy/v1`

---

## Unified API

`GET/POST /api/economy/v1` — op router for phases 3–16.

## Tests

- `tests/economy/master-economy-core.test.ts`
- `tests/economy/marketplace-credits.test.ts`
- `tests/economy/phases-3-16.test.ts` (28 tests green with shop-purchase unit suite)

## Git

No commit / push / deploy performed.
