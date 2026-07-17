# Security Audit (session-scoped)

**Date:** 2026-07-17  
**Scope:** Static + local runtime; not a full penetration test

## Positive controls observed

- Money / settlement flags default **OFF** (`SOL_*`, claims, real marketplace)
- Paid gacha hard-off (`PAID_RANDOM_REWARDS_ENABLED=false`)
- Real-value wagering permanently disabled (arena config)
- Admin routes redirect without session cookie
- Guest/session cookies `httpOnly` + `sameSite=lax`; Secure tied to HTTPS app URL
- Hatchery ownership via `assertOwnership` (unit tested)
- SIWS auth path present; wallet optional play flag on
- `.env` gitignored; secrets not committed in this push prep
- Community rewards disclosures reject buy→SOL framing

## Issues / risks

| Risk | Severity | Notes |
|------|----------|-------|
| In-memory hatchery store | Medium | Resets on restart; not durable authority |
| DB offline locally | Medium | `/api/ready` 503; production must require DB |
| Admin role check | Medium | Presence of session cookie in middleware; role still server-side — verify on deploy |
| Wallet SSR | Fixed | Provider always present |
| Secure cookies on HTTP | Fixed | Local prod no longer drops guest identity |
| RPC / Helius keys | Ops | Must stay server-only; never `NEXT_PUBLIC_` |

## Explicitly not performed

- Mainnet transaction signing / spend
- Auth bypass fuzzing
- Dependency CVE deep scan beyond install
- Production WAF / rate-limit validation

## Pre-public checklist

1. `SESSION_SECRET` ≥32 chars in host secrets  
2. `DATABASE_URL` + migrate deploy  
3. `ADMIN_WALLETS` set  
4. HTTPS only public URL  
5. Keep SOL settlement flags off until legal + escrow review  
