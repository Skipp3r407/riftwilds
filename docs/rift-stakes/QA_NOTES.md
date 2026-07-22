# QA Notes — Rift Stakes

## Manual checklist (local)

1. `/tcg/battle` still loads without wallet / without stakes UI forcing enroll
2. `/arena` free queue unchanged
3. `/rift-stakes` shows **Optional · Real SOL** and fee preview
4. Confirm dialog lists entry, opponent, pot, fee %, fee amount, network est., winner receives
5. Join without confirmation flags → `CONFIRMATION_REQUIRED`
6. Two queue joins same tier → match → deposit both → DEMO settle → treasury fee logged
7. Refund → fee history `charged: false`
8. Admin fee > 500 bps rejected
9. Production build: `RIFT_STAKES_ENABLED` defaults false

## Tests

```bash
npx vitest run tests/unit/rift-stakes-fees.test.ts
```

## Local-only

Do not commit/push unless explicitly requested (paid deploys).
