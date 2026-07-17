# Testing, Pet Validation & Economic Sustainability

This document describes what exists after the system-testing pass, what is still stubbed, how to run checks, and release-gate status.

## Quick start

```bash
npm run typecheck
npm run test:unit
npm run test:pets
npm run test:economy
npm run test:marketplace
npm run test:battles
npm run test:security
npm run simulate:economy
npm run simulate:pets
npm run simulate:battles
npm run validate:assets
npm run validate:all
```

`validate:all` orchestrates critical steps and **fails closed** (non-zero exit) if any critical step fails. Incomplete product systems are tracked as `NOT_IMPLEMENTED` / `STUB` / `PENDING` in `tests/system-registry.json` and are **not** marked as passing.

Reports land in `artifacts/reports/` (`*.json`, `*.md`, `summary.html`).

## Inventory

Machine-readable registry: [`tests/system-registry.json`](../tests/system-registry.json)

Admin shells (data-driven from registry / artifacts):

| Route | Purpose |
|-------|---------|
| `/admin/testing` | Registry status board + command cheat sheet |
| `/admin/economy/simulator` | Latest economy-sim report viewer |
| `/admin/economy/health` | Hard release gates + artifact health |

## What is implemented (executable)

| Area | Location | Notes |
|------|----------|--------|
| Pet factory | `tests/factories/pet-factory.ts` | Deterministic pets for all `LAUNCH_SPECIES` |
| Species + asset tests | `tests/pets/` | Catalog, kits, portrait PNG paths |
| Hatch duplication | `tests/pets/hatch-duplication.test.ts` | `ALREADY_HATCHED` / claim caps |
| Care transitions | `tests/unit/care-transitions.test.ts` + existing care tests | Decay / recover / display |
| Breeding rules & caps | `tests/marketplace/` + unit marketplace | Fees, cooldown, use cap (mint path stub) |
| Marketplace fees/listings | same | Fee BPS, listing validation, egg supply |
| Ranked normalization | `tests/battles/` | Equipment / ability caps |
| Battle sample + sim | `tests/battles/`, `scripts/simulations/battle-balance.ts` | Unit sample 200; CLI default 25k (`--matches`) |
| Revenue / holder vault math | `tests/economy/holder-vault-math.test.ts` | Integer lamports, epoch shares |
| Inventory reconcile helpers | `src/lib/inventory/reconcile.ts` + tests | Pure drift detection |
| Settlement / SOL flags | `tests/security/` | Gate modes; SOL defaults OFF |
| Economy simulator | `scripts/simulations/economy-simulator.ts` | Segments, SOL price, 30d–5y |
| Pet lifecycle sim | `scripts/simulations/pet-lifecycle-simulator.ts` | Care + breeding eligibility |
| Asset validation | `scripts/validate/validate-pet-assets.ts` | `/assets/pets/{slug}.png` |
| Playwright scaffolding | `playwright.config.ts`, `tests/e2e/smoke.stub.spec.ts` | Stub; set `RUN_E2E=1` |

## What is stubbed / not implemented (honest gaps)

Do **not** treat these as green for release:

- Breeding egg mint + SOL fee charge (`BreedingMint`)
- SOL marketplace escrow / on-chain settlement (`SolMarketplaceEscrow`, `OnchainAtomicSplit`)
- Holder reward claims & automatic settlement (`HolderRewardClaims` — flags OFF)
- Ranked matchmaking, casual duels, tournaments, spectator realtime
- Prisma-backed hatchery/marketplace persistence (schema exists; Phase 1 uses in-memory / demo stores)
- Guilds, homestead, live world, quests, evolution gameplay, NFT minting, VRF
- Admin mutation tooling / feature-flag editor / audit writes
- Full Playwright journeys (config + skipped stub only)
- Treasury vault addresses still `COMING_SOON`

See the 43-point product checklist mapping: every missing item should appear in the registry with `STUB` / `NOT_IMPLEMENTED` / `PENDING`.

## Financial assumptions (labeled)

Economy simulator outputs are **models**, not live ledgers:

- SOL/USD price is a CLI input (`--sol=`, default 100)
- Player counts and segments are synthetic (casual / core / whales)
- Monthly ops burn for runway is an illustration constant ($15k USD)
- Revenue uses published BPS policies; product defaults keep:
  - `REAL_SOL_MARKETPLACE_ENABLED = false`
  - `SOL_PURCHASES_ENABLED = false`
  - `AUTOMATIC_SETTLEMENT_ENABLED = false`
  - `REWARD_CLAIMS_ENABLED = false`
  - `REAL_VALUE_WAGERING_ENABLED = false` (hard-off in arena config)

## Battle balance scale

| Mode | Matches | Command |
|------|---------|---------|
| Unit sample | 200 | `npm run test:battles` |
| Practical CLI | 10_000–25_000 | `npm run simulate:battles` or `--matches=10000` in validate:all |
| Stretch | up to 1_000_000 | `npx tsx scripts/simulations/battle-balance.ts --matches=1000000` |

Architecture is a simple loop over the training engine; larger runs are time-bound, not architecturally blocked.

## Release gates (status)

| Gate | Status |
|------|--------|
| SOL settlement feature-flagged OFF | **ENFORCED** in defaults + security tests |
| Real-value wagering hard OFF | **ENFORCED** |
| `validate:all` fails on critical failures | **ENFORCED** |
| Incomplete systems not marked PASS | **ENFORCED** via registry honesty |
| Pet portrait assets for 50 launch species | Validated by `validate:assets` |
| Economy multi-horizon report | Produced by `simulate:economy` |
| Full 43-point product completion | **NOT DONE** — tracked in registry |

## npm scripts added

- `typecheck` (existing)
- `test:unit`, `test:pets`, `test:battles`, `test:economy`, `test:marketplace`, `test:security`
- `simulate:economy`, `simulate:pets`, `simulate:battles`
- `validate:assets`, `validate:all`

## Related docs

- [`ECONOMY_LOOP.md`](./ECONOMY_LOOP.md)
- [`MARKETPLACE_ECONOMY.md`](./MARKETPLACE_ECONOMY.md)
- [`REVENUE_ALLOCATION.md`](./REVENUE_ALLOCATION.md)
- [`ARENA_ARCHITECTURE.md`](./ARENA_ARCHITECTURE.md)
