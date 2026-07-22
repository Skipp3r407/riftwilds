# Smart Contract Fees

Program interface (DEMO + future Anchor): `src/game/rift-stakes/contract-interface.ts`

| Method | Role |
|--------|------|
| `calculateFee` | Deterministic pot / fee / winner split; clamps ≤ `maxFeeBps` (500) |
| `transferFee` | Send platform fee to treasury wallet |
| `transferPrize` | Send `winnerReceives` to winner |
| `refundAll` | Return stakes; **no fee** |
| `lockEscrow` | Both deposits confirmed |

IDL / Rust stub: `contracts/rift-stakes/README.md`

Config constant: `MAX_FEE_BPS = 500` must match on-chain program config.
