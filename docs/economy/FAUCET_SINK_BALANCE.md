# Faucet ↔ Sink Balance

Every Credit source is paired with sinks so Credits stay meaningful.

| Faucet | Primary sinks | Cap highlights |
|--------|---------------|----------------|
| QUEST_REWARD | NPC shop, repair, travel, restoration | 200/grant, 800/day |
| DAILY_GOAL | Shop, craft fee, service | 150/day |
| WEEKLY_GOAL | Housing, restoration, marketplace fee | 200/day |
| GATHER | Craft fee, repair, shop | cooldown 20s, 120/day |
| CRAFT | Listing fee, shop | cooldown 30s, 200/day |
| EVENT_REWARD | Restoration, travel | 300/day |
| JOB_BOARD | Travel, craft, shop | 300/day |
| ACHIEVEMENT | Housing, restoration | one-time keys |
| RIFTLING_BONUS | Shop, service | max 15/user/day, 3 pets |
| NPC_SELL_BACK | (anti-loop) | 35% of buy, 200/day |

## Circulation exits (burns)

- NPC / global shop purchases  
- Repair, travel, housing, craft fees  
- Marketplace listing + sale fees  
- **Restoration donations** (explicit burn)  
- **Premium hatchery eggs** (`EGG_PURCHASE`, 5_000 Credits) — available when the free starter pool is exhausted or the keeper already claimed free. Soft currency only; never SOL.

## Anti-farming

- Idempotent request IDs  
- Daily caps + cooldowns  
- Rate limits on `/api/credits/transact`  
- Sell-back discount prevents buy→sell printers  
- Marketplace abuse detectors stubbed (no auto-ban)

## Admin

Health: `/admin/economy/credits` and `GET /api/credits/health`.  
Config changes are manual — no extreme auto-tuning.
