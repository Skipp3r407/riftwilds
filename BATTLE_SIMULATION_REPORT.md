# Battle Simulation Report

**Runs:** 3000  
**Wall time:** 3.5s  
**Completed:** 3000 · **Errors:** 0

| Metric | Value |
|--------|-------|
| P1 (player) wins | 1544 |
| P2 (AI) wins | 1456 |
| Draws / null | 0 |
| First-player win rate | 51.5% (target 49–51%) |
| Avg turns | 12.19 |

## Path to 100k

```bash
TCG_SIM_COUNT=100000 npx tsx scripts/simulations/tcg-battle-rules-sim.ts
```

JSON: `artifacts/reports/tcg-battle-sim.json`
