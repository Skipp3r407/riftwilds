# Game Playability Report — Riftwilds

**Date:** 2026-07-17  
**Verdict:** **PLAYABLE CLOSED ALPHA**

## Checklist

| Question | Result |
|----------|--------|
| Can the game be entered? | **Yes** — `/live-world` → ENTER THE LIVE WORLD → Phaser canvas (verified on `next start :3010`) |
| Can the player move? | **Yes** — WASD / arrows / Shift in CommonsScene (Phase 1 local) |
| Can the player interact? | **Yes** — E / Space NPC dialogue with branching choices |
| Can the first Riftling be hatched? | **Yes** — Mira hatch service + `/hatchery` demo APIs |
| Can combat be completed? | **Yes** — outer-woods demo combat stub + Orren quest objectives |
| Can an item be crafted? | **Yes** — Bram `craft_basic` → Starter Pick |
| Can another region be reached? | **Yes** — portals to Ember / Coast / Elderwood stubs |
| Does progress save? | **Yes** — `localStorage` live play state + position save |
| Named NPC art present? | **Yes** — 54/54 generated portraits installed |

## Tests

| Suite | Result |
|-------|--------|
| `tests/unit/npc-catalog.test.ts` | Passed |
| `tests/unit/npc-assets.test.ts` | Passed |
| `tests/unit/starter-playthrough.test.ts` (quests 1–8) | Passed |
| `tests/e2e/npc-assets.spec.ts` | Passed (16 total e2e with siblings) |
| `tests/e2e/npc-population.spec.ts` | Passed |
| `tests/e2e/new-player-playthrough.spec.ts` | Passed against production `next start` |
| `npx tsc --noEmit` | Passed |
| `npm run build` | Passed |

**Note:** Turbopack `next dev` on this machine failed to hydrate client components (dead Enter button). Production `next build && next start` works. Prefer production for playtesting.

## Features completed

- 54 named NPCs + ambient density across 12 regions
- Structured catalog (`catalog.generated.ts`) — not hardcoded in pages
- Branching dialogue, shops (demo credits), services
- Starter quest chain Q1–Q8
- Commons populated in blueprint; enterable regions patched
- Admin NPC management page
- Grok-generated portraits for all named NPCs
- BootScene loads Commons NPC portrait textures

## Remaining blockers / alpha gaps

- Dedicated full-body / walk-cycle sprite sheets still mostly portrait stand-ins
- Ambient NPC art is labeled placeholders
- Live World multiplayer still Phase 1 local-authoritative
- Full Phaser input path (WASD→talk→quest markers) not fully e2e-automated beyond enter+canvas

## How to play locally

```bash
npm run build
npx next start -p 3010
# open http://127.0.0.1:3010/live-world
```
