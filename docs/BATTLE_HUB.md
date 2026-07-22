# Battle Hub

**Rift Battle** (`/tcg/battle`) is the central Battle Hub. Every PvP/PvE mode lives inside it. **Rift Stakes** is one optional SOL mode tab — not a separate app or primary sidebar item.

## Modes

| Tab | Purpose | Wallet |
|-----|---------|--------|
| Practice | AI sandbox, deck testing, Practice Board, tutorial | No |
| Casual | Quick match, friends, private room | No |
| Ranked | Season, ladder, MMR | No |
| AI | Difficulty, bosses, training | No |
| Tournament | Upcoming / live / hosted / guild cups | No |
| Rift Stakes | Stake tiers, queue, fees, escrow, history, leaderboard | **Required** |

Switching tabs uses `?mode=` on `/tcg/battle` and never leaves Battle.

## Practice Board

The live TCG board opens when:

- `?invite=` or `?encounter=` is present (deep links preserved)
- `?board=1` or `?play=1` (explicit board entry from Practice / AI CTAs)

Example: `/tcg/battle?mode=practice&board=1`

## Code

| Piece | Path |
|-------|------|
| Mode registry + redirects | `src/lib/tcg/battle-hub.ts` |
| Hub UI | `src/components/tcg/battle-hub.tsx` |
| Page | `src/app/(game)/tcg/battle/page.tsx` |
| Stakes lobby (embedded) | `src/components/rift-stakes/rift-stakes-lobby.tsx` (`hubEmbedded`) |

## History filters

Unified mode chips live on the hub footer and `/arena/history?mode=…`. Stakes history uses the Stakes tab panel (`?mode=stakes&panel=history`).

See also: [NAVIGATION_REDESIGN.md](./NAVIGATION_REDESIGN.md), [RIFT_STAKES_INTEGRATION.md](./RIFT_STAKES_INTEGRATION.md), [MATCHMAKING_FLOW.md](./MATCHMAKING_FLOW.md).
