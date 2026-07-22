# Matchmaking flow (Battle Hub)

## Free modes

| Mode | Entry | Queue surface |
|------|-------|---------------|
| Practice | Battle Hub → Practice → Practice Board | Local / invite / AI on `/tcg/battle?board=1` |
| Casual | Hub → Casual | Free Arena queue (`/arena`), friends, private invite board |
| Ranked | Hub → Ranked | Arena ranked ladder (`/arena/ranked`) — free MMR |
| AI | Hub → AI | Practice Board + training grounds |
| Tournament | Hub → Tournament | `/arena/tournaments`, guilds, calendar |

Free queues never share matchmaking with SOL stakes.

## Rift Stakes

1. Open `/tcg/battle?mode=stakes` (or legacy `/rift-stakes` redirect)
2. Connect wallet
3. Pick stake tier → fee preview → confirm dialog
4. `POST /api/rift-stakes/queue` join
5. On match → `/rift-stakes/match?id=…`

APIs: lobby preview `POST /api/rift-stakes/lobby`, status `GET /api/rift-stakes/status`.

## Invites

TCG invite deep links keep opening the Practice Board directly:

`/tcg/battle?invite=CODE` → board (hub skipped)

See `docs/rift-stakes/MATCHMAKING.md` for stakes-only queue details.
