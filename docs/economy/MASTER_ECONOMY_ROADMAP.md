# Riftwilds Master Economy Roadmap (Phases 1–16)

**Authority:** Phase 0 audit (`PHASE_0_AUDIT.md`) + architecture map (`ARCHITECTURE_MAP.md`).  
**Player-facing product framing:** `docs/vision/PRODUCT_ECONOMY_ROADMAP.md` · public `/roadmap`.  
**Invariant:** Credits = required play currency. SOL never required for basic play. Optional SOL is treasury-safe and feature-flagged. No “buy coin → pet SOL.”

---

## Architecture standardization (recommendations)

| Topic | Recommendation |
|-------|----------------|
| Module home | `src/lib/economy/core/` — SettlementService, adapters, types; keep domain helpers in `marketplace/`, `shop/`, `credits/`, `loyalty/`, `spirit` |
| Naming | Use `CREDITS` everywhere in new APIs; deprecate `DEMO_CREDITS` as alias = Credits; never call Credits “SOL” |
| Money pattern | All durable spends/grants go through SettlementService with `requestId` idempotency |
| Ownership | Verify seller owns asset → lock → settle → transfer; reuse marketplace integrity helpers |
| Reuse | Extend `src/lib/credits/*`, marketplace fee-policy, loyalty store, spirit recovery-service — do not rebuild |
| SOL | Only via SolAdapter + PaymentIntent when flags on; default path always Credits |

---

## Phase 1 — Master Economy Core

| Field | Detail |
|-------|--------|
| **Goal** | Unified settlement facade; Credits adapter as sole required play money; SOL/loyalty/AP adapters; currency naming cleanup; shop Credits method; define missing spirit SOL flag (default off) |
| **Depends on** | Phase 0 |
| **Building blocks** | `src/lib/credits/*`, feature flags, Prisma `CurrencyLedger` |
| **Complexity** | M |
| **Risks** | Dual demoCredits drift; thrashing loyalty/spirit WIP |
| **Acceptance** | SettlementService credits/debits with idempotency; shop can price/pay Credits; `SOL_SPIRIT_RECALL_ENABLED` exists default false; tests for core settle; docs updated |

## Phase 2 — Player Marketplace

| Field | Detail |
|-------|--------|
| **Goal** | List/buy/cancel pets/eggs/items in Credits with ledger settlement + fee burn/treasury; Prisma optional persistence |
| **Depends on** | Phase 1 |
| **Building blocks** | `src/lib/marketplace/*`, listing APIs, fee BPS, integrity |
| **Complexity** | L |
| **Risks** | Memory vs Prisma dual store; wash trade stubs |
| **Acceptance** | Purchase debits buyer Credits, credits seller net, applies fee; writes gated but demo_credits path complete; SOL still 501 |

## Phase 3 — Creator Marketplace

| Field | Detail |
|-------|--------|
| **Goal** | Creator/cosmetic listings with transparent creator fee split in Credits |
| **Depends on** | Phase 2 |
| **Building blocks** | Fee policy, revenue allocation, marketplace categories |
| **Complexity** | M |
| **Risks** | Creator KYC/legal; overpromising real SOL splits |
| **Acceptance** | Creator listing kind + Credits split recorded; flags for real money remain off |

## Phase 4 — Land Ownership

| Field | Detail |
|-------|--------|
| **Goal** | Land parcels claimable/purchasable with Credits; browse in marketplace category |
| **Depends on** | Phase 1–2 |
| **Building blocks** | Marketplace PROPERTY category, region keys |
| **Complexity** | M |
| **Risks** | Scope creep into full housing |
| **Acceptance** | Parcel registry + Credits claim/transfer; no SOL required |

## Phase 5 — Housing

| Field | Detail |
|-------|--------|
| **Goal** | Homestead create/upgrade/furniture via Credits sinks; wire Prisma Homestead* |
| **Depends on** | Phase 4 optional, Phase 1 required |
| **Building blocks** | `src/game/housing/*`, housing catalog API, `spendHousing` |
| **Complexity** | L |
| **Risks** | Live World homestead flag off — keep server economy independent |
| **Acceptance** | Create homestead + buy furniture with Credits; persistence when User exists |

## Phase 6 — Guild Economy

| Field | Detail |
|-------|--------|
| **Goal** | Guild bank Credits contribute/withdraw (role-gated); dues optional |
| **Depends on** | Phase 1 |
| **Building blocks** | Prisma Guild*, guilds page shell |
| **Complexity** | M |
| **Risks** | Griefing / theft — role + audit log |
| **Acceptance** | Create guild, contribute Credits, officer spend with audit |

## Phase 7 — Riftling Breeding

| Field | Detail |
|-------|--------|
| **Goal** | Breeding attempt with Credits fee (not SOL-required); mint egg when enabled |
| **Depends on** | Phase 1, hatchery |
| **Building blocks** | breeding APIs, `BreedingRecord`, egg supply |
| **Complexity** | L |
| **Risks** | Genetics imbalance; SOL fee gate today |
| **Acceptance** | Eligibility + Credits fee + egg mint path behind `BREEDING_ENABLED`; SOL fee optional only |

