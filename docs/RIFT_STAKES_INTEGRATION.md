# Rift Stakes integration (Battle Hub)

Rift Stakes remains a separate **backend / fee / escrow** system. The **player UI** is folded into Rift Battle as the **Rift Stakes** mode tab.

## Product rules

- Optional · SOL · wallet required
- Never mixed into free Practice / Casual / Ranked queues
- Fee transparency UI stays inside the Stakes tab (lobby preview + confirm dialog + fee treasury panel)
- Stakes tab content is **wager UI only** — no Free Practice / Free Arena exit links when `hubEmbedded`

## Routes

| Legacy | Now |
|--------|-----|
| `/rift-stakes` | redirect → `/tcg/battle?mode=stakes` |
| `/rift-stakes/history` | redirect → `/tcg/battle?mode=stakes&panel=history` |
| `/rift-stakes/leaderboard` | redirect → `/tcg/battle?mode=stakes&panel=leaderboard` |
| `/rift-stakes/treasury` | redirect → `/tcg/battle?mode=stakes&panel=treasury` |
| `/rift-stakes/match?id=` | **unchanged** (active stake duel) |
| `/api/rift-stakes/*` | **unchanged** |
| `/admin/rift-stakes` | **unchanged** |

## UI

- Hub panel: wallet connect, lobby / history / leaderboard / treasury sub-tabs
- Lobby component: `RiftStakesLobby` with `hubEmbedded` to hide free-mode links
- Status API `routes` point at hub URLs

Existing fee docs under `docs/rift-stakes/` remain authoritative for contracts and treasury math.
