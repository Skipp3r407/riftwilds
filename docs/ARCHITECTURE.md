# Project Hatch — Architecture Plan (Phase 0)

## 1. Architecture summary

Monolithic **Next.js 16 App Router** app with TypeScript strict mode. Server Route Handlers own all valuable game outcomes (hatch, care, battles, marketplace, token gating). Client owns presentation, Phaser scenes (later), and wallet signing. PostgreSQL via Prisma is the source of truth for ownership and ledgers. Solana is used for wallet auth (SIWS) and SPL token balance verification only in MVP — no custodial keys, no real-money escrow until audited.

Layers: `app/` (routes) → `components/` (UI) → `lib/` (auth, db, solana, security) → `game/` (pure formulas) → Prisma.

## 2. Implementation checklist

- [x] Repo audit (empty → initialize)
- [x] Centralized config + feature flags
- [x] Prisma schema (full domain model)
- [x] Seed data (18 species, affinities, items, quests…)
- [x] SIWS auth + session cookies
- [x] Token balance verification service
- [x] Landing page + marketing shell
- [x] Game dashboard shell
- [x] Admin shell
- [x] Legal/risk placeholders
- [x] Unit tests (odds, damage, care, tiers)
- [x] README + env docs
- [ ] Phase 2: Hatchery
- [ ] Phase 3: Care / progression
- [ ] Phase 4: Phaser exploration
- [ ] Phase 5: Battles
- [ ] Phase 6: Marketplace / social
- [ ] Phase 7: Production hardening

## 3. Folder structure

See repository root. Key roots: `src/app`, `src/components`, `src/game`, `src/lib`, `prisma`, `public/assets`, `docs`, `tests`.

## 4. Database ER summary

`User` 1—N `Wallet` / `Session` / `Egg` / `Creature` / ledgers.  
`CreatureSpecies` N—1 `Affinity`, 1—N `EvolutionRule`, abilities via `SpeciesAbility`.  
`Egg` → `HatchAttempt` → `Creature`.  
`Battle` → participants/turns/events.  
`MarketplaceListing` → `MarketplaceSale` with `CurrencyLedger`.  
`FeatureFlag` / `GameSetting` / `OddsVersion` / `AuditLog` for ops.

## 5. Security threat model

| Threat | Mitigation |
|--------|------------|
| Client-forged hatch/battle/rewards | Server-authoritative RNG + validation |
| Signature replay | Single-use nonce + expiry |
| Session theft | HTTP-only SameSite cookies, hashed tokens |
| Token balance spoof | Server RPC only |
| Duplicate claims | Unique constraints + idempotency keys |
| Admin abuse | Role checks + audit logs with reason |
| XSS in tributes/names | Sanitize + moderation |
| RPC key leak | Server-only env, public RPC separate |
| Wash trading | Flags, limits, admin review (later) |

## 6. Game economy risk assessment

MVP uses **demo credits** and non-cash rewards. `REAL_MONEY_REWARDS_ENABLED` and `REAL_SOL_MARKETPLACE_ENABLED` default **false**. Token holdings unlock access/cosmetics only — no guaranteed profit claims. Permanent death disabled. Future SOL escrow requires audit + legal review.

## 7. Environment variables

See `.env.example`.

## 8. External services

Neon/Supabase Postgres · Helius RPC (optional) · Upstash Redis (optional) · Cloudflare R2/Supabase Storage (optional) · Vercel · Sentry (optional) · Pump.fun (link only, no private API).

## 9. Feature flag defaults

Risky flags off. See `src/lib/config/feature-flags.ts`.

## 10. MVP vs later

**MVP (Phases 1–3):** auth, token gate, landing, hatchery, care, collection, transparency.  
**Later:** Phaser world, battles, PvP, marketplace demo, boss, crafting, breeding research, on-chain settlement, NFT mint.

## 11. Asset requirements

Pixel/illustrated egg, 18+ Riftling art sets, map tiles for 2 regions, UI icons, affinity icons, battle VFX placeholders, PWA icons, audio stubs.

## 12. Open questions / assumptions

- Token mint/decimals TBD (`COMING_SOON`).
- Tier thresholds in base units assume 6 decimals until mint known.
- Demo mode operable without live RPC when mint is placeholder.
- Legal pages are placeholders pending attorney review.
- Permanent death remains off unless explicitly enabled + disclosed.
