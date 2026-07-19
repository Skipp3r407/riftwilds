# Treasury Monitoring Service

## Role

Watch the **Project Treasury Wallet** for SOL deposits, verify them, persist, and trigger the distribution engine.

## Behavior

| Concern | Implementation |
|---------|----------------|
| Polling | Admin/API tick (`pollIntervalMs`, default 15s) |
| RPC failover | Primary → fallback `getHealth` probe |
| WS | Config stub (`wsUrl`) — reconnect-ready |
| Rate limit | In-process min interval between ticks |
| Dedupe | `seenSignatures` + `idempotencyKey` |
| Confirmations | Compared to `minConfirmations` |

## Demo flow (local)

```http
POST /api/treasury-ops/monitor/tick
{ "force": true, "simulateDeposit": { "amountLamports": "50000000", "sourceKey": "pumpfun_creator_fees" } }
```

This simulates **Pump.fun creator fee → Project Treasury**, then auto-queues distribution when rules allow.

## Live path (future)

When `PROJECT_TREASURY_ADDRESS` is a real pubkey:

1. `getSignaturesForAddress` / WS account subscribe
2. Parse transfer amount + sender
3. Wait confirmations
4. `ingestRevenue` with on-chain signature as idempotency key

## Code

`src/lib/treasury-ops/monitor.ts`
