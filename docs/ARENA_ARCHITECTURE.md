# Riftwilds Arena — Architecture & Compliance

## Compliance boundary (non-negotiable)

`REAL_VALUE_WAGERING_ENABLED = false` permanently for launch.

**Forbidden at launch:** staking/betting/escrowing SOL, project token, stablecoins, NFTs, eggs, pets, marketplace items, purchased VC, redeemable points, or anything transferable/cash-equivalent. No on-chain betting pools, sportsbooks, P2P wager contracts, or odds markets.

**Allowed:** skill-based turn battles, non-purchasable **Arena Points** (earn-only, non-transferable, non-redeemable, seasonal reset), free tournaments with predetermined project/sponsor prizes (sponsor cash prizes only after legal approval — flag off), spectator mode, **Community Predictions** with **no stake and no prize**.

Arena Points must never buy tradable pets/eggs/weapons/tokens/NFTs.

---

## 1. Battle architecture

```
Client (React + Phaser presentation)
    │  SELECT_ACTION / READY / SURRENDER
    ▼
Next.js API / Arena service (auth, ownership, queues)
    │
    ▼
Authoritative Battle Engine (pure TS, server-only)
    │  seed + balanceVersion + affinityVersion + actions
    ▼
Postgres (Battle*, snapshots, ArenaPointLedger, replays)
```

- Browser never decides damage, accuracy, crits, winner, or AP awards.
- Phase 1: synchronous server resolution for AI training (no websocket yet).
- Phase 2+: dedicated battle process + realtime protocol.

## 2. Turn-resolution algorithm

1. Both sides submit hidden actions (or AI chooses).  
2. Lock selections; server commits.  
3. Expand actions with priority (Defend/Focus > Basic > Ability > Ultimate; Speed breaks ties; seed RNG last).  
4. For each action in order: accuracy check → damage/heal/status → energy spend → cooldowns.  
5. Emit ordered event log for client animation.  
6. Check faint / surrender / max rounds → finalize.  
7. Restore battle HP to pet care state (no permanent kill from duels).  

## 3. Damage formula (Arena)

Reuse Project Hatch model with Arena caps:

```
baseImpact = abilityPower × attackerStat ÷ max(defenderStat, 1)
modified = baseImpact × affinityMod × levelScale × random(0.92–1.08)
           × critMod × statusMod × equipMod(normalized)
final = clamp(round(modified), 1, maxDamage)
```

Equipment in **ranked** uses Option A normalization: equip contribution capped ≤ 18% of effective power. Casual open-loadout may use full equip mods.

## 4. Affinity matrix

Versioned `ARENA_AFFINITY_MATRIX_V1` — modest bands: 1.15 / 1.25 advantage, 0.85 / 0.75 resist. No 2×/4×. Historical battles store `affinityVersion`.

## 5. Equipment balance rules

- Slots: weapon, armor, charm, cosmetic.  
- Ranked: normalize stats (visuals preserved).  
- Charge meter (not destructive durability); ranked may ignore charge.  
- Crafting: earnable materials; deterministic default; no paid RNG loot boxes.

## 6. Matchmaking design

Queues: Casual, Ranked, Training, Tournament, Private. Inputs: rating, latency, level, power bracket, equip mode, queue time, recent opponents, trust score. Anti-farm: rematch reduction, same-opponent cooldown.

## 7. Anti-cheat threat model

| Threat | Mitigation |
|--------|------------|
| Client damage forgery | Server engine only |
| Action after timeout | Reject + default action |
| Duplicate rewards | Idempotency + unique constraints |
| Win trading | Detection signals + admin review |
| Equipment spoof | Snapshot inventory at lock |
| Seed preview abuse | Commit-reveal; no early seed leak |
| Disconnect abuse | Limited pause; loss on repeat |

## 8. Database migration plan

Append Arena models (`Battle`, `DuelChallenge`, `WeaponDefinition`, `ArenaPointLedger`, …). Soft-launch with `ARENA_ENABLED=true` for training only; ranked/tournaments flagged off. Migrations via Prisma; no rewrite of completed battle rows.

## 9. Realtime protocol

Phase 2 messages: `JOIN_BATTLE`, `READY`, `SELECT_ACTION`, `SURRENDER`, `BATTLE_SNAPSHOT`, `ACTIONS_REVEALED`, `ACTION_RESOLVED`, `BATTLE_ENDED`, … Protocol versioned. Phase 1 uses REST `POST /api/arena/training/turn`.

## 10. Art asset list

Arena BGs, battle sprites, weapon/armor overlays, VFX, bars, ability icons, timer, victory/defeat, spectator stands, crowd pets. Weapon prompts: `asset-prompts/weapons/`. Stylized, non-graphic defeat (tired/sit/portal retreat).

## 11. Compliance feature boundaries

| Flag | Default |
|------|---------|
| ARENA_ENABLED | true (training) |
| CASUAL_DUELS_ENABLED | false |
| RANKED_DUELS_ENABLED | false |
| TOURNAMENTS_ENABLED | false |
| WEAPONS_ENABLED | true |
| EQUIPMENT_CRAFTING_ENABLED | false |
| SPECTATOR_MODE_ENABLED | false |
| COMMUNITY_PREDICTIONS_ENABLED | false |
| ARENA_POINTS_ENABLED | true (earn-only) |
| SPONSORED_PRIZES_ENABLED | false |
| **REAL_VALUE_WAGERING_ENABLED** | **false** (no normal admin toggle) |

## 12. Development checklist

- [x] Architecture doc (this file)
- [x] Phase 1 combat engine + AI training (`src/game/arena/*`, `/arena/training`)
- [x] Loadout + 10 starter weapons + 30+ art prompts (`asset-prompts/weapons/`)
- [x] Ability selection UI + results + history
- [x] Unit tests (`tests/unit/arena-engine.test.ts`)
- [x] Feature flags + Prisma Arena models + `/admin/arena` shell
- [x] Compliance: `REAL_VALUE_WAGERING_ENABLED=false` (no admin toggle)
- [ ] Phase 2 friend duels + websocket battle server
- [ ] Phase 3 ranked + anti-cheat analytics
- [ ] Phase 4 free tournaments + Live World Arena

