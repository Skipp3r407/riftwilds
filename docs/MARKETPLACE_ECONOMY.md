# Riftwilds Marketplace & Supply Economy

Authoritative rules live in code under `src/lib/economy/` and `src/lib/marketplace/`. This doc summarizes behavior and how to toggle features. **Not financial advice.** Sellers set prices; the project never assigns guaranteed monetary value.

## Core principle

- Both **unopened eggs** and **hatched pets** may be sold (when flags allow).
- **Starter eggs are account-bound** and cannot be listed.
- No unlimited eggs; release is capped and slow.
- Egg listings disclose **ranges only** — no exact reveal, no fake “almost Legendary” animations.
- Ranked combat **normalizes** level / equipment / paid ability power so marketplace value is cosmetics, flexibility, and tactics — not unbeatable DPS.

## Feature flags (safe defaults)

Defined in `src/lib/config/feature-flags.ts`:

| Flag | Default | Purpose |
|------|---------|---------|
| `MARKETPLACE_DEMO_CATALOG_ENABLED` | `true` | Browse demo listings / UI scaffolding |
| `MARKETPLACE_ENABLED` | `false` | Live marketplace gate |
| `MARKETPLACE_WRITES_ENABLED` | `false` | Create / cancel / purchase (demo credits) |
| `MARKETPLACE_EGG_SALES_ENABLED` | `true` | Allow egg listing kind when writes on |
| `MARKETPLACE_PET_SALES_ENABLED` | `true` | Allow pet listing kind when writes on |
| `MARKETPLACE_BUNDLE_LISTINGS_ENABLED` | `true` | Pet + selected loadout bundles |
| `REAL_SOL_MARKETPLACE_ENABLED` | `false` | Real SOL escrow (keep off) |
| `SOL_PURCHASES_ENABLED` | `false` | Any SOL purchase settlement |
| `BREEDING_ENABLED` | `false` | Breeding attempts |
| `RANKED_EQUIPMENT_NORMALIZATION_ENABLED` | `true` | Ranked combat normalization |
| `MARKETPLACE_REVENUE_SPLIT_ENABLED` | `true` | Use 90/5/3/1/1 policy math |

### How to toggle locally

1. Edit defaults in `src/lib/config/feature-flags.ts`, **or**
2. Override via `GameSetting` / `FeatureFlag` tables when admin runtime overrides are wired.

**Recommended for UI work:** leave demo catalog on; enable `MARKETPLACE_WRITES_ENABLED=true` only to exercise create/purchase stubs. Keep both SOL flags `false`.

## 1. Limited egg supply

Config: `src/lib/economy/egg-supply.ts`

Sources: `STARTER`, `OFFICIAL_SEASONAL`, `STORY_ACHIEVEMENT`, `BREEDING`, `COMMUNITY_EVENT`, `LIMITED_COLLECTOR`.

Starting envelope (`EGG_SUPPLY_GLOBAL`):

- Starter generation pool: 500–1000 (active 750)
- Weekly official release: 25–100 (active 50)
- One reward-generating egg/pet per player initially
- Slow release enabled; breeding eggs capped globally per week

API: `GET /api/marketplace/supply`

Prisma: `Egg.sourceKind`, `accountBound`, `sellable`, `EggSupplyCounter`

## 2. Sell unopened eggs

Listings must show: type, generation, parents (if bred), possible species/affinities/rarity/cosmetics, hatch time, source, ownership history, breedable?, holder-reward eligible?

Exact creature stays unknown until hatch.

UI: `EggListingCard` · API create via `POST /api/marketplace/listings` with `kind: "EGG"`

Starter (`STARTER`) listings are rejected (`starter_eggs_account_bound`).

## 3. Sell hatched pets

Known traits: rarity, species, affinity, genetics summary, cosmetics, evolution, level, abilities, ultimate, battle record, breeding uses, permanent traits, seasonal origin, generation, founder, memories/achievements.

Sellers set ask price — no assigned value.

UI: `PetListingCard`

## 4. Pet vs loadout bundle

On list: **Pet only** or **Pet + selected loadout**. Buyer sees every bundled item. Never auto-transfer all equipped gear.

Config: `ListingBundleMode` · UI: `ListAssetPanel`

## 5. Ranked combat normalization

