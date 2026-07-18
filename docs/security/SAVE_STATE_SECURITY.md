# Save State Security

## Threat model (Phase 1)

| Threat | Mitigation |
|--------|------------|
| Client fakes Credits on autosave | `stripUntrustedCategoryA`; Category A via ledger + `requestId` |
| Teleport via heartbeat | Max delta check; map changes rejected on heartbeat |
| Logout deletes items / charges SOL | Hard-rejected in `assertLogoutSafety` |
| Combat log for invulnerability | `combatDisconnectPolicy` → `invulnerable: false` |
| Replay autosave/logout | Idempotency keys (`WorldSaveIdempotency` / memory) |
| Session hijack | Owner key bound to auth/guest cookie; sessionId must match owner |
| Admin abuse | `/api/admin/sessions` requires `role === "admin"` + audit |

## Never trust client for

- Soft currency balances
- Ownership of eggs / creatures / inventory
- Marketplace settlement outcomes
- Combat victory / loot

## Rate limits

Persistence routes use `withApiGuard` buckets (`persistence-heartbeat`, `persistence-autosave`, etc.).

## Feature flags

- `WORLD_PERSISTENCE_ENABLED` — APIs on/off
- `WORLD_PERSISTENCE_PRISMA_ENABLED` — durable DB writes (default off until migrate)
- `SLEEPING_CHARACTERS_ENABLED` — default **false**
