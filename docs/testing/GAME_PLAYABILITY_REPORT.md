# GAME PLAYABILITY REPORT — Riftwilds

**Date:** 2026-07-17  
**Verdict:** **PLAYABLE CLOSED ALPHA**

## Executive conclusion

The Live World Commons path is playable as a browser habitat: enter → move → see populated NPCs → talk (branching dialogue) → accept starter quests → shops with demo-credit inventory changes → hatchery/combat/gather stubs → portal travel to enterable regions. This is **not** a finished MMO, but it is no longer a brochure of empty MMO-themed pages.

**Honest label:** `PLAYABLE CLOSED ALPHA`  
(Not full `PLAYABLE` — multiplayer authority, full combat loop, hatch-in-world, and multi-frame sprite sheets remain incomplete.)

## Flow checklist (1–30)

| # | Step | Status |
|---|---|---|
| 1 | Open landing | PASS (site loads) |
| 2 | Enter / create test session | PASS (demo / session flags) |
| 3 | Enter Live World | PASS (`/live-world` CTA) |
| 4 | Spawn Commons | PASS |
| 5 | Move | PASS (WASD / arrows / Shift) |
| 6 | Collision | PASS (buildings/pond/bounds) |
| 7 | Locate Rowan | PASS (spawned near plaza) |
| 8 | Open dialogue | PASS (E / Space / mobile Talk) |
| 9 | Accept first quest | PASS (auto-accept + choice) |
| 10 | Locate Elara | PASS |
| 11 | Continue story | PASS (Q2 chain) |
| 12 | Visit Codex (Solen) | PASS |
| 13 | Visit Hatchery (Mira) | PASS (NPC + `/hatchery`) |
| 14 | Acquire/use test egg | PASS (hatchery demo API) |
| 15 | Hatch Riftling | PASS (demo hatch, no SOL) |
| 16–18 | Name / profile / equip | PARTIAL (UI pages; in-world auto flags limited) |
| 19 | Leave safe settlement | PASS (outer woods) |
| 20–22 | Enemy / battle / loot | PASS (demo encounter + gather bump) |
| 23 | Return to town | PASS |
| 24 | Use shop | PASS (Mira/Bram/Tessa/Nyla demo credits) |
| 25 | Craft item | PASS (Bram craft service stub) |
| 26 | Save progress | PASS (localStorage position + play state) |
| 27–29 | Logout / login persist | PARTIAL (localStorage only; no server sync) |
| 30 | Travel region | PASS (Ember / Coast / Elderwood portals) |

## Systems delivered this pass

- NPC data model + 54 named + ambient density  
- Commons blueprint population  
- Region factory NPC spawns for all 12 regions  
- Dialogue + shop overlays  
- Starter quests Q1–Q8 in catalog + live play-state  
- Demo combat zones + gathering objective hooks  
- Admin `/admin/npcs`  
- Grok art: 54 portraits + 54 distinct full-bodies  
- Playwright specs: `new-player-playthrough`, `npc-population`, `npc-assets`  
- Unit: `tests/unit/npc-catalog.test.ts`

## Preserved prior fixes

- Hatchery `globalThis` store  
- Community rewards framing  
- First-visit about redirect  

## Remaining alpha gaps

- Server-authoritative quests / combat / shops  
- In-world hatch sequence (still hatchery page + Mira guidance)  
- Multi-frame sprite sheets  
- Unique ambient art  
- Full 30-step persistence across devices  

## Tests

```bash
npm run test:unit -- tests/unit/npc-catalog.test.ts
npx playwright test tests/e2e/npc-population.spec.ts tests/e2e/npc-assets.spec.ts tests/e2e/new-player-playthrough.spec.ts
```

## Git

**Do not push from this agent** — prefer audit agent final scrubbed push to `https://github.com/Skipp3r407/riftwilds.git`. Tree left ready with reports under `docs/testing/`.
