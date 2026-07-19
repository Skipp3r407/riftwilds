# Treasury Ops API

Base: `/api/treasury-ops`  
Flag: `TREASURY_OPS_ENABLED`  
Writes: admin session required.

## Read

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/treasury-ops` | Full dashboard snapshot |
| GET | `/api/treasury-ops/balance` | Balances + health |
| GET | `/api/treasury-ops/history` | Incoming, distributions, audit |
| GET | `/api/treasury-ops/analytics` | Periods, by source/wallet, health |
| GET | `/api/treasury-ops/reports` | Saved reports |
| GET | `/api/treasury-ops/config` | Admin settings/wallets/rules/adapters |
| GET | `/api/treasury-ops/approvals` | Pending approvals |

## Write (admin)

| Method | Path | Body highlights |
|--------|------|-----------------|
| POST | `/api/treasury-ops/ingest` | Receive revenue via adapter (`sourceKey`, `amountLamports`) |
| POST | `/api/treasury-ops/distribute` | Execute / preview (`distributionId`, `previewGrossLamports`) |
| POST | `/api/treasury-ops/pause` | `{ emergency?: true }` |
| POST | `/api/treasury-ops/resume` | Resume + clear emergency |
| POST | `/api/treasury-ops/update-rules` | `{ splits, minDistributionLamports, … }` |
| POST | `/api/treasury-ops/retry` | `{ failedId? }` |
| POST | `/api/treasury-ops/monitor/tick` | `{ simulateDeposit?, force? }` |
| POST | `/api/treasury-ops/config` | settings / wallet address / add wallet |
| POST | `/api/treasury-ops/approvals` | `{ distributionId, approve, executeAfter? }` |
| POST | `/api/treasury-ops/reports` | Export period report |

## Local test: monitor → distribute

1. Sign in as admin.
2. Open `/admin/treasury`.
3. Click **Simulate Pump.fun deposit** (or call monitor tick API).
4. If below approval threshold, click **Execute next distribution** (or auto when queued).
5. Confirm balances move in demo ledger; history shows `SIMULATED` lines.
