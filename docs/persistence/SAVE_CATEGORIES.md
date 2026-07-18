# Save Categories

| Category | Persistence | Interval | Examples |
|----------|-------------|----------|----------|
| **A — Critical** | Immediate ledger | None (on mutation) | Credits, ownership, marketplace settlement, hatchery purchase |
| **B — Progression** | Server autosave | ~15s + shutdown | Quests, position, region visits, combat counters |
| **C — Cosmetic** | Best-effort | ~60s | HUD prefs, emote cosmetics, audio |

## Rules

1. Category A **never** waits for autosave. Use `/api/credits/*`, inventory grant ledgers, marketplace settlement.
2. Autosave strips untrusted credit/ownership fields from client `playState` (`stripUntrustedCategoryA`).
3. `localStorage` is a cache. Crash recovery must restore A from ledgers and B from `WorldSaveState` / memory.
4. Domains banned as localStorage-only: credits balance, owned Riftlings, inventory ownership, marketplace settlement, permanent quest reward grants.

## Hooks

`notifyPersistenceHook(ownerKey, event)` in `src/lib/persistence/integration-hooks.ts` marks dirty flags for B/C and documents A events after ledger writes.
