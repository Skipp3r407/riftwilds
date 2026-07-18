# Living World Retention Roadmap

Prioritize systems that create **stories** and a **living world**. Soft Credits for casual rewards — never SOL / never AFK-farm valuable loot. Original Riftwilds IP only.

Coordinate with: Living Server Population, Art Direction, Live World, Rift Storm, NPC AI, exploration map, economy.

---

## Top 10 (delivery order)

| # | Feature | Status | Extends |
| ---: | --- | --- | --- |
| 1 | Dynamic World Events | **Landed** (this pass) | Live World, map markers, presence HUD, disasters (parallel) |
| 2 | Player-Owned Cities | **Landed** (core) | Land parcels, housing economy |
| 3 | Riftling Genetics | **Landed** (extended) | Genetics v2, breeding, hatchery seeds |
| 4 | Living NPC Relationships | **Landed** (extended) | npc-ai relationships / reputation / memory |
| 5 | Housing Competitions | **Landed** (core) | Homestead economy, social presence home visits |
| 6 | Hidden Lore & Secret Discoveries | **Landed** (core) | Exploration / treasure / codex |
| 7 | Daily Server Newspaper | **Landed** (core) | World events, presence, festivals feeds |
| 8 | Open-World Bosses | **Landed** (core) | World events `wandering_world_boss` + boss engine |
| 9 | Expanded Life Skills | **Landed** (core) | Gathering / craft / care loops (Credits sinks) |
| 10 | Seasonal Festivals | **Landed** (extended) | Existing festival calendar |

---

## Full idea list (20)

### Top 10 (above)

1. Dynamic World Events  
2. Player-Owned Cities  
3. Riftling Genetics  
4. Living NPC Relationships  
5. Housing Competitions  
6. Hidden Lore & Secret Discoveries  
7. Daily Server Newspaper  
8. Open-World Bosses  
9. Expanded Life Skills  
10. Seasonal Festivals  

### Additional retention ideas (backlog order)

11. Legendary discoveries — rare one-time finds tied to exploration + newspaper front page  
12. Photo mode expansion — event / festival / housing contest capture hooks  
13. City billboards — player-city messaging + sponsored cosmetics (Credits)  
14. Exploration rewards — soft Credits / lore scraps; anti-AFK gated  
15. Music system — regional beds + festival / circus performance XP (presence)  
16. Dynamic economy — vendor stock / caravan prices react to events (never P2W SOL)  
17. Seasonal world changes — clock + festival + disaster visual layers  
18. Puzzle dungeons — instanced story rooms; not AFK farms  
19. Player fame — Town Featured + newspaper bylines + city renown  
20. Cinematic moments — event announce / boss intro stubs; full sync backlog  

---

## Dependencies on existing systems

| System | Dependency |
| --- | --- |
| Live World Phaser shell | HUD banners, participation CTAs, region presence |
| Social presence | Happening now merge, anti-AFK patterns, home visits |
| Exploration map | World event / boss / secret markers |
| Living World clock / disasters | Seasonal tone; parallel to scheduled events |
| Rift Storm | Separate loyalty airdrops — do not merge economies |
| NPC AI / reputation | Relationship deeds, event reactions, temp quests |
| Land + housing Credits | Cities + competitions |
| Genetics v2 + breeding | Pedigree / lineage stories |
| Festival calendar | Seasonal festivals participation |
| Credits ledger | `EVENT_REWARD` and related faucets — capped, never SOL |

---

## Phased delivery notes

### Phase A — Stories online (this pass)

- [x] Dynamic World Events engine + admin + HUD + tests + docs  
- [x] Player cities charter / districts / billboards stub  
- [x] Genetics pedigree + lineage API surface  
- [x] Server NPC relationship deeds (extends client npc-ai)  
- [x] Housing competitions seasons  
- [x] Hidden lore registry + discover API  
- [x] Daily newspaper generator  
- [x] Open-world boss HP stub (honest multiplayer backlog)  
- [x] Life skills XP tracks  
- [x] Festival join / board extension  

### Phase B — Multiplayer scale (backlog)

- [ ] 100-player boss sync / interest management  
- [ ] Persistent Prisma for cities, newspaper archive, lore unlocks  
- [ ] City instance streaming + navigation mesh ownership zones  
- [ ] Genetics visualization polish (Art Direction)  
- [ ] Newspaper push notifications / town crier VO  

### Phase C — Spectacle polish

- [ ] Cinematic cameras, legendary discovery VFX, seasonal terrain swaps  
- [ ] Puzzle dungeons + music performance minigames  

---

## Progress log

| When | Item | Notes |
| --- | --- | --- |
| 2026-07-18 | #1 Dynamic World Events | Catalog (10), scheduler, participation anti-AFK, HUD, map, admin, tests |
| 2026-07-18 | Roadmap | This document — full 20 + top 10 |
| 2026-07-18 | #2 Player-Owned Cities | Charter, districts, civic roles, billboards (Credits) |
| 2026-07-18 | #3 Riftling Genetics | Pedigree / lineage / story traits on genetics-v2 |
| 2026-07-18 | #4 Living NPC Relationships | Server deed ledger + bond tiers |
| 2026-07-18 | #5 Housing Competitions | Seasonal contests + judging stubs |
| 2026-07-18 | #6 Hidden Lore | Secret discovery registry |
| 2026-07-18 | #7 Newspaper | Daily issue from live world feeds |
| 2026-07-18 | #8 Open-World Bosses | Boss instance engine over world events |
| 2026-07-18 | #9 Life Skills | Expanded skill tracks |
| 2026-07-18 | #10 Seasonal Festivals | Join / board / rewards stubs |

---

## Reward & safety rules (standing)

- Casual rewards = **Credits** / cosmetics / lore / titles — **not SOL**.  
- Never AFK-farm valuable loot; reuse presence / world-event anti-AFK.  
- Do not rebuild working systems — extend.  
- No git commit/push/merge/deploy from agents without approval.  
