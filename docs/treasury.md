# Treasury

Riftwilds has two complementary treasury surfaces:

## 1) Project Treasury Ops (automated finance)

**Pump.fun creator fees → one Project Treasury Wallet → monitor → distribute.**

- Admin: `/admin/treasury`
- Docs: [treasury-system.md](./treasury-system.md)
- APIs: [treasury-api.md](./treasury-api.md)
- Default split: 35% Dev / 20% Marketing / 15% Tournament / 10% Community / 10% Creator / 5% Emergency / 5% Liquidity

Never auto-pays all holders. Never enables player P2W escrow.

## 2) Community Treasury (ecosystem transparency)

Transparent buckets for growth, rewards, events, ops, and reserves.

- Public: `/treasury`
- API: `GET /api/treasury`
- Exchange bars: `/exchange#treasury` via `src/lib/exchange/treasury-allocation.ts`

Balances may show **N/A** until verified ledgers sync — that means unknown, not “zero forever.”

### Community allocation (display policy)

| Bucket | % | Note |
|--------|---|------|
| Reward vault | 40 | Verified fees / deposits — not token buys |
| World growth | 25 | Content & Live World |
| Events & creators | 15 | Festivals, grants, creator hub |
| Operations | 15 | Infra, support, integrity |
| Reserves | 5 | Emergency only |

## Disclosures

- Buying the launch coin does not create pet / keeper SOL income.
- Distributions claimable only after epochs finalize with verified deposits (claims flagged off by default).
- Community treasury funds events/challenges — **never** automatic holder dividends.

Deeper architecture: `docs/economy/TREASURY_ARCHITECTURE.md` · Ops automation: `docs/treasury-system.md`.
