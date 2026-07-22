# Rift Stakes Treasury System

## Flow

```
Settled stake match
      ↓
Platform fee (≤5%) from pot
      ↓
Treasury wallet (single on-chain destination)
      ↓
Internal accounting allocation (book only)
  50% development
  20% tournaments
  15% community
  15% infrastructure
```

Chain transfer is **one** transfer to the treasury wallet. Bucket split is transparency/accounting — not separate on-chain splits in v1.

## Surfaces

| Surface | Path |
|---------|------|
| Public transparency | `/rift-stakes/treasury` |
| API | `/api/rift-stakes/treasury` |
| Admin | `/admin/rift-stakes` |

## Rules

- Fees **only** from Rift Stakes
- Refunds never credit treasury
- `treasuryPaused` skips charging (logged)
