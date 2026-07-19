# Nakama (local multiplayer backend)

Additive Heroic Labs **Nakama** integration for Riftwilds. Existing guest auth, SIWS wallet login, TCG invite lobbies, friends/PM, guilds shell, demo leaderboards, and Credits tournaments remain the gameplay sources of truth. Nakama bridges sit beside them and are feature-flagged.

## Stack audit (host project)

| Layer | Tech |
| --- | --- |
| App | Next.js 16 (App Router), React 19, TypeScript |
| Soft data | Prisma + Postgres (`DATABASE_URL` — Neon/Supabase in prod) |
| Identity | `rift_guest` cookie/header, SIWS wallet, modular auth scaffolding |
| Battles | Local TCG invite store (`/api/tcg/match/invite`) + arena hub |
| Social | In-memory friends/PM (`FRIENDS_AND_PM_ENABLED`) |
| Multiplayer backend (new) | Nakama + dedicated Postgres + optional Redis via Docker Compose |

## What was added

- `docker-compose.yml` — `nakama-postgres` (host **5433**), `redis` (**6379**), `nakama` (**7349/7350/7351**)
- `nakama/local.yml` — local server config (dev keys only)
- `docker/postgres/init`, `docker/redis/README.md`
- `@heroiclabs/nakama-js` client SDK
- `src/lib/nakama/*` — client, auth, matchmaking, chat, guilds, leaderboards, tournaments, storage + bridges
- `NakamaProvider` in root layout + `/settings/nakama` UI + `/api/nakama/status`
- Feature flags: `NAKAMA_ENABLED` (default **false**) and per-slice bridge flags
- Env keys in `.env.example`
- npm scripts: `nakama:up`, `nakama:down`, `nakama:logs`, `nakama:ps`

## Redis choice

| Service | Required by Nakama? | Included? | Why |
| --- | --- | --- | --- |
| Postgres (`nakama-postgres`) | **Yes** | Yes | Nakama persistence (separate from app `DATABASE_URL`) |
| Redis | No | Yes | Local cache / future runtime modules; app may use `REDIS_URL` |
| CockroachDB | Alternative | No | Prefer Postgres for local Windows simplicity |

## Docker Desktop (Windows) — install if missing

This machine may not have Docker on `PATH`. Install before starting the stack:

1. Install [Docker Desktop for Windows](https://docs.docker.com/desktop/setup/install/windows-install/)
2. Enable WSL 2 backend if prompted
3. Start Docker Desktop and wait until it shows **Running**
4. Confirm in PowerShell:

```powershell
docker --version
docker compose version
```

## Start the stack

From the repo root:

```powershell
# 1) Backend
docker compose up -d
# or: npm run nakama:up

# 2) Enable the Next client (copy into .env.local — never commit secrets)
# NEXT_PUBLIC_NAKAMA_ENABLED=true

# 3) App
npm run dev
```

Useful URLs:

| Surface | URL |
| --- | --- |
| Nakama API | http://127.0.0.1:7350 |
| Nakama console | http://127.0.0.1:7351 (`admin` / `localdev`) |
| Next app | http://localhost:3000 |
| Settings UI | http://localhost:3000/settings/nakama |
| Status API | http://localhost:3000/api/nakama/status |

Stop:

```powershell
docker compose down
# or: npm run nakama:down
```

## Feature flags

Defaults live in `src/lib/config/feature-flags.ts`:

| Flag | Default | Role |
| --- | --- | --- |
| `NAKAMA_ENABLED` | `false` | Master switch (or set `NEXT_PUBLIC_NAKAMA_ENABLED=true`) |
| `NAKAMA_AUTH_BRIDGE_ENABLED` | `true` | Guest device + email → Nakama session |
| `NAKAMA_MATCHMAKING_BRIDGE_ENABLED` | `true` | Optional matchmaker tickets beside TCG invites |
| `NAKAMA_CHAT_BRIDGE_ENABLED` | `true` | Room chat overlay (friends/PM stay) |
| `NAKAMA_GUILDS_BRIDGE_ENABLED` | `true` | Nakama groups for guild shell |
| `NAKAMA_LEADERBOARDS_BRIDGE_ENABLED` | `true` | Optional board writes/reads |
| `NAKAMA_TOURNAMENTS_BRIDGE_ENABLED` | `true` | Optional tournament list/join (no SOL escrow) |
| `NAKAMA_STORAGE_BRIDGE_ENABLED` | `true` | Soft prefs storage only |

## What is Nakama-backed vs bridged

| Feature | Primary (existing) | Nakama role |
| --- | --- | --- |
| Guest identity | `rift_guest` / `x-rift-guest` / owner-key | Device auth `rift_guest_<token>` |
| Email login | Modular auth scaffolding | `authenticateEmail` bridge |
| Wallet | SIWS | Untouched |
| TCG PvP invites | `/api/tcg/match/invite` | Optional matchmaker ticket via `bridgeTcgInviteToNakama` |
| Chat / PM | Friends + PM service | Optional room channels |
| Guilds | `/guilds` shell + guild economy | Optional Nakama groups |
| Leaderboards | Demo HUD / arena | Optional `rift_arena_free` board |
| Tournaments | Credits/AP economy | Optional list/join (never SOL escrow) |
| Player storage | App stores / Prisma | Soft prefs collection `rift_player_prefs` |

## Guest login how-to

1. Start Docker + set `NEXT_PUBLIC_NAKAMA_ENABLED=true`
2. Open `/settings/nakama`
3. Click **Guest login (rift_guest)**
4. The client mints/stores `rift_guest_token` in `sessionStorage` and calls Nakama `authenticateDevice` with id `rift_guest_<token>`
5. Hatchery/Credits APIs still use the same guest cookie/header path — Nakama does not replace owner-key

## Email login how-to

1. Same enablement as guest
2. On `/settings/nakama`, enter email + password (8+)
3. **Create** registers a Nakama email account; **Sign in** authenticates an existing one
4. Wallet SIWS remains optional and separate
5. Local stack does not send magic-link email — password auth is stored by Nakama

## Matchmaking bridge (TCG)

```ts
import { bridgeTcgInviteToNakama } from "@/lib/nakama";
import { restoreOrRefreshSession } from "@/lib/nakama";

const session = (await restoreOrRefreshSession())?.session ?? null;
await bridgeTcgInviteToNakama({
  session,
  lobby: { code, invitePath, hostKey },
});
```

Local lobby codes remain authoritative for `/tcg/battle?invite=…`.

## Leaderboards note

Writing to `rift_arena_free` requires the leaderboard to exist in Nakama (create via console or a runtime module). Until then, list/write may error — the bridge returns `nakama.ok: false` and local HUD continues.

## Local-only policy

- Do **not** commit `.env` / `.env.local`
- Do **not** push or deploy as part of this integration unless explicitly requested
- Console password `localdev` is for localhost only — rotate before any shared environment

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| `docker` not recognized | Install/start Docker Desktop; reopen PowerShell |
| Status `reachable: false` | `docker compose ps` — wait for `nakama` healthy |
| Port 5432 busy | Compose maps Postgres to **5433** on purpose |
| Auth fails with server key | Match `NEXT_PUBLIC_NAKAMA_SERVER_KEY` to `socket.server_key` in `nakama/local.yml` |
| Typecheck fails | `npm run typecheck` from repo root after `npm install` |
