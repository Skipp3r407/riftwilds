# Pet Care Testing

## Unit suites

| File | Focus |
|------|-------|
| `tests/unit/pet-care.test.ts` | Decay, feed/water, critical display, care score |
| `tests/unit/care-transitions.test.ts` | Multi-action recovery, lifecycle / public display |
| `tests/unit/pet-care-economy.test.ts` | Credits debit, idempotency, free Pet, Adventure energy, streaks, catalogs, display % |
| `tests/economy/credit-ledger.test.ts` | Ledger integrity (shared) |

## Run

```bash
npm run test:unit -- tests/unit/pet-care.test.ts tests/unit/care-transitions.test.ts tests/unit/pet-care-economy.test.ts
# or
npx vitest run tests/unit/pet-care-economy.test.ts
```

## Manual checklist (pet detail Care tab)

1. Open `/pets/{publicId}` → Care tab.
2. Confirm stats show integer **%** with colored bars.
3. **Pet** / **Rest** / **Sleep** succeed with 0 Credit change.
4. **Feed** reduces Credits by catalog cost; hunger rises; journal entry appears.
5. Repeat same `requestId` (devtools) → no second debit.
6. Hover actions → tooltip shows cost, cooldown, deltas, “never SOL”.
7. Starve energy → **Adventure** returns insufficient energy.
8. Care streak / XP chips update; inventory scaffolding visible.
9. Care FX + SFX fire on success (respect mute / reduced motion).

## Guarantees under test

- Integer Credit costs only
- Idempotent `requestId` replay
- Sink totals include `CARE_ACTION`
- Offline decay softer than linear full-rate
- Discovery bonus capped
- Streak milestones are cosmetics/titles, not Credits
