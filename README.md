# Project Hatch

Original Solana creature-collecting game set in **The Riftwilds**. Hatch and train **Riftlings**, explore regions, battle, quest, and trade — connected to a Pump.fun meme coin for access tiers (not investment promises). Pet rewards share a **Community Reward Treasury** funded by verified project-controlled deposits — buying the coin does not automatically generate SOL for pet owners. See `docs/COMMUNITY_REWARDS.md`.

> Placeholders for mint, social links, and wallets live in `src/lib/config/project.ts`.

## Stack

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS · Prisma · PostgreSQL · Solana Wallet Adapter · Zod · TanStack Query · Zustand · Vitest · Playwright

## Phase status

**Phase 1 (Foundation) — in progress / runnable**

- Centralized config + feature flags
- Full Prisma domain schema + seed data
- SIWS-style wallet auth API
- Token balance verification service
- Marketing landing page
- Game dashboard shell + hatchery/collection/world shells
- Admin shell + legal/risk placeholders
- Transparency + fairness pages
- Unit tests for odds, damage, care, tiers

Later phases: hatch claims, care loop, Phaser world, battles, marketplace, hardening.

## Quick start

```bash
npm install
cp .env.example .env
# Set DATABASE_URL (+ DIRECT_URL) to a Neon/Supabase Postgres database
# Set SESSION_SECRET to a long random string

npx prisma db push
npm run db:seed
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Without a database, the landing page and most UI still load; auth/token APIs that hit Prisma will fail until `DATABASE_URL` is set. Transparency metrics fall back to demo-safe defaults.

## Environment variables

See `.env.example`. Never commit secrets. Never expose private RPC keys to the client.

Key vars:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | Postgres connection |
| `SESSION_SECRET` | Session signing (prod required) |
| `TOKEN_MINT_ADDRESS` | SPL mint for gating |
| `SOLANA_RPC_URL` / `HELIUS_API_KEY` | Server RPC |
| `NEXT_PUBLIC_SOLANA_NETWORK` | `devnet` by default |

Editable brand placeholders: `src/lib/config/project.ts`.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Local Next.js |
| `npm run build` | Production build |
| `npm run test` | Vitest unit tests |
| `npm run db:push` | Push Prisma schema |
| `npm run db:seed` | Seed affinities, 18 species, items, quests, demo user |
| `npm run db:studio` | Prisma Studio |

## Architecture

See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the plan checklist, threat model, economy risks, MVP vs later, and asset requirements.

## Economy loop

Documented flywheel (buy coin → egg → hatch → care → shop → marketplace fees → treasury → events → growth → creator fees → epoch rewards): [docs/ECONOMY_LOOP.md](docs/ECONOMY_LOOP.md) · public page `/economy`.

Epoch / real-money rewards stay **off** (`EPOCH_REWARDS_ENABLED`, `REAL_MONEY_REWARDS_ENABLED`).

## 2D art system

| Path | Purpose |
|------|---------|
| `art-direction/` | Style guides, naming, export rules |
| `asset-prompts/` | Image-generation prompts (creatures, eggs, env, items) |
| `public/assets/` | Runtime assets + SVG placeholders |
| `scripts/assets/` | Sharp pipeline (validate, resize, pack, atlas) |
| `/admin/assets` | Asset review gallery |
| `/admin/assets/sprite-inspector` | Animation inspector |

```bash
npm run assets:all          # placeholders + configs + manifest + checks
npm run assets:validate     # validate source PNGs when present
npm run assets:resize       # source → processed (never overwrites source)
npm run assets:pack         # pack frame folders into sheets
```

Drop approved masters in `public/assets/creatures/source/`. Do not claim final art exists until files are approved and status is updated in `public/assets/asset-status.json`.

## Security notes

- Hatch/battle/rewards are server-authoritative (client never trusted for valuable outcomes).
- Real-money rewards and real SOL marketplace default **off**.
- Permanent death defaults **off**.
- Admin actions must be audited; completed hatch results are immutable.

## Devnet wallet testing

1. Install Phantom or Solflare.
2. Switch wallet to Devnet.
3. Connect on the site and sign the auth message.
4. With `TOKEN_MINT_ADDRESS=COMING_SOON`, balance returns a placeholder visitor tier.
5. After mint launch, set the mint + RPC and re-test Keeper+ thresholds.

## Deployment (Vercel)

See **[docs/PRODUCTION.md](docs/PRODUCTION.md)** for the full checklist.

1. Connect the GitHub repo to Vercel.
2. Set env vars from `.env.example` (`DATABASE_URL`, `DIRECT_URL`, `SESSION_SECRET`, `NEXT_PUBLIC_APP_URL` required).
3. Use Neon/Supabase Postgres (pooled `DATABASE_URL` + direct `DIRECT_URL`).
4. Release step: `npm run db:migrate:deploy` (prefer over `db push` in production).
5. Verify `GET /api/health` and `GET /api/ready`.
6. Keep SOL purchases, reward claims, and real-money marketplace flags **false** until audited.

## License / originality

All creature names, affinities, lore, and systems are original to **Riftwilds**. Do not copy third-party creature or MMO IP.
