# Credits / Content Roadmap — Phases 2–28 Status

**Updated:** 2026-07-18  
**Scope:** COMPLETE GAME CONTENT / AI NPC / MAP GOALS / CREDIT ECONOMY

| Phase | Title | Status | Notes |
|------:|-------|--------|-------|
| 2 | Content generation architecture | **Done** | `src/content/*`, `src/lib/content/validate.ts` |
| 3 | Region map goals + Map Goals panel | **Done** | Commons + regions; Live World toggle |
| 4 | AI NPC system (safe fallback) | **Done** | Template + authored; never grants Credits |
| 5 | Credit earning paths | **Done** | Faucets + `/api/economy/credits-action` |
| 6 | Credit sinks | **Done** | Shops, repair, travel, restoration, care, fees |
| 7 | Economy balancing engine | **Done** | Config caps + health alerts (no auto-extreme) |
| 8 | Reward diversity | **Done** | Quests/jobs/events/goals/achievements/riftling |
| 9 | Anti-farming | **Done** | Idempotency, caps, cooldowns, sell-back 35% |
| 10 | NPC Job Board | **Done** | Content + `job_complete` action |
| 11 | Public world events | **Done** | Content + `event_reward` action |
| 12 | World restoration economy | **Done** | `RESTORATION_DONATION` burn |
| 13 | NPC shops | **Done** | Server debit + inventory grant; anti-loop sell-back |
| 14 | Marketplace economy fees | **Done** | BPS fee helpers + abuse stubs |
| 15 | Riftling economy (capped) | **Done** | Hard daily/pet caps |
| 16 | Daily/weekly goals | **Done** | Content + actions |
| 17 | Achievements | **Done** | Small one-time Credits via faucet |
| 18 | AI content creation + validation | **Partial** | Deterministic NPC AI; external LLM stubbed |
| 19 | Content validation | **Done** | `npm run validate:content` |
| 20 | Admin Content Studio | **Done** | `/admin/content` shell |
| 21 | Credit ledger (Prisma) | **Done** | Memory hot path + optional Prisma sync |
| 22 | Economy invariants | **Done** | Integer, AI block, idempotency tests |
| 23 | Player economy dashboard | **Done** | `/economy/credits` + wallet |
| 24 | Economy help page | **Done** | `/economy/credits` guide |
| 25 | Full playability test path | **Done** | `playthrough.ts` + Live World HUD chip |
| 26 | Economy simulations | **Done** | `npm run simulate:credits` |
| 27 | Automated tests | **Done** | `npm run test:credits` (15 tests) |
| 28 | Required reports | **Done** | `docs/economy/*`, `docs/content/*`, artifacts |

## Remaining honest blockers

1. **Prisma sync** only writes when a real `User` row exists; demo keepers stay memory-only (resets on deploy).
2. **External LLM** for NPC dialogue remains stubbed (authored fallback always works).
3. **8 regions** remain scaffold packs (structure complete; Ember / Moonwater / Elderwood / Commons are full).
4. Parallel WIP (audio, header, premium Live World) — Credits HUD/shop path integrates without replacing movement systems.

## Credits ≠ money

Credits are soft gameplay currency. Not SOL. Not a token claim. Not investment advice.
