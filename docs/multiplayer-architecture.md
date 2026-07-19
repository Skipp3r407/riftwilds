# Multiplayer Architecture — Riftwilds TCG

> **Status:** Design + light scaffolding only. Ranked / realtime MP are **not implemented**.  
> Do not claim completion in UI copy.

---

## 1. Current state

| Surface | Reality |
|---------|---------|
| TCG Practice | Local/server in-memory match + AI; REST `/api/tcg/match/*` |
| Arena ranked/duels/tournaments | Code paths exist; product flags mostly **false** |
| Live World multiplayer | `multiplayer-client.ts` stub → `"local"` |
| Friends / presence | Soft/hot path; Prisma prepare-gated |

---

## 2. Target modes

1. **Training / AI** — Phase 1 (live)  
2. **Casual matchmaking** — Phase 4  
3. **Private rooms** (invite code) — Phase 4  
4. **Ranked** — Phase 5 (soft rating; no real-value wagering)  
5. **Spectate / replays** — Phase 5–6  
6. **Tournaments** — Credits first; SOL cups remain flag-gated OFF  

`REAL_VALUE_WAGERING_ENABLED` stays hard-false for launch compliance.

---

## 3. Authority model

**Server-authoritative match state** for all human vs human modes.

```
Client A ──actions──► Match Service ──snapshots──► Client A/B (+ spectators)
Client B ──actions──►       │
                            ▼
                     Event log / replay store
```

Practice AI may remain colocated with Next API routes until load demands a worker.

---

## 4. Protocol sketch (Phase 4+)

- Transport: WebSocket (or existing Arena protocol patterns in `docs/ARENA_ARCHITECTURE.md`)  
- Messages: `MATCH_JOIN`, `ACTION`, `SNAPSHOT`, `CLOCK`, `CHAT_SOFT`, `RESIGN`, `RECONNECT`  
- Anti-cheat: never trust client RNG, deck lists validated server-side from owned binder  
- Clocks: server turn deadline; graceful timeout = auto END_TURN or mulligan skip  

Reuse lessons from Arena REST Phase 1 → protocol Phase 2 docs; **do not** fork a second combat ruleset — TCG engine is primary.

---

## 5. Matchmaking

- Casual: skill-agnostic short queue + bot expand if timeout  
- Ranked: soft MMR / Arena-like rating tables (extend `ArenaRating` patterns carefully — or TCG-specific rating table when approved)  
- Private: room code + optional password hash  

---

## 6. Live World coexistence

Habitat MP and TCG MP are separate services. World encounters open TCG via URL bridge; they do not share tick loops.

---

## 7. Scaffolding allowed now

- Types for `MatchMode = practice | casual | ranked | private`  
- Docs + status checklist  
- No fake “Online” green lights  

---

## 8. Out of scope until Phase 4

- Realtime battle WS service  
- Cross-region dedicated servers  
- Spectator CDN  
- SOL tournament escrow  
