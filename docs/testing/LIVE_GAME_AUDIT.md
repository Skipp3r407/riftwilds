# Live Game Audit — Riftwilds

**Auditor session:** 2026-07-17  
**Verdict target:** READY FOR CLOSED ALPHA (see PRODUCTION_READINESS.md)

## 1. Discovery

- Next.js 16 App Router app (`project-hatch` / Riftwilds)
- ~85 `page.tsx` routes + large API surface
- Feature flags centralize risky money paths (defaults OFF)
- No public deploy found; local prod on `:3002`

## 2. Automated gates (executed)

| Check | Result |
|-------|--------|
| `npm run typecheck` | PASS |
| `npm run lint` | PASS (0 errors, minor unused-var warnings) |
| `npm run test` | PASS — 26 files / **157 tests** |
| `npm run build` | PASS after wallet provider fix; no WalletContext SSG throw |
| Smoke pages (dev, earlier) | PASS with degraded `/api/ready` |
| Prod route timings | See PERFORMANCE_REPORT — most pages &lt;150ms TTFB local |
| Hatchery cookie round-trip (prod) | PASS claim→eggs=1→hatch |
| Rewards/treasury APIs | PASS; framing rejects buy→SOL |
| Assets scan | Generated **295**, pending **136** (NPC/enemy/anim backlog) |

## 3. Deployed / wallet / mainnet

| Item | Result |
|------|--------|
| `riftwilds.io` | DNS not resolved |
| `.vercel` | Not present |
| `NEXT_PUBLIC_APP_URL` | localhost |
| Wallet mainnet / real SOL | **NOT VERIFIED** — not attempted (policy) |
| Pump.fun mint | `COMING_SOON` / unset |
| Postgres `/api/ready` | **503** locally |

## 4. Gameplay paths exercised

- Hatchery demo claim/hatch (API + cookie) — **PASS**
- Marketplace/shop HTTP — **PASS** (demo)
- Rewards/treasury HTTP — **PASS** (demo, claims off)
- Live World page — **PASS** load (not full multiplayer session)
- About story — **PASS** content

## 5. Honesty labels

Demo/stub surfaces retain Demo / stub / claims-off language (marketplace, social, treasury buckets). Fake reward SOL not fabricated from token buys (unit test `community-rewards-messaging`).

## 6. Parallel agent note

Other agents may still be filling NPC/enemy portraits. Critical P2 bosses + P3 world overviews + starter pet portraits + affinity icons + key story NPCs generated in this session. Remaining missing assets documented in MISSING_ASSETS.md — not P0 for closed alpha if placeholders/fallbacks exist.
