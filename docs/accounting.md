# Treasury accounting

## Ledger model

1. **Ingest** — verified deposit increases Project Treasury balance.
2. **Categorize** — `sourceKey` / category tags for analytics.
3. **Distribute** — decreases Project Treasury; increases destination wallets (simulated or confirmed).
4. **Audit** — immutable append-only ops log in state / Prisma proposal.

## Reports

- Period stats: daily / weekly / monthly / annual
- By source / by wallet
- Treasury Health Score (0–100)
- Export via `POST /api/treasury-ops/reports`

## Notes

- Demo balances are ops accounting, not guaranteed on-chain truth until RPC verification is live.
- Marketplace Credits fees can soft-hook into ops ledger without moving player SOL.
- No automatic holder dividend journal entries are created for “holding tokens.”
