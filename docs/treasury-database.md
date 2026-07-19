# Treasury Ops Database

## Local store (active now)

Path: `.data/treasury-ops/state.json` (gitignored)  
Module: `src/lib/treasury-ops/store.ts`

Persists forever across local restarts:

- wallets, balances, rules, incoming, processed
- distributions, pending, failed, approvals
- audit logs, reports, notifications, seen signatures
- system settings

## Prisma proposal (production-ready)

Appended to `prisma/schema.prisma` (do not migrate until approved):

| Model | Maps to |
|-------|---------|
| `ProjectTreasuryWallet` | treasury_wallets |
| `ProjectWalletBalance` | wallet_balances |
| `ProjectDistributionRules` | distribution_rules |
| `ProjectIncomingTransaction` | incoming_transactions |
| `ProjectProcessedTransaction` | processed_transactions |
| `ProjectDistributionHistory` | distribution_history |
| `ProjectPendingDistribution` | pending_distributions |
| `ProjectFailedDistribution` | failed_distributions |
| `ProjectManualApproval` | manual_approvals |
| `ProjectTreasuryAuditLog` | audit_logs |
| `ProjectTreasurySystemSettings` | system_settings |
| `ProjectTreasuryReport` | treasury_reports |

Existing community economy models (`TreasuryWallet`, `RevenueDeposit`, …) remain for the ecosystem reward policy surface and are **not** replaced by Project Treasury Ops.
