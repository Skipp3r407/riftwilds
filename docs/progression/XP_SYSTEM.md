# Keeper Experience (XP) & Leveling System

**Authority:** `src/lib/progression/` · APIs under `/api/progression`  
**UI:** `/progression` · top-bar XP badge  
**Flag:** `KEEPER_PROGRESSION_ENABLED` (Prisma persist: `KEEPER_PROGRESSION_PRISMA_ENABLED`)

Server-authoritative. Clients send **source keys** (or `BATTLE_RESULT` / `QUEST_COMPLETE`), never raw XP amounts.

## Formula

```ts
function getXPForLevel(level: number) {
  return Math.floor(100 * Math.pow(level, 1.8));
}
```

Level-up loops while `currentXP >= required`, subtracts, recalculates; multi-level from one grant; excess XP is kept.

## Modules

| Module | Path |
|--------|------|
| Formula | `src/lib/progression/formula.ts` |
| Sources / tables | `src/lib/progression/sources.ts` |
| Calc (combo/boost/rested/anti-farm) | `src/lib/progression/calc.ts` |
| Rewards | `src/lib/progression/rewards.ts` |
| Persist | `src/lib/progression/persist.ts` |
| Service | `src/lib/progression/service.ts` |
| UI client | `src/lib/progression/client.ts` |

## API

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/progression` | GET | Snapshot (level, XP, stats, notifications) |
| `/api/progression/grant` | POST | Validated source grant |
| `/api/progression/daily` | POST | Daily login XP + streak |
| `/api/progression/prestige` | POST | Optional reset at Lv 100+ |

## How to earn (demo)

1. **Practice** — finish a Rift Battle on `/tcg/battle?mode=practice`. Server grants win/loss XP on match `COMPLETED` via `/api/tcg/match/turn`.
2. **Quests** — complete a quest on `/quests` (Advance until done). Calls `QUEST_COMPLETE` grant.
3. **Daily** — open any game page (top bar claims once/day) or `/progression` → Claim daily XP.
4. **Care** — Feed / Play a Riftling (keeper XP + pet mastery).
5. **Hatch** — hatch an egg (`RIFT_HATCH`).

## Rewards

- Every level: +5 Max HP, +2 Atk, +2 Def, +1 Speed, +1 Stat Point  
- Every 5: +1 Skill Point  
- Every 10: cosmetic  
- Every 25: title  
- Every 50: Rift Aura  
- Every 100: Prestige unlock  

## Prestige

At 100+, optional reset to Level 1. Keeps cosmetics, collections, cards, pets, titles. Grants badge, aura, prestige number, +2% XP per prestige.

## Anti-farm

No XP for AFK, surrender-farm, or bot matches. Repeat wins vs the same opponent diminish (100% → 70% → 40% → 15%).

## Prisma

Models: `PlayerProgression`, `ProgressXpEvent`. Off by default (`KEEPER_PROGRESSION_PRISMA_ENABLED: false`); in-memory store is authoritative for guests/local.
