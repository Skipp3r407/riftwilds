# Rift Stakes

Optional SOL wager PvP for Riftwilds. **Separate** from Casual / Ranked / Training / Practice.

## Absolute rules

- Free modes never require SOL or a wallet.
- Never auto-enroll; confirm stake, fee, and payout before queue join.
- Server-authoritative winner — clients cannot trigger real payouts.
- Platform fees apply **only** to Rift Stakes.

## Feature flag

| Flag | Default | Notes |
|------|---------|-------|
| `RIFT_STAKES_ENABLED` | `true` when `NODE_ENV !== "production"`, else `false` | Or set env `RIFT_STAKES_ENABLED=true` |
| `RIFT_STAKES_ONCHAIN_ENABLED` | `false` | Real chain; DEMO uses identical API |
| `RIFT_STAKES_TREASURY_UI_ENABLED` | `true` | Public fee transparency |

## Routes

| Surface | URL |
|---------|-----|
| Lobby (canonical) | `/tcg/battle?mode=stakes` |
| Lobby (legacy) | `/rift-stakes` → redirects to hub |
| Match | `/rift-stakes/match?id=…` |
| History | `/tcg/battle?mode=stakes&panel=history` (legacy `/rift-stakes/history` redirects) |
| Leaderboard | `/tcg/battle?mode=stakes&panel=leaderboard` |
| Fee treasury | `/tcg/battle?mode=stakes&panel=treasury` |
| Admin | `/admin/rift-stakes` |
| Free practice | `/tcg/battle?mode=practice&board=1` |
| Free arena | `/arena` |
| Battle Hub | `/tcg/battle` |

See `docs/RIFT_STAKES_INTEGRATION.md` and `docs/BATTLE_HUB.md`.

## Live vs DEMO

| Piece | Status |
|-------|--------|
| Lobby + confirmation UI | **Live** (local) |
| Fee math + hard max 5% | **Live** |
| Separate matchmaking queue | **Live** (in-memory / `.data/rift-stakes`) |
| Escrow state machine | **Live DEMO** (simulated txs) |
| On-chain Solana program | **Stub interface** — `contracts/rift-stakes/` |
| Engine-verified payout | **DEMO self-settle** only; production must use match engine |

## Related docs

- [FEE_SYSTEM.md](./FEE_SYSTEM.md)
- [ESCROW_FEES.md](./ESCROW_FEES.md)
- [TREASURY_SYSTEM.md](./TREASURY_SYSTEM.md)
- [ESCROW_SYSTEM.md](./ESCROW_SYSTEM.md)
- [SECURITY_PLAN.md](./SECURITY_PLAN.md)
