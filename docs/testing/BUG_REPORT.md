# Bug Report — Live Audit 2026-07-17

## Fixed this session (P0/P1)

### P0 — Guest hatchery identity broken under `next start` (HTTP)

- **Symptom:** Claim returned 200, subsequent eggs list empty, hatch 403 FORBIDDEN.
- **Cause:** `secure: NODE_ENV === "production"` set Secure cookies; browsers/clients drop them on `http://localhost`.
- **Fix:** `src/lib/auth/cookie-options.ts` — Secure only when `NEXT_PUBLIC_APP_URL` is `https://` (or `COOKIE_SECURE=true`). Middleware origin-story cookie uses same helper.
- **Verify:** Prod `:3002` cookie jar → claim eggs=1 → hatch 200.

### P1 — WalletContext crash during SSG

- **Symptom:** Build logged `publicKey on a WalletContext without providing one` for profile/rewards/token/shop.
- **Cause:** `WalletProviderDynamic` skipped provider on SSR.
- **Fix:** Always wrap with `AppWalletProvider`; lazy-load Phantom/Solflare adapters after mount.
- **Verify:** Clean production build without WalletContext errors.

### P1 — Smoke hatchery false negative

- **Symptom:** Smoke reported eggs=0 after claim.
- **Cause:** No cookie jar between fetch calls.
- **Fix:** `scripts/smoke-pages.mjs` shares Set-Cookie jar; adds hatch skipWait check.

### P2 — Playwright hatchery selector

- **Symptom:** Matched hidden nav “Hatchery” menuitem.
- **Fix:** Prefer heading + claim button in `tests/e2e/smoke.stub.spec.ts`.

## Open — external / not code-fixable alone

| ID | Severity | Issue | Unblock |
|----|----------|-------|---------|
| E1 | P1 (ops) | `/api/ready` 503 — Postgres unreachable in audit env | Provide working `DATABASE_URL` + migrate/seed |
| E2 | P1 (ops) | No public deploy URL | Deploy + set `NEXT_PUBLIC_APP_URL` https |
| E3 | P1 (ops) | Wallet/mainnet NOT VERIFIED | Disposable wallet + read-only RPC; never spend SOL in audit |
| E4 | P2 | Hatchery in-memory only | Persist eggs/pets to Prisma before marketing durability |
| E5 | P2 | 136 pending assets (mostly NPC/enemy/anim) | Continue asset pipeline; not launch-blocking if fallbacks |

## Non-bugs (by design)

- `/` → `/about` first-visit redirect
- SOL purchases / claims / marketplace writes OFF
- Demo labels on marketplace/social/treasury
