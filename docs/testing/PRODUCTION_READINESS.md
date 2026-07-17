# Production Readiness Decision

## Decision: **READY FOR CLOSED ALPHA**

Date: 2026-07-17

Not **READY** for unrestricted public mainnet launch.  
Not **NOT READY** — code-fixable P0/P1 found in audit were repaired; remaining blockers are external/ops or intentional demo scope.

## Why closed alpha

### Green

- Production build succeeds
- Typecheck + 157 unit tests pass
- Lint clean of errors
- Hatchery demo loop works with cookies on `next start`
- Wallet SSG crash fixed
- Money paths fail-closed
- Reward framing honest (deposit-backed / not buy→SOL)
- Critical art gaps for bosses/worlds/pets/affinities/key NPCs filled this session
- Local prod route smoke healthy
- Docs under `docs/testing/` complete with evidence

### External / intentional blockers (documented)

| Blocker | Owner |
|---------|-------|
| No public HTTPS URL (`riftwilds.io` unresolved) | Ops / DNS / Vercel |
| Postgres `/api/ready` 503 in audit env | Ops — Neon/DB |
| Wallet mainnet + Pump.fun mint live metrics | Ops + product launch |
| Hatchery in-memory (not durable) | Eng — Prisma persist before “live pets” marketing |
| SOL settlement / claims remain OFF | Product — keep until escrow + legal |
| NPC/enemy art backlog (136 pending) | Art pipeline — non-blocking with fallbacks |
| Full Playwright suite flaky on nav selectors — API/HTTP proof stronger | Eng — e2e hardening ongoing |

## Closed alpha allowed when

1. Deploy behind invite / private URL with HTTPS  
2. `DATABASE_URL` + migrate + seed healthy (`/api/ready` 200)  
3. `SESSION_SECRET` + `NEXT_PUBLIC_APP_URL` set  
4. SOL purchase/claim flags stay **false**  
5. Communicate demo hatchery may reset until persistence ships  

## Do not claim

- Public mainnet game economy live  
- Guaranteed pet SOL income  
- Full MMO multiplayer authority  
- Pump.fun graduation complete  

## Unblock to full READY

1. Persist hatchery/pets  
2. Public deploy verified (Playwright against prod URL)  
3. Disposable wallet SIWS on intended network (still no spend in audit)  
4. Treasury addresses real + transparency non-demo  
5. Asset approval pass for launch species/regions  

---

**GitHub push authorization:** Satisfied for closed-alpha tree with documented blockers — secrets scrubbed, `.env` not committed.
