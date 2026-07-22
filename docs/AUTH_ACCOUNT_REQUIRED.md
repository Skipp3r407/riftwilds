# NO ACCOUNT = NO GAMEPLAY (breaking change)

**Local-only note:** This change is not pushed/deployed unless you ask. Apply the Prisma migration locally before testing account flows.

Full database / Google / Resend setup: [AUTH_SETUP.md](./AUTH_SETUP.md).

## What changed

Anonymous / `rift_guest` gameplay is **disabled** by default.

| Before | After |
|--------|--------|
| Play CTAs opened hatchery/TCG/world without login | Play → session check → `/login` if missing |
| APIs minted `rift_guest` cookies | Protected APIs return **401** without `ph_session` |
| “Free to play — no wallet needed” included guests | Free account required; wallet remains optional for Web3 |

Feature flags (`src/lib/config/feature-flags.ts`):

- `AUTH_ACCOUNT_REQUIRED_FOR_PLAY: true`
- `AUTH_WALLET_OPTIONAL_PLAY: false`
- `AUTH_EMAIL_ENABLED: true`
- `AUTH_SOCIAL_ENABLED: true` (OAuth scaffold until keys exist)

## Public vs gated

**Public:** landing, about/trailer/marketing, FAQ-style pages, Terms, Privacy, `/signup`, `/login`, `/forgot-password`, `/reset-password`, `/verify-email`, `/onboarding` (signed-in incomplete accounts).

**Gated (middleware cookie + server layout/API checks):**  
`/play`, `/dashboard`, `/world`, `/live-world`, `/live`, `/battle`, `/arena`, `/tcg/*`, `/hatchery`, `/marketplace`, `/guilds`, `/comics`, `/housing`, `/homestead`, `/neighborhoods`, `/profile`, `/settings`, `/wallet`, `/inventory`, `/rewards`, `/loyalty`, `/quests`, `/social`, `/collection`, `/pets`, `/shop`, `/exchange`, `/economy/credits`, `/academy`, and matching `/api/*` prefixes listed in `src/lib/auth/protected-routes.ts`.

## Session

- HttpOnly cookie: `ph_session` (session token hash in Prisma `Session`)
- Refresh cookie: `ph_refresh` (rotation via `POST /api/auth/refresh`)
- CSRF double-submit cookie: `ph_csrf` (set on login/register)
- Logout: `POST /api/auth/logout` · logout-all devices: `POST /api/auth/logout-all`
- Account statuses: `PENDING_VERIFICATION`, `ACTIVE`, `SUSPENDED`, `BANNED`, `DELETED`, `UNDER_REVIEW`, `PARENTAL_CONSENT_REQUIRED`, `RECOVERY_PENDING`

Wallet SIWS still works but **does not replace** email/social account policy — wallets are linked via `LinkedWallet` / `Wallet` after (or as) account creation. Guest Nakama device auth is refused while the account gate is on.

## Onboarding steps

After signup/sign-in: email verify (when enabled) → display name → username → DOB/age → Terms + Privacy → region → starter Keeper → starter Egg → tutorial intro. Required legal/account steps cannot be skipped.

## Schema / migration

- Prisma schema: `prisma/schema.prisma` (AccountStatus + auth tables)
- Migration: `prisma/migrations/20260720120000_account_auth_gate/migration.sql`

```bash
npm run db:migrate
# or for deploy environments:
npm run db:migrate:deploy
npx prisma generate
```

## Local demo test plan

1. `AUTH_SKIP_EMAIL_VERIFY=true` in `.env` (default in `.env.example`)
2. Open `/play` or `/tcg/battle` logged out → redirect to `/login?returnUrl=…`
3. `POST /api/hatchery/eggs` without cookie → **401**
4. Sign up at `/signup` → onboarding → `/play`
5. Sign out → protected routes blocked again
6. Multi-tab: logout-all revokes other sessions after refresh/next navigation
7. Wallet without account: SIWS may create an account; bare wallet UI does not unlock guest APIs
8. **Optional local bypass:** Development Override on `/login` (see `docs/DEV_OVERRIDE.md`) — never production

## Rollback (local)

Set `AUTH_ACCOUNT_REQUIRED_FOR_PLAY: false` and `AUTH_WALLET_OPTIONAL_PLAY: true` in feature flags (not recommended for production product intent).
