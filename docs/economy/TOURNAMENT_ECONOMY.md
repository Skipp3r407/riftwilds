# Tournament Economy

## Available now

- **Free Rift Open** config (`FREE_TOURNAMENT_CONFIG`) — no entry fee
- Credits/Gold Training Cup via `src/lib/economy/tournament.ts`
- UI: `/arena/tournaments` — free cup visually available; SOL cup labeled disabled

## SOL entry

- Architecture + example pool math only
- `SOL_TOURNAMENTS_ENABLED=false`
- Registration with `entryCurrency: "SOL"` rejected while flagged off

## Forbidden

- Spectator betting (`spectatorBetting: false` always)
- Real-value wagering (see arena config — not listed as enableable)

## Prize example (documentation only)

100 players × 0.02 SOL → configurable player/ops/community split via BPS fields.
