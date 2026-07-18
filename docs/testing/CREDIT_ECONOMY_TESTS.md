# Credits & Content Tests

## Commands

```bash
npm run test:credits
npm run validate:content
npm run simulate:credits
```

## Coverage

| Test file | Asserts |
|-----------|---------|
| `tests/economy/credit-ledger.test.ts` | Idempotency, integers, AI block, daily caps, sell-back, Riftling caps |
| `tests/economy/credit-playthrough.test.ts` | Full earn/spend path |
| `tests/economy/credit-actions.test.ts` | Quest/job/shop/event/restore actions |
| `tests/economy/npc-ai-rewards.test.ts` | `grantsRewards: false`, reward social-engineering blocked |
| `tests/content/content-validation.test.ts` | Packs, 3 starter goals, faucet↔sink pairings |

## Acceptance checklist

- [x] Server-authoritative integer ledger module  
- [x] Caps/cooldowns/validation on faucets  
- [x] Sinks including restoration burns  
- [x] AI cannot grant unauthorized rewards  
- [x] Playthrough harness earns + spends  
- [x] Prisma persistence bridge (writes when User exists; demo keepers memory-only)  
- [x] Live World shop/quest path uses ledger API (localStorage mirrors balance)

## No real SOL

All tests use in-memory Credits. No mainnet, no wallet spend.
