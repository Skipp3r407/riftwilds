# Development Override (local / DEV only)

Secure auth bypass for local Riftwilds testing. **Production always requires real accounts.**

## How to enable

Override is allowed only when **all** of these hold:

1. `NODE_ENV !== "production"` (hard stop)
2. **and** one of:
   - `NODE_ENV === "development"` (default `npm run dev`), **or**
   - `DEV_OVERRIDE=true`, **or**
   - `NEXT_PUBLIC_DEV_OVERRIDE=true`

Suggested local `.env` (also in `.env.example`):

```bash
NODE_ENV=development
# Optional explicit flags (redundant under npm run dev):
# DEV_OVERRIDE=true
# NEXT_PUBLIC_DEV_OVERRIDE=true
```

Never set override flags on production hosts. `npm run build` / production CI runs `scripts/assert-no-dev-override-prod.mjs` and **fails** if those flags are still true.

## Login UI

On `/login` when override is allowed:

- Replaces the **no guest play** chip with **local development**
- Shows a **Developer Override** panel (“For Local Development Only”)
- **Sign in / Create account / Forgot password** stay available

Press **Enter as Dev Keeper** → `POST /api/auth/dev-override` issues a signed local `ph_session` and seeds mock state in `localStorage`.

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
2. Open `/login`
3. Click **Enter as Dev Keeper**
4. Land on `/play` with a valid session
5. Open `/live-world` and `/restoration` (DEV ACCESS)
6. Optional: `Ctrl+Shift+D` for tools

## Confirm production stays locked

1. Do **not** set `DEV_OVERRIDE` / `NEXT_PUBLIC_DEV_OVERRIDE` in prod
2. `NODE_ENV=production npm run build` (or CI) fails if those flags are true
3. Production `/login` shows **no guest play** — no Developer Override button
4. `POST /api/auth/dev-override` returns **403**
5. Live World / Restoration stay **Coming Soon** until `LIVE_WORLD_PUBLIC_ACCESS_ENABLED=true`

## Related

- Account gate: `docs/AUTH_ACCOUNT_REQUIRED.md`
- Live World soft-gate: `docs/LIVE_WORLD_PLAYABLE.md`
- Code: `src/lib/auth/dev-override.ts`, `src/app/api/auth/dev-override/route.ts`
