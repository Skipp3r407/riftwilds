# Player Fee UI

## Confirmation dialog (required before queue)

Visible fields:

1. Your entry (SOL)
2. Opponent entry (SOL)
3. Prize pool (SOL)
4. Platform fee % and amount
5. Estimated network fee (display only)
6. Winner receives (SOL)

Label chip: **Optional · Real SOL**

Component: `src/components/rift-stakes/stake-confirm-dialog.tsx`

## Match screens

Always show fee / pot / escrow phase / tx stubs until settle or refund.

## Copy rules

- Never imply free modes charge fees
- Never guarantee earnings
- Cancelled → “No platform fee charged”
