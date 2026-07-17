# RIFTWILDS ECOSYSTEM TRANSITION — POST-PUMP.FUN PLATFORM ARCHITECTURE

Pump.fun is the **token launch platform**, not the product forever. After graduation and DEX liquidity, **riftwilds.io** is the primary ecosystem: MMO, community hub, marketplace, and utility layer.

Related: `docs/TEN_YEAR_EXPANSION_PLAN.md`, `docs/MMO_ARCHITECTURE.md`, `docs/REVENUE_ALLOCATION.md`, community rewards / treasury docs.

---

## 1. Framing (non-negotiable)

| Concept | Role |
|---------|------|
| Pump.fun | Launch chapter — bonding curve, early discovery, chart/milestones |
| DEX liquidity | Post-graduation trading venue |
| riftwilds.io | Primary product: play, social, marketplace, rewards, treasury, world |
| $RIFT (token) | Ecosystem **utility currency** — cosmetics, fees, crafting, guilds, housing, arena, eggs, season pass, events, creator purchases |

**Do not** design the site as a Pump.fun clone or chart-first experience. Identity = Steam + Battle.net + RuneScape + Pokémon Home + Discord + OpenSea — not a chart with a game bolted on.

**Rewards honesty:** Buying the launch coin does **not** automatically generate SOL for pet owners. Community Reward Treasury distributions come only from verified, project-controlled deposits (game revenue, marketplace fees, optional creator allocations). Never fabricate reward SOL from token buys.

---

## 2. UX journey

```
Discover token
  → buy on Pump.fun (launch window)
  → graduate + DEX liquidity
  → visit riftwilds.io
  → email / social login (recommended) OR wallet connect
  → holdings recognized when wallet linked
  → create Riftkeeper profile
  → play MMO · use token in ecosystem
```

### Onboarding (required path)

1. **Email or social login first** — newcomers play without wallet friction.
2. **Optional Solana wallet connect later** — unlocks Web3 features (token balance, claims, marketplace SOL, holder-gated cosmetics).
3. Crypto-native users may connect wallet immediately; SIWS remains the wallet auth path.

Modular providers live in `src/lib/auth/providers.ts` + `src/lib/auth/modular-auth.ts`. Wallet SIWS (`src/lib/auth/siws.ts`, `/api/auth/*`) stays intact.

---

## 3. Phases

### Phase L — Launch (Pump.fun primary for token discovery)

- Token mint / Pump.fun page live or pending
- Site emphasizes **Play**, story, hatchery; Pump.fun chart/milestones under Community / Token Launch
- Metrics: bonding-curve fields when applicable; honest empty states until mint

### Phase G — Graduation

- Bonding curve complete; DEX pair exists
- DexScreener (or indexer) becomes primary market source
- Bonding-curve UI demoted or marked N/A
- Treasury + Reward Center remain funded by verified deposits only

### Phase E — Ecosystem Primary (post-grad default IA)

Primary nav destinations:

| Destination | Route | Purpose |
|-------------|-------|---------|
| Play | `/play`, `/live-world`, `/hatchery` | MMO entry |
| Dashboard | `/dashboard` | Player hub |
| World | `/world`, `/restoration` | Regions + civilization restoration |
| Treasury | `/treasury` | Community treasury transparency |
| Rewards | `/rewards` | Claimable / lifetime reward center |
| Market | `/marketplace`, `/shop` | Economy |
| Token | `/token`, `/analytics/token` | Live analytics (utility framing) |
| Community | Pump.fun milestones, social stubs, creator hub | Launch chapter + social |

Pump.fun chart/milestones remain available but are **secondary** — not homepage identity.

---

## 4. Dependency map — Pump vs DEX vs site

| Capability | Pump.fun | DEX / indexer | Site (authoritative) |
|------------|----------|---------------|----------------------|
| Token discovery / buy (launch) | ✓ | — | Link out |
| Post-grad buy/sell | — | ✓ | Deep links + analytics |
| Price / mcap / liquidity / volume | Partial | ✓ | Display only |
| Holders / whales / burns | — | Indexer | Display when wired |
| MMO play, care, hatch, arena | — | — | ✓ |
| Profiles, guilds, housing | — | — | ✓ |
| Marketplace listings | — | Settlements later | ✓ |
| Reward vault claims | — | On-chain later | ✓ (verified deposits) |
| Community treasury ledger | — | Optional sync | ✓ |
| Email / social accounts | — | — | ✓ |

---

## 5. Wallet-optional path

```
[Email / Social] ──► User + AuthIdentity ──► PlayerProfile (Riftkeeper)
       │                                            │
       │ optional                                    ├── Play, quests, soft currency
       ▼                                            ├── Cosmetics (soft / later token)
[SIWS Wallet] ──► Wallet link ──► Token tier, claims, SOL market
```

- Soft-currency and demo loops work without a wallet.
- Real SOL marketplace / claims stay feature-flagged until authority exists.
- Linking a wallet must not wipe account progress (identity merge rules TBD; stubs in modular auth).

---

## 6. Module map (shipped foundations)

| System | Path |
|--------|------|
| Transition doc | `docs/ECOSYSTEM_TRANSITION.md` |
| Feature flags | `src/lib/config/feature-flags.ts` (`ECOSYSTEM_*`, `AUTH_*`, …) |
| Nav IA | `src/lib/config/nav.ts` |
| Modular auth | `src/lib/auth/providers.ts`, `modular-auth.ts` |
| Player dashboard | `/dashboard`, `src/lib/ecosystem/player-dashboard.ts` |
| Token analytics | `/token`, `/analytics/token`, `src/lib/ecosystem/token-analytics.ts` |
| Community treasury | `/treasury`, `src/lib/ecosystem/treasury.ts` |
| Reward center | `/rewards`, `src/lib/ecosystem/reward-center.ts` |
| Global activity | `src/lib/ecosystem/activity-feed.ts`, `/api/activity/feed` |
| Presence stubs | `src/lib/ecosystem/presence.ts`, `/api/presence` |
| Creator hub | `/creators`, `src/lib/ecosystem/creator-hub.ts` |
| Social stubs | `src/game/social/*`, `/social` |
| World restoration | `/restoration` + civilization APIs |
| Marketplace browse categories | `src/lib/marketplace/browse-categories.ts` |
| Admin shells | `/admin/*` ecosystem sections |
| Validate | `scripts/validate/validate-ecosystem.ts` |

---

## 7. Alignment with 10-year plan

- Extend, never replace — Prisma appends, feature flags, registries.
- Entertainment disclaimers on economy / reward surfaces.
- Fail closed on real-money / multiplayer authority features.
- No conflicting “token purchase pays pets” language — see rewards types + revenue disclosures.

---

## 8. Shipped vs deferred

See validate script output and the mission summary in the implementing PR/chat. High-level:

**Shipped (foundations + UI):** architecture doc, modular auth scaffolding, post-grad nav, dashboard / token / treasury / rewards / activity / presence / creators / restoration / social / admin shells, marketplace browse categories, flags, tests.

**Deferred / blocked:** live OAuth providers, authoritative chat/presence WS, holder indexer, on-chain atomic claims, full homestead editor, live guilds.
