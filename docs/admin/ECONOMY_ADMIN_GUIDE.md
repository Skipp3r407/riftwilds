# Economy Admin Guide (SOL layer)

## Surfaces

| Surface | Path |
|---------|------|
| Admin SOL panel | `/admin/economy/sol` |
| Admin API | `GET /api/admin/economy/sol` (role=admin) |
| Public status | `GET /api/economy/sol/status` |
| Credits admin | `/admin/economy/credits` |
| Freeze ops | `src/lib/economy/admin-ops.ts` |

## Rules

1. Never silently edit completed ledger rows.
2. Do not flip SOL_* flags in production without legal + escrow sign-off.
3. Financial mutations require role, reason, audit, confirmation.
4. Prefer Credits/Gold ops for player support while SOL is off.

## Freeze

Existing marketplace/shop freeze toggles in admin-ops remain the soft kill switch.
