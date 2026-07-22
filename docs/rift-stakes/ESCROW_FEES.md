# Escrow Fees

Platform fee is taken **only after** a server-verified win, from the locked pot:

1. Both players deposit stake → escrow **LOCKED**
2. Match resolves server-side
3. `TransferFee(platformFee)` → treasury wallet
4. `TransferPrize(winnerReceives)` → winner

On cancel/disconnect refund path: `RefundAll` — **fee = 0**.

Estimated network fees are **display-only** and not deducted from the escrow pot.

Implementation: `src/game/rift-stakes/fees.ts`, `escrow.ts`, `contract-interface.ts`.