`src/game/arena/ranked-normalization.ts` + `buildCombatant({ rankedMode: true })`

Normalizes level (default 20), base stats, equipment power (≤18% atk), paid ability uplift.

## 6. Controlled breeding

`src/lib/economy/breeding-rules.ts`

- 3–5 uses/pet (active 5)
- 7–14 day cooldown (active 10)
- Rising fee table: 0.05 → 0.08 → 0.12 → 0.20 → 0.35 SOL
- Min age + bond; weekly global egg cap; no rarity guarantee; visible generations
- Fee split: reserve / holder / development / community events

APIs: `GET /api/breeding/rules`, `POST /api/breeding/eligibility`, `POST /api/breeding/attempt` (preview shell)

UI: `BreedingRulesPanel` on `/marketplace`

## 7. Listing controls

`src/lib/marketplace/listing-rules.ts`

- Max 5 pet/egg + 20 item active listings / wallet
- Min price 0.001 SOL · max duration 7 days · cancel cooldown 6h
- Listing fee ~0.002 SOL non-refundable
- Ownership checks + duplicate `requestId` protection
- Suspicious-price warnings + wash-trade stub (`integrity.ts` TODOs for chain)

## 8. Fee split (pets/eggs)

Aligned with `src/lib/revenue/policies.ts` `MARKETPLACE_SALE`:

| Destination | Share |
|-------------|-------|
| Seller | 90% |
| Project reserve | 5% |
| Holder rewards | 3% |
| Ops | 1% |
| Community events | 1% |

Items may use ~5% total fee (`fee-policy.ts`). Listing fees use `LISTING_FEE` shop-style policy.

## 9. Price history (non-prescriptive)

`src/lib/marketplace/price-history.ts` · `GET /api/marketplace/price-history`

Language example: *“Similar pets recently sold between X and Y SOL”* — never *“This pet is worth X”*.

## 10. Categories

Eggs (official/bred/seasonal/event/founder) · Pets (hatchling/young/adult/evolved/battle-trained/breeding/collector) · Equipment · Consumables · Property (stub, disabled)

`src/lib/marketplace/categories.ts` · tabs on `/marketplace`

## APIs

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/marketplace/listings` | Demo catalog filterable by category |
| POST | `/api/marketplace/listings` | Writes flag-gated; in-memory demo store |
| POST | `/api/marketplace/listings/[publicId]/cancel` | Cancel cooldown |
| POST | `/api/marketplace/listings/[publicId]/purchase` | Demo credits only; SOL returns 501 |
| GET | `/api/marketplace/price-history` | Non-guaranteed comparables |
| GET | `/api/marketplace/supply` | Release counters (demo) |
| GET | `/api/marketplace/rules` | Full rules dump for clients/admin |
| GET/POST | `/api/breeding/*` | Rules, eligibility, attempt preview |

## Prisma

Migration: `prisma/migrations/20260717200000_marketplace_economy/`

Adds listing kinds/categories/bundles, egg source fields, breeding counters on creatures, supply counters, trade/cancel cooldowns, sale history fields.

Apply with `npm run db:migrate` (or `db:push` in local prototyping).

## Known gaps

1. **No real SOL escrow / on-chain settlement** — intentionally blocked (`REAL_SOL_MARKETPLACE_ENABLED` / `SOL_PURCHASES_ENABLED` false; purchase returns 501 if SOL mode forced).
2. **Listings/purchases use in-memory demo store** until Prisma `MarketplaceListing` persistence is wired in API handlers.
3. **Wash-trading detection is heuristic stub** — see TODOs in `integrity.ts`.
4. **Breeding attempt does not mint eggs yet** — returns `PREVIEW_ONLY` even when `BREEDING_ENABLED`.
5. **Property category** is UI stub only.
6. **EggSupplyCounter** not yet incremented by hatchery claim paths (demo stats on supply API).
7. **Ownership history** on demo eggs is synthetic; chain provenance pending.

## Primary files

- `src/lib/economy/egg-supply.ts`
- `src/lib/economy/breeding-rules.ts`
- `src/lib/marketplace/*`
- `src/game/arena/ranked-normalization.ts`
- `src/app/(game)/marketplace/page.tsx`
- `src/components/marketplace/*`
- `src/lib/revenue/policies.ts` (90/5/3/1/1)
- `src/lib/config/feature-flags.ts`
