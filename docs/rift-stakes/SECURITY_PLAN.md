# Security Plan

- Server validates deck/turns/result; never trust client payout claims in production
- DEMO settle requires participant + explicit `claimSelfWinDemo` (replace with engine verify)
- Fee bps clamped server-side (max 500)
- Wallet optional everywhere except Rift Stakes entry
- Idempotent escrow transitions; closed escrows reject deposits
- Admin fee changes audited via store timestamps + fee history
