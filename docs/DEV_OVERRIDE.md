# Development Override (local / DEV only)

Secure auth bypass for local Riftwilds testing. **True production always requires real accounts.**

## How to enable

Override is allowed when:

1. `NODE_ENV === "development"` (default `npm run dev`) — always on, **or**
2. Explicit bypass flag on a non-true-production runtime:
   - `NEXT_PUBLIC_AUTH_DEV_BYPASS=1` (preferred temporary alias), **or**
   - `AUTH_DEV_BYPASS=1`, **or**
   - `DEV_OVERRIDE=true` / `NEXT_PUBLIC_DEV_OVERRIDE=true`
3. **Never** when `VERCEL_ENV === "production"` (or local `NODE_ENV=production` without Vercel preview)

Suggested local `.env` (also in `.env.example`):

```bash
NODE_ENV=development
# Optional — only needed for Vercel preview (local npm run dev already enables bypass):
# NEXT_PUBLIC_AUTH_DEV_BYPASS=1
```

Never set override flags on true production. `prebuild` / CI runs `scripts/assert-no-dev-override-prod.mjs` and **fails** if those flags remain on production (preview is allowed).

## Login UI

On `/login` and `/signup` when override is allowed:

- Chip shows **dev bypass on**
- Shows a temporary panel: **Dev bypass — remove later**
- Button: **Dev bypass — enter without login**
- Real **Sign in / Create account** stay available

Press the button → `POST /api/auth/dev-override` issues a signed local `ph_session` and seeds mock state in `localStorage`, then routes to `/play`.

## Session / mock behavior

| Concern | Behavior |
|--------|----------|
| Cookie | Signed `ph_session` prefix `devov.` (HMAC via `SESSION_SECRET`) |
| Identity | Dev Keeper — admin, level 100, max currency/shards, `developer: true` |
| Unlocks | Cards, companions, comics, areas, quests, marketplace, guild, housing |
| DB | **Not required.** No production DB writes. If Postgres is down, gate still passes |
| Client mock | `localStorage` key `riftwilds:dev-override:v1` (inventory, decks, world, etc.) |
| Account gate | Middleware + `(game)` layout accept the signed cookie like a real session |
| Production API | `POST /api/auth/dev-override` → **403** when `NODE_ENV=production` |

## Live World + World Restoration (Coming Soon · DEV ACCESS)

Public soft-gate stays off:

- `LIVE_WORLD_PUBLIC_ACCESS_ENABLED=false`

While Development Override / local DEV is active, entry opens via `isLiveWorldEntryOpen()`:

- `NODE_ENV=development`, or
- `DEV_OVERRIDE` / `NEXT_PUBLIC_DEV_OVERRIDE`, or
- `LIVE_WORLD_DEV_PREVIEW_ENABLED=true` (env or feature flag)

Effects:

- `/live-world` enters Phaser when playable flags allow
- `/restoration` loads contribute UI
- `GET/POST /api/civilization` allowed for local/dev
- Nav / page badges show **COMING SOON · DEV ACCESS** (public still gated)

## Dev badge + Dev Tools

- Corner badge: **DEVELOPMENT MODE · DEV OVERRIDE** (never in production builds)
- Hidden panel: `Ctrl+Shift+D` / `Cmd+Shift+D` — spawn cards/eggs, unlock all, teleport, quests, currency, SOL test balance, weather/time, collision, god mode, reset tutorial/account, comics, companions, Live World / Restoration shortcuts

## How to test Play without signup

1. `npm run dev`
2. Open `/login` (or `/signup`)
3. Click **Dev bypass — enter without login**
4. Land on `/play` with a valid session
5. Open `/live-world` and `/restoration` (DEV ACCESS)
6. Optional: `Ctrl+Shift+D` for tools

## Remove later

Delete or stop rendering `src/components/auth/dev-bypass-login-panel.tsx` usages on `/login` and `/signup`, and unset `NEXT_PUBLIC_AUTH_DEV_BYPASS` / related flags. Core API can stay behind the production hard-stop.

## Confirm production stays locked

1. Do **not** set bypass flags on `VERCEL_ENV=production`
2. True-production `npm run build` / CI fails if those flags are true
3. Production `/login` shows **no guest play** — no Dev bypass button
4. `POST /api/auth/dev-override` returns **403**
5. Live World / Restoration stay **Coming Soon** until `LIVE_WORLD_PUBLIC_ACCESS_ENABLED=true`

## Related

- Account gate: `docs/AUTH_ACCOUNT_REQUIRED.md`
- Live World soft-gate: `docs/LIVE_WORLD_PLAYABLE.md`
- Code: `src/lib/auth/dev-override.ts`, `src/app/api/auth/dev-override/route.ts`
