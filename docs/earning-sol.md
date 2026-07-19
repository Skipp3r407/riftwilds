# Earning SOL (optional entertainment rewards)

## Hard rules

- **No guaranteed SOL**, profit, passive income, or “play-to-earn grind.”
- Wallet is **optional**. Soft play never requires it.
- Competitive power is never purchased with SOL.
- Reward ranges in the UI are **estimates for entertainment**, not forecasts.

## How optional SOL can appear (when funded & flagged)

| Path | Mechanism | Status |
|------|-----------|--------|
| Marketplace fee share | Verified fee settlements → Community Reward Vault epochs | Partial (Credits desk live; SOL escrow off) |
| Tournaments | Optional prize pools (flags off by default) | Partial / config stubs |
| Creator cut | Verified cosmetic purchase allocations | Partial / scaffold |
| Achievement promo | Admin-funded rare promo drops | Scaffold |
| Esports / sponsorship | Announced prize bands only | Coming |
| Referrals | Credits/cosmetics only until anti-abuse live | Scaffold |

## What does **not** earn SOL

- Buying the launch token
- Connecting a wallet alone
- Grinding matches for a promised payout
- Holding pets solely because a coin was purchased

## Player-facing copy checklist

Allowed: “optional reward,” “illustrative range,” “when funded,” “entertainment.”  
Forbidden: “guaranteed earnings,” “passive income,” “ROI,” “invest to earn.”

Implementation: `src/lib/exchange/disclaimers.ts`, `src/lib/exchange/earning-methods.ts`.

## Preview

- Hub: `/exchange`
- Claims framing: `/rewards`
- Marketplace path: `/marketplace`
