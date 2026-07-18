# Pet Care Economy (Credits)

## Principle

**SOL is never required for basic care** (water, food, heal, clean, rest, happiness, progression).  
All paid care spends **integer Credits** through the authoritative ledger (`src/lib/credits/*`).

## Sink reasons

| Reason | Use |
|--------|-----|
| `CARE_ACTION` | Direct care button spends (Feed, Clean, Vet, …) |
| `CARE_ITEM` | Shop / catalog care item purchases |

Helpers: `spendCareAction`, `spendCareItem` in `src/lib/credits/sinks.ts`.

## Flow

1. Validate ownership, cooldown, energy (Adventure).
2. Ensure starter Credits for demo accounts.
3. `canAfford` → `debitCredits` with unique `requestId` (idempotent).
4. Apply care physics + trait bonuses + bond/stress tuning.
5. Update Care XP, streak, journal; track sink totals for economy health.

Free actions (Pet / Rest / Sleep) skip the debit. Adventure spends **energy**, not Credits.

## Catalog pricing (Credits)

Food / drink / tonics live in `CARE_ITEM_CATALOG` (`care-catalog.ts`), aligned with shop tunables (`FOOD_BASE_PRICE_CREDITS`, care shop policy). Craft recipe IDs are hooks for the crafting station.

Example ranges:

- Water / berries: ~20–55
- Meals / play / clean: ~35–90
- Groom / cook / train: ~55–80
- Medicine / vet / recovery: ~120–200

## Faucets paired to care sinks

`RIFTLING_BONUS` (capped) pairs to `CARE_ACTION` / `CARE_ITEM` so small care bonuses recirculate into care spends — never unlimited passive Credits.

## Streak rewards

Milestones grant **titles / badges / cosmetics only**. No Credit faucet from streak length.

## Economy health

`getEconomyHealth()` includes `sinkTotals.CARE_ACTION` / `CARE_ITEM` for underpressure alerts alongside other sinks.

## Disclaimer

Credits are in-game soft currency. Not SOL, not a token claim, not investment advice.