## Phase 8 — Riftling Recovery

| Field | Detail |
|-------|--------|
| **Goal** | Wire Spirit recovery to API/UI; Credits/loyalty sinks; integrate shop recovery SKUs; no duplicate Spirit engine |
| **Depends on** | Phase 1; coordinate Spirit agent |
| **Building blocks** | `src/game/spirit/*`, care sinks, shop recovery |
| **Complexity** | L |
| **Risks** | Overlap with in-flight Spirit agent |
| **Acceptance** | `/api/spirit/recover` (or pets recovery) settles Credits; SOL recall flag off; memorial path intact |

## Phase 9 — Premium Store

| Field | Detail |
|-------|--------|
| **Goal** | Premium cosmetics/convenience SKUs priced in Credits; optional Wallet SOL behind flags |
| **Depends on** | Phase 1, shop |
| **Building blocks** | shop catalog, purchase.ts, PaymentIntent models |
| **Complexity** | M |
| **Risks** | Pay-to-win — cosmetics/convenience only |
| **Acceptance** | Server Credits checkout for premium SKUs; SOL path still flagged |

## Phase 10 — Season Pass

| Field | Detail |
|-------|--------|
| **Goal** | Seasonal track with free + Credits premium track; cosmetic rewards |
| **Depends on** | Phase 1, Season model |
| **Building blocks** | Season, quests, loyalty milestones |
| **Complexity** | L |
| **Risks** | Confusion with ArenaSeason |
| **Acceptance** | Pass progress + Credits unlock; no SOL required |

## Phase 11 — Player Shops

| Field | Detail |
|-------|--------|
| **Goal** | PlayerBusiness shopfront listing inventory for Credits |
| **Depends on** | Phase 2 |
| **Building blocks** | `PlayerBusiness`, marketplace |
| **Complexity** | M |
| **Risks** | Tax/fee abuse |
| **Acceptance** | Open shop, list item, buy with Credits + fee |

## Phase 12 — Tournament Economy

| Field | Detail |
|-------|--------|
| **Goal** | Entry fees in Credits or AP; prize pool Credits; no real-value wagering |
| **Depends on** | Phase 1, Arena |
| **Building blocks** | Arena, tournaments shell, ArenaPointLedger |
| **Complexity** | M |
| **Risks** | Must never enable real-value wagering |
| **Acceptance** | Register with Credits/AP; payout Credits; `REAL_VALUE_WAGERING` remains impossible |

## Phase 13 — Community Events / Rift Storm

| Field | Detail |
|-------|--------|
| **Goal** | Event sinks/faucets + Rift Storm soft rewards; optional SOL promo still off |
| **Depends on** | Phase 1; loyalty in-flight |
| **Building blocks** | loyalty Rift Storm, CommunityEvent, restoration donate |
| **Complexity** | M |
| **Risks** | Double-grant with loyalty agent |
| **Acceptance** | Storm claim → Credits; treasury metrics hook; SOL storm remains flagged |

## Phase 14 — Collectibles

| Field | Detail |
|-------|--------|
| **Goal** | Off-chain collectible registry (badges, titles, cosmetics) earn/buy with Credits |
| **Depends on** | Phase 1, 9 |
| **Building blocks** | inventory categories, achievements |
| **Complexity** | M |
| **Risks** | Premature NFT mint |
| **Acceptance** | Collectible grant/buy Credits; `ONCHAIN_COLLECTIBLES_ENABLED` stays false |

## Phase 15 — SOL Blockchain

| Field | Detail |
|-------|--------|
| **Goal** | Treasury-safe PaymentIntent verify scaffolding; escrow interface; all flags default off; play never requires SOL |
| **Depends on** | Phases 1–2, 9 |
| **Building blocks** | solana lib, PaymentIntent, revenue allocation |
| **Complexity** | XL |
| **Risks** | Legal, security, false “live” UX |
| **Acceptance** | Documented adapter + dry-run verify; flags off; Credits play path unchanged |

## Phase 16 — Administration

| Field | Detail |
|-------|--------|
| **Goal** | Admin economy health, faucet/sink config view, freeze listings, grant/revoke with audit |
| **Depends on** | Phases 1–15 cores |
| **Building blocks** | admin/economy shells, AuditLog, AdminAction |
| **Complexity** | M |
| **Risks** | God-mode abuse — require reason + audit |
| **Acceptance** | Admin can inspect ledger health, pause marketplace, audited grant; no auto extreme tuning |

---

## Sequencing note

Execute **sequentially** 1→16. After each phase append `PHASE_PROGRESS.md`. Prefer production core + honest backlog over placeholders. Coordinate Spirit/loyalty/equipment — extend, don’t thrash.
