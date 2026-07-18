# Transaction Lifecycle

## States

`CREATED` → `AWAITING_SIGNATURE` → `SUBMITTED` → `CONFIRMED` → `FINALIZED`

Terminal / exception: `FAILED`, `EXPIRED`, `CANCELED`, `REFUND_REVIEW`, `REFUNDED`, `DISPUTED`

Module: `src/lib/economy/sol/transaction-states.ts`

## Rules

- Never grant ownership from a client success screen.
- `FINALIZED` requires server-verified tx signature.
- Entitlements grant only when `mayGrantEntitlement(state)` is true (`FINALIZED`).
- Idempotency via `requestId` on orders, entitlements, and EconomyLedger.

## Verification checklist (when live)

Signature, network, program/recipient, sender, recipient, asset, amount, block time, confirmation, uniqueness.
