# Safe Logout

## Zones

Logout-safe when standing in an **inn**, **home**, **camp**, or designated **settlement** rest area.

Catalog: `src/game/live-world/persistence/safe-logout-zones.ts`

Examples:

- Riftwild Commons — Keeper Rest Hall (INN), Keeper Row (HOME), Hatchery Camp (CAMP)
- Tidefall Coast — Tide Inn
- Regional entrance camps

## UX

1. Pause → **Rest / Log out…**
2. Server preview (`previewOnly: true`) returns safe/unsafe + zone
3. Countdown (~5s) with **Cancel**
4. Confirm commits logout

## Safe logout

- Writes `SafeLogoutCheckpoint`
- Updates `WorldSaveState` last-safe fields
- Optional rest bonus stub (disabled by default — never SOL)
- Sleeping character stub **OFF** unless housing privacy + flag + explicit opt-in

## Unsafe logout

- Warning copy explains restore to last safe checkpoint
- Progress (Category B) still flushed
- Position restored from last safe checkpoint on next join
- **No item deletion, no SOL charge**

## Combat

Safe rest logout is **blocked** while `inCombat`. Unsafe disconnect uses combat disconnect policy (no invulnerability).
