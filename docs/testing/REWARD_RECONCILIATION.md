# Reward Reconciliation

**Audited:** 2026-07-17  
**Policy docs:** `docs/COMMUNITY_REWARDS.md`, `src/lib/revenue/disclosures.ts`

## Framing rule (enforced)

Pet / keeper rewards share a **Community Reward Treasury** funded only by **verified project-controlled deposits** (game revenue, marketplace fees, optional creator allocations).  

**Buying or trading the launch coin does NOT automatically generate SOL for pet owners.**

## Evidence

| Check | Result |
|-------|--------|
| Unit `community-rewards-messaging.test.ts` | PASS (in 157 suite) |
| `GET /api/rewards/center` | Framing: rewards from verified game revenue / fees — **not** from buying launch coin |
| `GET /api/treasury` | Demo buckets; `verified:false` / N/A balances until ledger |
| `GET /api/analytics/token` | Phase `awaiting_mint`; market nulls — no fabricated reward SOL |
| UI `/rewards` | Status claims-off; community treasury language |
| Feature flags | `REWARD_CLAIMS_ENABLED=false`, `REAL_MONEY_REWARDS_ENABLED=false` |

## Counter honesty

- Estimated / pending amounts must derive from vault ledger deposits + eligibility math (`vault-store`), never from Dexscreener buy volume.
- Transparency metrics may use `demoFallback:true` — labeled, not sold as live treasury SOL.
- Pet reward vault card copy states pets do not mint SOL from token buys.

## Gaps (documented, not fake-passed)

- Live deposit verification + epoch settlement not production-armed.
- On-chain atomic split OFF.
- Egg holder rewards flag OFF.

## Operator checklist before enabling claims

1. Multisig treasury addresses configured (not `COMING_SOON`)
2. Deposit verification webhook/RPC path tested on devnet
3. Legal review of disclosures
4. Flip `REWARD_CLAIMS_ENABLED` only after dry-run epoch
