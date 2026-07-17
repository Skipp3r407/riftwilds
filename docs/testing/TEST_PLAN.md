# Riftwilds Test Plan

**Date:** 2026-07-17

## Goals

1. Prove marketing + demo gameplay loops work without spending SOL.
2. Catch P0/P1 regressions (routing, hatchery identity, wallet SSR, reward framing).
3. Keep money paths fail-closed.
4. Track asset gaps honestly.

## Layers

| Layer | Command / method | Scope |
|-------|------------------|-------|
| Typecheck | `npm run typecheck` | TS |
| Lint | `npm run lint` | ESLint (warnings allowed if 0 errors) |
| Unit | `npm run test` | Vitest — economy, hatch, care, rewards messaging, arena |
| Smoke HTTP | `npm run test:smoke` / `node scripts/smoke-pages.mjs` | All major pages + APIs; cookie-aware hatchery |
| E2E | `RUN_E2E=1 PLAYWRIGHT_BASE_URL=http://localhost:3002 npm run test:e2e` | Chromium serial smoke |
| Assets | `npm run assets:scan` / `assets:report` | Manifest gaps |
| Prod build | `npm run build` && `npm run start -p 3002` | SSG + runtime |

## Critical journeys (must pass for closed alpha)

1. **First visit** `/` → about story or home with brand.
2. **Hatchery:** claim starter egg → list shows egg → skip wait → hatch → pet appears (guest cookie).
3. **Marketplace/Shop:** pages render with Demo / SOL-off labels; no live checkout.
4. **Rewards:** community treasury framing; no “buy coin → pet SOL”.
5. **Live World:** shell loads without crash.
6. **Health:** `/api/health` 200; `/api/ready` may be 503 without DB (document).

## Explicitly out of scope (until user provides)

- Mainnet wallet spend
- Deployed production URL verification
- Pump.fun token launch operations
- Force-enabling SOL settlement flags

## Pass criteria for this audit session

- [x] typecheck clean
- [x] lint 0 errors
- [x] 157 unit tests pass
- [x] production build succeeds (WalletContext SSG fixed)
- [x] cookie-aware hatchery on prod build
- [x] reward framing unit + API samples honest
- [x] Playwright smoke (6/6) green on prod `:3002` after selector fix
- [x] docs under `docs/testing/` written with evidence
