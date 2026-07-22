# Fee System (Rift Stakes only)

## Defaults

| Setting | Value |
|---------|-------|
| Default platform fee | **2%** (200 bps) |
| Hard maximum | **5%** (500 bps) — server + contract config |
| Soft minimum | **0%** (promos / VIP) |

Fees are **never** charged on Casual, Ranked, Training, Practice, Story, or free Arena queues.

## Math (lamports, deterministic)

```
prizePool = stakePerPlayer * 2
platformFee = floor(prizePool * feeBps / 10_000)
winnerReceives = prizePool - platformFee
```

Invariant: `platformFee + winnerReceives === prizePool` (no silent shorting).

### Canonical example

Stake **0.10 SOL** each → pot **0.20 SOL**, fee **2%** → fee **0.004 SOL**, winner **0.196 SOL**.

## Refunds / cancels

**No platform fee.** Escrow refunds both deposits; fee history records `charged: false`.

## Rate resolution order

1. Active promotional event (may be 0%)
2. Qualifying VIP tier
3. Admin-configured default (clamped ≤ 5%)

## UI

See [PLAYER_FEE_UI.md](./PLAYER_FEE_UI.md). Confirmation dialog shows entry, opponent entry, pot, fee %, fee amount, est. network fee, winner receives — before Confirm.
