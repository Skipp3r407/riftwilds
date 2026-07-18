# Refunds and Disputes

- Refund ledger stub: `src/lib/economy/sol/policy/refunds.ts`
- States: REQUESTED → REVIEW → APPROVED/DENIED → REFUNDED
- Events appended to immutable EconomyLedger (`REFUND` / `DISPUTE`)
- Settlement states include `REFUND_REVIEW`, `REFUNDED`, `DISPUTED`
- No automated SOL return until rails + legal policy approved
