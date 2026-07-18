# Riftwilds Economy Loop

This is the intended player and treasury flywheel. It is **not** a promise of profit, guaranteed SOL, or guaranteed token appreciation.

```
Player buys coin
        │
        ▼
Gets an Egg
        │
        ▼
Egg Hatches
        │
        ▼
Pet must be fed
        │
        ▼
Player buys food/items
        │
        ▼
Marketplace fees
        │
        ▼
Treasury grows
        │
        ▼
Community events
        │
        ▼
More players join
        │
        ▼
Optional creator allocations (verified)
        │
        ▼
Eligible pets share Community Reward Treasury
```

**Legal / messaging:** Buying the Pump.fun coin does **not** automatically generate SOL for pet owners. See `docs/COMMUNITY_REWARDS.md`.


## Stage mapping

| Stage | Game system | Status |
|-------|-------------|--------|
| Buy coin | Pump.fun / SPL mint + wallet verify | Token gate live; mint placeholder |
| Get egg | Free starter claim (limited pool) + premium Credits buy when free is gone | Live (demo store); durable Prisma later |
| Hatch | Server CSPRNG hatch | Phase 2 |
| Feed / care | Care actions + food items | Phase 3 |
| Buy food/items | Inventory shop (soft currency / demo credits first) | Phase 3–6 |
| Marketplace fees | Listing fee → treasury ledger | Demo credits first; SOL escrow off |
| Treasury grows | Immutable `CurrencyLedger` / treasury metrics | Scaffolded |
| Community events | Bosses, seasons, shared goals | Phase 6 |
| More players | Growth loop (organic) | Ongoing |
| Optional creator allocations | External fees → verified project deposit when allocated | Observed; never auto per-buy pet SOL |
| Community Reward Treasury | Feature-flagged distributions to **eligible living** pets | **Disabled by default** |

## Safety rules

1. `REAL_MONEY_REWARDS_ENABLED = false` until legal + audit + treasury health checks.  
2. Epoch rewards only go to **living, non-critical, non-memorialized** pets that meet care eligibility.  
3. Rewards are capped per user, per pet, and globally per epoch.  
4. Marketplace fees are transparent (BPS published on Transparency page).  
5. Never imply passive income or guaranteed returns.  
6. Never claim that buying the Pump.fun coin automatically pays pet owners in SOL.  
7. Demo-credit economy can run the full loop without real SOL.  

## Eligibility (epoch rewards)

A pet is eligible when all are true:

- Lifecycle not in `DORMANT`, `CRITICAL`, `MEMORIALIZED`, `RETIRED`  
- Owner completed minimum care actions in the epoch window  
- Not listed on marketplace during the reward commit  
- Owner accepted current risk disclosure (if real-money mode)  
- Per-epoch claim not already paid (`IdempotencyKey` / `RewardLedger`)  

## Implementation modules

- `src/lib/config/economy.ts` — tunables  
- `src/lib/config/treasury-policy.ts` — versioned 60/20/10/5/5 allocation + marketplace fee split  
- `src/game/economy/flywheel.ts` — stage definitions  
- `src/game/economy/treasury.ts` — fee → treasury math  
- `src/game/economy/epoch-rewards.ts` — eligibility + caps  
- `src/lib/rewards/provider.ts` — pluggable reward provider  
- `src/components/economy/*` — public UI (donut, FAQ, care, eligibility, summaries)  
- `/economy` — full public treasury & rewards page  
- `/admin/economy` — policy / emergency control shell  
- Prisma models: `TreasuryWallet`, `RevenueDeposit`, `AllocationPolicy`, `RewardEpoch`, `PetRewardClaim`, `PetCareState`, …  

## Public nav

Play · Hatchery · World · Marketplace · **Economy** · Token · Transparency  
