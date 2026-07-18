# Treasury Architecture (SOL optional)

## Existing

- Revenue allocation policies: `src/lib/revenue/policies.ts`
- Marketplace fee band 90/5/3/1/1 (Credits / planned SOL)
- Treasury wallets labeled `COMING_SOON` in config — not production keys

## SOL marketplace fee default (scaffold)

| Destination | BPS |
|-------------|-----|
| Seller | 9000 |
| Platform | 500 |
| Creator royalty | 300 |
| Community fund | 200 |

Configured in `DEFAULT_SOL_MARKETPLACE_FEES`.

## Rules

- No production private keys in repo
- No mainnet treasury creation in this phase
- Withdrawals behind `SOL_WITHDRAWALS_ENABLED=false`
