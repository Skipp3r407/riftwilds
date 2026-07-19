# Distribution Engine

## Purpose

Turn verified Project Treasury balance into an idempotent payout plan across destination wallets.

## Rules

1. Active splits must sum to **10_000 bps (100%)**.
2. Floor division per line; remainder lamports go to Development (fallback: first target).
3. `sum(lines) === gross` invariant enforced.
4. Amounts below `minDistributionLamports` are skipped (logged).
5. Amounts above `autoApprovalThresholdLamports` → `PENDING_APPROVAL` (manual).
6. Idempotency key `dist:{incomingIdempotencyKey}` prevents duplicate payouts.
7. Pause / emergency stop blocks execution (unless admin `force`).

## Code

- Plan builder: `src/lib/treasury-ops/distribution-engine.ts`
- Orchestration: `src/lib/treasury-ops/service.ts` (`queueDistributionForIncoming`, `executeDistribution`)
- Transfers: `src/lib/treasury-ops/transfer-engine.ts`

## Workflow

1. Incoming revenue verified → categorized.
2. Engine builds preview/plan from current `DistributionRuleSet`.
3. Auto path: enqueue → transfer engine (simulate or broadcast).
4. Manual path: approval record → admin approve → execute.
5. Ledger balances updated; audit log appended.

## Failsafe

- Failed lines → `failed_distributions` queue
- `POST /api/treasury-ops/retry` requeues (max 5 retries tracked)
- Notifications for approval / failure / emergency stop
