# Disconnect Recovery

## Heartbeat

- Client interval: 5s (`HEARTBEAT_INTERVAL_MS`)
- Miss TTL: 20s → session enters `RECONNECTING`
- Reconnect grace: 60s (`RECONNECT_GRACE_MS`)

## Flow

1. Tab close / scene shutdown → force autosave + `POST /api/persistence/disconnect`
2. Session status `RECONNECTING` with deadline
3. Rejoin → `session/start` or `disconnect` action `reconnect`
4. Restore chain: active session → save state → safe checkpoint → default spawn

## Combat disconnect

- `invulnerable: false` always
- Encounter may resolve against the player after grace (stub flag `resolveAsLossAfterGrace`)
- UI warning: reconnect carefully — no free escape

## Position anti-exploit

Heartbeat rejects absurd same-map teleports (`MAX_POSITION_DELTA_PER_HEARTBEAT`). Region changes must go through travel, not heartbeat.
