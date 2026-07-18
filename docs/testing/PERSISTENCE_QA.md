# Persistence QA

## Automated

```bash
npx vitest run tests/unit/persistence-save-logout.test.ts tests/unit/persistence-session.test.ts
```

Coverage:

- Safe logout at inn/camp writes checkpoint
- Unsafe logout restores to last safe checkpoint
- Logout never accepts SOL charge / item delete flags
- Heartbeat + reconnect grace
- Combat disconnect → not invulnerable
- Autosave idempotency
- Position fallback chain
- Category A fields stripped from playState

## Manual checklist

- [ ] Enter Live World → pause → Rest / Log out in plaza → countdown → cancel works
- [ ] Complete safe logout → re-enter at same rest zone
- [ ] Walk to outer woods (unsafe) → logout warning → re-enter at last safe checkpoint
- [ ] Kill tab mid-session → rejoin within 60s reconnects or restores save
- [ ] Credits purchase still immediate via ledger (independent of autosave)
- [ ] Confirm no SOL charge and inventory intact after logout

## Migration

`prisma/migrations/20260718060000_world_persistence/` is **prepared only**. Do not apply to production without approval.
