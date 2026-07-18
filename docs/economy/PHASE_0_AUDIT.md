# Phase 0 — Full Project Economy Audit

**Date:** 2026-07-18  
**Scope:** Inspect-only audit + architecture map. No Phase 1+ code in this document.  
**Hard rules:** Credits = play currency; SOL never required for basic play; no “buy coin → pet SOL.”

---

## Current state summary

Riftwilds already has a **working Credits soft-currency core** (`src/lib/credits/`) with faucets, sinks, idempotent ledger, optional Prisma sync, Live World wiring, hatchery premium eggs priced in Credits, and loyalty/Rift Storm soft rewards. Marketplace, shop SOL checkout, breeding settlement, guilds, housing persistence, land, season pass, player shops, tournaments, and on-chain collectibles are **scaffolded or flag-gated stubs**. Parallel agents shipped **Spirit Recovery** (`src/game/spirit/**`, `/spirit-realm`, pets recovery APIs, `docs/riftlings/*`), **loyalty/Rift Storm**, and **equipment** — Phase 8 integrates Spirit; do not thrash.

---

## Folder structure (economy-relevant)

| Area | Path | Role |
|------|------|------|
| App routes | `src/app/(game)/{shop,marketplace,hatchery,homestead,guilds,rewards,loyalty,arena}` | Player surfaces |
| Marketing | `src/app/(marketing)/{economy,treasury,token}` | Public flywheel / treasury framing |
| Admin | `src/app/admin/{economy,marketplace,treasury,rewards,guilds}` | Control shells |
| Credits | `src/lib/credits/` | Authoritative integer ledger |
| Marketplace lib | `src/lib/marketplace/` | Demo listings, fees, integrity |
| Shop lib | `src/lib/shop/` | Purchase resolution, earned-SOL local |
| Economy lib | `src/lib/economy/` | Egg supply, breeding rules (thin) |
| Game economy | `src/game/economy/` | Flywheel, treasury math, epoch planner |
| Spirit | `src/game/spirit/` | Life/recovery economy (in-memory; weak HTTP) |
| Loyalty | `src/lib/loyalty/` | Streaks, airdrops, Loyalty Shop, Rift Storm |
| Equipment | `src/lib/equipment/` | Loadouts / ownership (not payment) |
| Solana | `src/lib/solana/`, `src/lib/market/sol-price.ts` | Wallet auth + price; no escrow |
| Prisma | `prisma/schema.prisma` | Full economy schema (many shells unused by APIs) |
| Docs | `docs/economy/*`, `docs/ECONOMY_LOOP.md`, `docs/MARKETPLACE_ECONOMY.md`, `docs/ITEM_ECONOMY.md`, `docs/REVENUE_ALLOCATION.md` | Prior design |

---

## Database / Prisma (economy-relevant)

**Live / near-live mappings**

- `User`, `Wallet`, `Session`, `PlayerProfile` (`softCurrency`, `demoCredits`)
- `CurrencyLedger`, `RewardLedger`, `IdempotencyKey`
- `Egg`, `Creature`, `InventoryItem`, `ItemTransaction`, `InventoryLedger`
- `MarketplaceListing`, `MarketplaceSale`, fee/cooldown helpers (schema present; **API writes mostly in-memory**)
- `PaymentIntent`, `ItemPurchase`, `ItemPriceVersion` (SOL shop — flagged off)
- Treasury: `TreasuryWallet`, `RevenueDeposit`, `AllocationPolicy*`, `RewardEpoch`, `PetRewardClaim`
- Arena: `ArenaPointLedger` (non-transferable points)
- Shells: `Guild*`, `Homestead*`, `BreedingRecord`, `PlayerBusiness`, `CommunityEvent`, `Season`

**Gaps:** No first-class LandParcel model; Season Pass not modeled beyond revenue policy keys; Spirit recovery not persisted.

---

## Frontend routes & UI

| Route | Status |
|-------|--------|
| `/shop/*` | Browse live; payment = In-game SOL local / Wallet SOL gated off |
| `/marketplace` | Demo catalog; writes default off |
| `/hatchery` | Free claim + Credits premium egg |
| `/economy`, `/economy/credits` | Public + Credits dashboard |
| `/treasury`, `/rewards` | Ecosystem framing |
| `/loyalty` | Live soft loyalty surfaces |
| `/homestead`, `/guilds` | Shells |
| `/arena/tournaments` | Shell |
| Admin economy / marketplace / treasury | Control shells |

---

## Backend API routes (economy)

| Group | Routes | Notes |
|-------|--------|-------|
| Credits | `/api/credits/{balance,transact,health}` | Authoritative |
| Economy actions | `/api/economy/credits-action`, flywheel, policy, treasury-metrics, revenue-allocation, reward-vault | Live + shells |
| Marketplace | listings, purchase, cancel, rules, supply, price-history | Demo memory; SOL → 501 |
| Hatchery | eggs, claim, purchase, hatch | Credits purchase path |
| Shop | catalog | Browse |
| Pets | care, equipment, rewards | Care spends Credits |
| Loyalty | status, check-in, claim, activity, shop, storm* | Soft rewards → Credits |
| Breeding | rules, eligibility, attempt | Preview-only (`BREEDING_ENABLED=false`) |
| Housing | catalog | Read-only catalog |
| Token / market | balance, sol-price, token-price | Analytics / gates |
| Inventory | grant | Care/equipment adjacent |

---

## Multiplayer / Live World bridge

