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

## Soft purchase simulation (Phase 4)

Module: `src/lib/economy/sol/purchase-orders.ts`  
API: `POST /api/economy/sol/purchase` (`create` → `prepare` → `verify`)

- Creates expiring orders with price locked from server catalog
- Soft/devnet verify uses server-minted `sim_devnet_*` signature (client sig ignored for authority)
- Grants entitlements only after `FINALIZED`, idempotent on `requestId`
- Production / live chain verify remains blocked while `SOL_PURCHASES_ENABLED` / escrow are off
- UI panel: Wallet Center → “SOL purchase simulation”

## Verification checklist (when live)

Signature, network, program/recipient, sender, recipient, asset, amount, block time, confirmation, uniqueness.
