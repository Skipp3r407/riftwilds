# Riftwilds — Production checklist

Phase 1 of the game can be deployed as a public marketing + hatchery/arena demo stack. Full MMO systems (Live World realtime, SOL checkout, breeding, guilds) remain feature-flagged off until later phases.

## Required environment

Copy `.env.example` → `.env` / Vercel / host secrets:

| Variable | Required | Notes |
|----------|----------|--------|
| `DATABASE_URL` | Yes | Pooled URL (Neon pooler recommended) |
| `DIRECT_URL` | Yes for migrate | Direct Postgres for Prisma migrate |
| `SESSION_SECRET` | Yes | ≥32 random chars |
| `NEXT_PUBLIC_APP_URL` | Yes | Public https origin |
| `NEXT_PUBLIC_SOLANA_NETWORK` | Yes | `devnet` until mainnet cutover |
| `TOKEN_MINT_ADDRESS` | When gating | Replace `COMING_SOON` |
| `TREASURY_WALLET` | Before SOL shop | Multisig recommended |
| `ADMIN_WALLETS` | Admin access | Comma-separated addresses |
| `MAINTENANCE_MODE` | Optional | `true` rewrites site to `/maintenance` |

## Deploy steps

1. `npm ci`
2. `npx prisma generate`
3. `npm run db:migrate:deploy`
4. `npm run db:seed` (first environment only)
5. `npm run build`
6. `npm run start` (or Vercel/host start)

Health:

- Liveness: `GET /api/health`
- Readiness (DB): `GET /api/ready`

## Hard-off money paths

Defaults in `src/lib/config/feature-flags.ts`:

- `SOL_PURCHASES_ENABLED=false`
- `SOL_ITEM_PURCHASES_ENABLED=false`
- `REWARD_CLAIMS_ENABLED=false`
- `AUTOMATIC_SETTLEMENT_ENABLED=false`
- `REAL_VALUE_WAGERING` permanently disabled in arena config

Do not enable mainnet SOL settlement without audit + legal review.

## Security notes

- `/admin` requires session cookie + `role === admin`
- Session + guest cookies use `Secure` in production
- Security headers + HSTS via `next.config.ts`
- Hatchery/pets Phase 1 stores are in-memory demo — persist before marketing “live pets” as durable

## CI

`.github/workflows/ci.yml` runs lint, test, and build with dummy `DATABASE_URL` / `SESSION_SECRET`.
