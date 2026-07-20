# Status Effects

Runtime statuses live on `TcgBoardUnit.statuses` (`src/game/tcg/combat/status.ts`).

| Status | Meaning |
|--------|---------|
| `taunt` | Guardian marker for UI / targeting |
| `ward` | Blocks next hostile spell |
| `poison` | Dawn damage per stack |
| `bloom_stacks` | Bloom counter |
| `awakened` | Awaken already resolved |
| `terrain_ward` | Temporary defense from Terrain |

Durations tick at turn start. `null` duration = sticky until removed.
