# Credits Ledger

## Rules

- Integer Credits only (no floats).
- Idempotency via unique `requestId` (replay returns same entry).
- Atomic in-process mutation (account balance + ledger entry + rate buckets).
- Optional Prisma sync: `CurrencyLedger` + `PlayerProfile.softCurrency` when `CREDITS_PRISMA_ENABLED` and User exists.
- Faucets: caps, cooldowns, daily grant counts (`src/lib/credits/config.ts`).
- Sinks: min/max per action; most leave circulation (burn).
- AI NPC cannot grant (`ai_cannot_grant`).
- Admin alerts never auto-apply extreme economy changes.

## API

| Route | Purpose |
|-------|---------|
| `GET /api/credits/balance` | Balance + recent entries (hydrate Prisma first) |
| `POST /api/credits/transact` | Low-level credit/debit with validation |
| `POST /api/economy/credits-action` | High-level quest/job/event/shop/travel/restore/goals |
| `GET /api/credits/health` | Circulation + alerts + rule dump |

## Prisma mapping

| Memory | Prisma |
|--------|--------|
| Account.balance | `PlayerProfile.softCurrency` |
| Ledger entry | `CurrencyLedger` |
| requestId | `CurrencyLedger.requestId` |

Env: `CREDITS_PRISMA_ENABLED` (see `.env.example`). Feature flag: `CREDITS_PRISMA_ENABLED`.

## Hatchery egg sink

When the global free starter pool is exhausted (or a keeper already claimed free), `POST /api/hatchery/purchase` debits **5_000 Credits** via sink reason `EGG_PURCHASE` and grants a Common Rift Egg (`creationSource: SHOP`). Integer Credits only — never wallet SOL. See `PREMIUM_EGG_CREDITS_PRICE` in `src/lib/economy/egg-supply.ts`.

## Disclaimer

Credits are in-game soft currency. Not SOL. Not a token claim. Not investment advice.
