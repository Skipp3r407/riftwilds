# Rift Stakes Solana program (stub)

Not deployed. Server DEMO calls `riftStakesContract` with identical method names:

- `calculateFee`
- `transferFee`
- `transferPrize`
- `lockEscrow`
- `refundAll`

**Program config must set `max_fee_bps = 500` (5%).**

When implementing Anchor:

1. Escrow PDA per match
2. Deposit both sides → lock
3. Authority (server/oracle) settles winner
4. Fee ATA → treasury; remainder → winner
5. Refund path skips fee CPI

See `docs/rift-stakes/SMART_CONTRACT_FEES.md`.
