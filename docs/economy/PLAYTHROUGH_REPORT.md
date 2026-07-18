# Credits Playthrough Report

**Harness:** `src/lib/credits/playthrough.ts`  
**Test:** `tests/economy/credit-playthrough.test.ts` + `credit-actions.test.ts`  
**Sim:** `npm run simulate:credits`

## Scenario

1. Starter grant (idempotent)  
2. Quest rewards (q1, q2)  
3. Daily goal  
4. Gather → craft fee → craft reward  
5. Job board  
6. NPC shop buy → discounted sell-back  
7. Travel + repair  
8. Restoration donation (burn)  
9. Marketplace fee  
10. Capped Riftling bonus  
11. AI grant attempt (must fail)

## Live World path

1. Enter Live World — Credits chip shows server balance  
2. Complete starter quest talk — pending grants flush to ledger  
3. Open NPC shop — buy debits via `/api/economy/credits-action`  
4. Map Goals panel — suggests capped earn + paired sinks  

## Results (2026-07-18)

From `npm run test:credits` + `npm run simulate:credits` + `npm run validate:content`:

| Metric | Value |
|--------|-------|
| Playthrough passed | **true** |
| Earned | 360 |
| Spent | 110 |
| Final balance | 250 |
| Unit tests | **15/15 passed** |
| Content validation | **OK** (12 packs, 39 map goals, 0 errors) |
| 7/30/90 day model sink ratio | 0.35 (OK) |

Machine-readable: `artifacts/reports/credit-economy-simulator.json`
