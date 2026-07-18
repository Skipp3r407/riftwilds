# Team sizes & mode stubs

## Team sizes

- **1v1** — playable (one active Riftling each)  
- **2v2 / 3v3** — scaffolded via `teamSize`, `benches`, and Switch stub events  

## Mode stubs

| Surface | Status |
|---------|--------|
| Matchmaking queues | `matchmaking.ts` enqueue/pair stubs |
| Ranked ladder | `ranked-ladder.ts` Elo-style + tier names |
| Spectator / replay | `replay.ts` event frames + `framesSince` sync stub |
| NPC AI | `ai.ts` Novice → Riftmaster |

Ranked UI at `/arena/ranked` documents care normalization and shows ladder stub entries.
