# Matchmaking (Rift Stakes)

**Isolated queue** keyed by stake tier. Never merges with `/api/rift-arena/queue` free play.

Join requires `confirmedStake`, `confirmedFee`, `confirmedPayout` booleans.

API: `POST /api/rift-stakes/queue`
