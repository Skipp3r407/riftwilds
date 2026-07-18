# Dynamic NPC Reputation, Crime, Fear & Social Reaction

**Extends** living NPC AI (`src/game/npc-ai/`) — does not rebuild schedules, attention, or killer notice.  
Killer/notoriety is **one axis among many**, personality- and faction-gated.

## Multi-axis player reputation

Stored in `localStorage` key `riftwilds-player-reputation-v1` via `reputation.ts`.

| Axis | Role |
|---|---|
| Hero | Commons praise, salutes, soft discounts |
| Town | Local standing / restoration favor |
| Guild / Faction | Stub hooks for future guild wars |
| Merchant | Fair-trade favor |
| Criminal / Notoriety / Infamy | Dark fame — feared or admired by faction |
| Honor / Mercy / Cruelty / Trust | Moral texture |
| Monster Hunter / Explorer | Strength & trail fame |

Killer counters (`pvpKills`, `bountyTier`, flags) **feed** Notoriety / Criminal / Infamy / Cruelty via `syncReputationFromKiller`. Training `enemiesDefeated` alone still does **not** make you a known killer.

## Personality + faction values

`personality-traits.ts` normalizes authored traits (brave, cowardly, greedy, kind, lawful, corrupt, outlaw…) and maps occupations to faction value systems:

- Commons guards favor honor/town; fear notoriety  
- Bandits favor notoriety/criminal; scorn pure heroes  
- Honest merchants vs black-market (corrupt) merchants  
- Temple values mercy; mercenaries value strength  

## Reaction matrix (`social-reactions.ts`)

| Audience | Hero | High notoriety |
|---|---|---|
| Children | Wave | Hide / cower |
| Guards | Salute | Watch → challenge → arrest stub |
| Merchants | Discount | Wary / lock shop (honest) |
| Black market | — | Illegal work offers |
| Bandits | Condemn | Respect / recruit |
| Mercenaries / arena | Mild | Admire strength |
| Kind / priests | Praise | Condemn |

Nearby NPCs evaluate in real time (`living-runtime` + LOD). Far NPCs keep schedule-only background ticks.

## Witnesses (`witnesses.ts` + `crime-pipeline.ts`)

Crimes only bump notoriety when **town witnesses** are in range. Witnesses flee, cower, warn guards, or spread rumor. Bandit-only observers do **not** count as town witnesses (no plaza heat).

## Gossip lag (`gossip.ts`)

Rumors seed in an origin region and hop to neighbors over `GOSSIP_HOP_MS` — **not** instant world knowledge. `knownReputationInRegion` blends true axes with regional awareness for dialogue/reactions.

## Memory (`npc-memory-events.ts` + relationships)

Structured events: helped / attacked / family / quest / promise / witnessed_crime / forgave / traded. Personal hostility or gratitude can override gossip tone in dialogue.

## Forgiveness (`forgiveness.ts`)

| Path | Cost | Notes |
|---|---|---|
| Fine | Credits | Never SOL |
| Jail | Stub timer | Full sentencing backlog |
| Community service | Quest key | Ledger quests |
| Donate / rebuild | Credits or labor | Town + mercy |
| Heroic deed | None | Strong hero/mercy repair |

## Dialogue

`reputation-dialogue.ts` + `npcs/dialogue.ts` prefix lines from social reaction / memory / identity. Shop choices strip when `merchantWary` / `shopLocked`.

## Indicators

Original IP SVGs: `respect.svg`, `wary.svg` (plus existing fear/praise/quest/story/chat).

## Honest backlog

- Full jail / court sentencing loop  
- Server-authoritative reputation + gossip  
- Full faction wars / guild politics  
- Black-market economy catalog  
- Family-link graph across NPCs  
- Navmesh flee into buildings  

## QA notes

1. Spawn as hero (`hero_deed` flag / high hero axes) in Commons — children wave, Orren salutes, Tessa discounts.  
2. Raise witnessed murder heat — Mim hides, Tessa locks/wary, Orren challenges/arrests, bandit type respects.  
3. Seed gossip in Commons; confirm Moonwater awareness stays low until hop delay.  
4. Unwitnessed crime at empty coords — axes unchanged.  
5. Pay fine with Credits only; confirm no SOL gate.  
6. Unit: `tests/unit/npc-reputation-system.test.ts` + existing `npc-living-ai.test.ts`.
