# DECK_CURVE_ANALYZER.md

## UI

Deck Atelier (`/tcg/deck-builder`):

- Energy curve bars 0–7+ (amber = affordable on turn 1)
- Live warnings: no T1 plays, thin early curve, too expensive, 0-cost cap
- Hard block when zero-cost count > `maxZeroCostPerDeck`

## Code

- `analyzeCurve` / `analyzeDeckCurveWarnings` — `src/game/tcg/rules/mana-curve.ts`
- Server legality — `validateConstructedDeck` (`MAX_ZERO_COST`)
- Client — `src/components/tcg/deck-builder.tsx`