- Phaser Live World is **local-authoritative** movement with multiplayer hooks.
- Credits: NPC shop / quests mirror via `sync-pending` / `mirrorCreditsBalance` into server ledger.
- Inventory/equipment sync via pet equipment APIs.
- Homesteads/guilds Live World flags **off**.
- Economy state that must stay server-authoritative: Credits, marketplace sales, hatchery, loyalty claims.

---

## Credits ledger / faucets / sinks

**Exists:** Integer ledger, starter grant, quest/job/event/gather/craft/achievement/riftling faucets, NPC shop, repair, travel, housing, restoration, craft, marketplace fees, care, egg purchase sinks. Health alerts; AI cannot grant.

**Debt:** `demoCredits` (Live World play-state) vs ledger vs `PlayerProfile.softCurrency` naming triad; guest keepers memory-only without User row.

---

## Wallet / SOL status

| Flag | Default | Meaning |
|------|---------|---------|
| `SOL_PURCHASES_ENABLED` | false | Master SOL settlement |
| `SOL_ITEM_PURCHASES_ENABLED` | false | Shop wallet checkout |
| `REAL_SOL_MARKETPLACE_ENABLED` | false | Marketplace escrow |
| `RIFT_STORM_SOL_ENABLED` | false | Promo storm SOL |
| `ONCHAIN_*` / `AUTOMATIC_SETTLEMENT_*` | false | Chain settlement |
| `AUTH_WALLET_SIWS_ENABLED` | true | Login only |
| `AUTH_WALLET_OPTIONAL_PLAY` | true | Play without wallet |

Wallet stack exists for SIWS; **no real escrow/programs**. Shop “In-game SOL” is localStorage-style earned balance — not chain.

---

## Inventory, marketplace, shop, hatchery

- Inventory + equipment ownership: substantive.
- Marketplace: demo listings; Prisma unused by write path; Credits fee helpers exist; purchases do not yet debit Credits ledger.
- Shop: SOL-priced UX; Credits path missing as first-class method.
- Hatchery premium: **Credits** (`EGG_PURCHASE` sink) — correct pattern.

---

## Combat rewards, loyalty, equipment

- Arena Points: earn-only, non-transferable.
- Loyalty / Rift Storm: enabled soft path; SOL storm off.
- Equipment: ownership APIs + tests; not a payment system.
- Spirit recovery: rich in-memory service; missing `SOL_SPIRIT_RECALL_ENABLED` flag definition; weak HTTP/UI.

---

## Dependencies (highlights)

Next 16, React 19, Prisma 6 / PostgreSQL, Phaser 3, Solana web3 + wallet adapters, Zod, Zustand, Vitest, Playwright. Economy sims: `simulate:credits`, `simulate:economy`, `test:economy`, `test:credits`, `test:marketplace`.

---

## Duplicate / dead / stub risks

1. DEMO_CREDITS listings vs CREDITS currency constant  
2. earned-SOL shop vs Credits hatchery  
3. Marketplace Prisma vs in-memory catalog  
4. `economyDefaults` vs `featureFlagDefaults` dual configs  
5. Spirit recovery isolated from APIs  
6. Epoch / holder reward providers flagged off with TODOs  
7. Flywheel stage statuses lag Credits “phases 2–28 done” narrative  

---

## Technical debt blocking Phases 1–16

1. No single **settlement / money facade**  
2. Marketplace not wired to Credits ledger  
3. Shop not Credits-first  
4. Spirit / shop / care “recovery” vocabulary collision  
5. Persistence optional and User-gated  
6. Land / season pass / player shops / tournaments = shells  
7. SOL paths must stay flagged; any enable needs treasury-safe escrow  

---

## Gaps (priority)

| Gap | Blocks |
|-----|--------|
| Master economy facade + currency adapters | Phase 1 |
| Marketplace Credits settlement | Phase 2 |
| Creator fee / listing path | Phase 3 |
| Land model + Credits claim | Phase 4 |
| Homestead Credits persistence | Phase 5 |
| Guild bank Credits | Phase 6 |
| Breeding Credits fees (no SOL-required) | Phase 7 |
| Spirit API + Credits integration | Phase 8 |
| Premium store Credits SKUs | Phase 9 |
| Season pass model | Phase 10 |
| PlayerBusiness shops | Phase 11 |
| Tournament entry economy | Phase 12 |
| Storm/events treasury hooks | Phase 13 |
| Off-chain collectibles registry | Phase 14 |
| SOL escrow scaffolding (flags off) | Phase 15 |
| Admin economy ops | Phase 16 |

---

## Security concerns

- Client-only shop settlement (earned SOL) can be spoofed — must move durable buys to server Credits/SOL intents.  
- Marketplace purchase path does not debit Credits today.  
- Idempotency partially in-memory.  
- Never enable real SOL without audited escrow + disclosure.  
- AI NPC must remain unable to grant Credits.  
- Wash-trade heuristics are stubs.  

---

## Recommended Phase 1 entry criteria

1. Phase 0 docs accepted (this file + roadmap + architecture map).  
2. Do not thrash loyalty/spirit/equipment WIP.  
3. Phase 1 delivers a **Master Economy Core** facade: Credits as sole required play currency; SOL optional adapters behind flags; naming cleanup; shop Credits method; missing spirit flag defined.  

---

## Changed files this phase (docs)

- `docs/economy/PHASE_0_AUDIT.md` (this file)  
- `docs/economy/MASTER_ECONOMY_ROADMAP.md`  
- `docs/economy/ARCHITECTURE_MAP.md`  
- `docs/economy/PHASE_PROGRESS.md`  

No application code in Phase 0.
