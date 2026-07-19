# API — Rift Arena & TCG matches

## TCG match (playable)

| Method | Path | Notes |
|--------|------|-------|
| POST | `/api/tcg/match/start` | Practice vs AI; sets guest cookie |
| POST | `/api/tcg/match/turn` | `PLAY_CARD` / `END_TURN` / `SURRENDER` |
| POST | `/api/tcg/match/invite` | Create private lobby → code + URL |
| GET | `/api/tcg/match/invite?code=` | Poll lobby / snapshot |
| POST | `/api/tcg/match/invite/join` | Join; starts private match when both seated |

## Rift Arena hub

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/rift-arena/status` | Hub payload (types, ladder, calendar, flags) |
| POST | `/api/rift-arena/queue` | Free matchmaking enqueue / cancel |
| GET | `/api/rift-arena/queue` | Queue size |
| GET | `/api/rift-arena/ladder` | Ladder scaffold |
| GET/PATCH | `/api/rift-arena/admin` | Pause / soft caps |

## Auth

Guest cookie `tcg_guest` or session cookie. Free play never requires wallet.

## Errors

- `MATCH_NOT_FOUND` — unknown id or wrong seat (after store fix, should not fire mid-practice)
- `SOL_ARENA_STAKES_DISABLED` — escrow scaffold reject
- `RIFT_ARENA_MATCHMAKING_PAUSED` — admin pause

---

## Project Treasury Ops

Full route table: **[treasury-api.md](./treasury-api.md)** (`/api/treasury-ops/*`).
